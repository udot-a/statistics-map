"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import L, { type LatLngBoundsExpression, type Layer, type PathOptions } from "leaflet";
import { useTheme } from "next-themes";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { Feature, Geometry } from "geojson";
import type { CountryFeatureCollection, CountryProperties } from "@/types/geo";
import {
  bboxOf,
  filterFeatures,
  findByIso3,
  normalizeFeatureCollection,
} from "@/lib/geojson";
import { useFiltersStore } from "@/stores/filters.store";
import { useCountriesGeoJson } from "@/hooks/use-country-data";

const TILE_OSM = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_OSM_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const TILE_CARTO_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_CARTO_DARK_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>';

const PATH_LIGHT = {
  base: {
    color: "#3f3f46",
    weight: 0.6,
    fillColor: "#60a5fa",
    fillOpacity: 0.25,
  },
  hover: {
    color: "#111827",
    weight: 2,
    fillColor: "#2563eb",
    fillOpacity: 0.55,
  },
  selected: {
    color: "#111827",
    weight: 2.5,
    fillColor: "#f59e0b",
    fillOpacity: 0.65,
  },
} as const satisfies Record<string, PathOptions>;

const PATH_DARK = {
  base: {
    color: "#71717a",
    weight: 0.7,
    fillColor: "#3b82f6",
    fillOpacity: 0.38,
  },
  hover: {
    color: "#e4e4e7",
    weight: 2,
    fillColor: "#60a5fa",
    fillOpacity: 0.62,
  },
  selected: {
    color: "#fde68a",
    weight: 2.5,
    fillColor: "#f59e0b",
    fillOpacity: 0.72,
  },
} as const satisfies Record<string, PathOptions>;

function FitToFiltered({ fc }: { fc: CountryFeatureCollection }) {
  const map = useMap();
  useEffect(() => {
    const bbox = bboxOf(fc);
    if (!bbox) return;
    const [minX, minY, maxX, maxY] = bbox;
    const bounds: LatLngBoundsExpression = [
      [minY, minX],
      [maxY, maxX],
    ];
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 6, animate: true });
  }, [fc, map]);
  return null;
}

function FlyToSelected({
  fc,
  iso3,
}: {
  fc: CountryFeatureCollection;
  iso3: string | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!iso3) return;
    const feat = findByIso3(fc, iso3);
    if (!feat) return;
    const bbox = bboxOf({ type: "FeatureCollection", features: [feat] });
    if (!bbox) return;
    const [minX, minY, maxX, maxY] = bbox;
    map.flyToBounds(
      [
        [minY, minX],
        [maxY, maxX],
      ],
      { padding: [40, 40], maxZoom: 6, duration: 0.6 },
    );
  }, [fc, iso3, map]);
  return null;
}

function InvalidateOnMount() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 0);
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);
  return null;
}

export default function WorldMap() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const pathStyles = useMemo(() => (isDark ? PATH_DARK : PATH_LIGHT), [isDark]);
  const pathStylesRef = useRef(pathStyles);
  useLayoutEffect(() => {
    pathStylesRef.current = pathStyles;
  }, [pathStyles]);

  const { data: rawGeo, isLoading, error } = useCountriesGeoJson();
  const subregion = useFiltersStore((s) => s.subregion);
  const selectedIso3 = useFiltersStore((s) => s.selectedIso3);
  const selectCountry = useFiltersStore((s) => s.selectCountry);

  const normalized = useMemo<CountryFeatureCollection | null>(() => {
    if (!rawGeo) return null;
    return normalizeFeatureCollection(rawGeo as Parameters<typeof normalizeFeatureCollection>[0]);
  }, [rawGeo]);

  const filtered = useMemo<CountryFeatureCollection | null>(() => {
    if (!normalized) return null;
    return filterFeatures(normalized, subregion);
  }, [normalized, subregion]);

  const layerRefsByIso3 = useRef(new Map<string, Layer>());
  const geoJsonKey = subregion;

  useEffect(() => {
    const layers = layerRefsByIso3.current;
    for (const [iso3, layer] of layers.entries()) {
      const path = layer as L.Path;
      if (iso3 === selectedIso3) path.setStyle(pathStyles.selected);
      else path.setStyle(pathStyles.base);
    }
  }, [selectedIso3, pathStyles]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        Загружаем карту...
      </div>
    );
  }
  if (error || !filtered) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-500 dark:text-red-400">
        Не удалось загрузить карту
      </div>
    );
  }
  if (filtered.features.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        Для выбранных фильтров нет стран
      </div>
    );
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      maxZoom={8}
      worldCopyJump
      style={{ height: "100%", width: "100%" }}
      className="bg-zinc-50 dark:bg-zinc-900"
    >
      <TileLayer
        key={isDark ? "dark" : "light"}
        attribution={isDark ? TILE_CARTO_DARK_ATTR : TILE_OSM_ATTR}
        url={isDark ? TILE_CARTO_DARK : TILE_OSM}
      />
      <GeoJSON
        key={geoJsonKey}
        data={filtered}
        style={(feat) => {
          const iso3 = (feat as Feature<Geometry, CountryProperties> | undefined)?.properties?.iso3;
          return iso3 === selectedIso3 ? pathStyles.selected : pathStyles.base;
        }}
        onEachFeature={(feature, layer) => {
          const props = (feature as Feature<Geometry, CountryProperties>).properties;
          if (!props) return;
          layerRefsByIso3.current.set(props.iso3, layer);

          layer.bindTooltip(props.name, { sticky: true, direction: "top", offset: [0, -4] });

          layer.on({
            mouseover: (e) => {
              if (props.iso3 === selectedIso3) return;
              (e.target as L.Path).setStyle(pathStylesRef.current.hover);
              (e.target as L.Path).bringToFront();
            },
            mouseout: (e) => {
              if (props.iso3 === selectedIso3) return;
              (e.target as L.Path).setStyle(pathStylesRef.current.base);
            },
            click: () =>
              selectCountry({
                iso3: props.iso3,
                subregion: props.subregion,
              }),
          });
        }}
      />
      <FitToFiltered fc={filtered} />
      <FlyToSelected fc={filtered} iso3={selectedIso3} />
      <InvalidateOnMount />
    </MapContainer>
  );
}
