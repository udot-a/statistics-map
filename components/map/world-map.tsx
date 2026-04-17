"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import L, { type LatLngBoundsExpression, type Layer, type PathOptions } from "leaflet";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { Feature, Geometry } from "geojson";
import type { CountryFeatureCollection, CountryProperties } from "@/types/geo";
import { bboxOf, filterFeatures, normalizeFeatureCollection } from "@/lib/geojson";
import { useFiltersStore } from "@/stores/filters.store";
import { useCountriesGeoJson } from "@/hooks/use-country-data";

const BASE_STYLE: PathOptions = {
  color: "#3f3f46",
  weight: 0.6,
  fillColor: "#60a5fa",
  fillOpacity: 0.25,
};
const HOVER_STYLE: PathOptions = {
  color: "#111",
  weight: 2,
  fillColor: "#2563eb",
  fillOpacity: 0.55,
};
const SELECTED_STYLE: PathOptions = {
  color: "#111",
  weight: 2.5,
  fillColor: "#f59e0b",
  fillOpacity: 0.65,
};

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

export default function WorldMap() {
  const { data: rawGeo, isLoading, error } = useCountriesGeoJson();
  const continent = useFiltersStore((s) => s.continent);
  const subregion = useFiltersStore((s) => s.subregion);
  const selectedIso3 = useFiltersStore((s) => s.selectedIso3);
  const selectCountry = useFiltersStore((s) => s.selectCountry);

  const normalized = useMemo<CountryFeatureCollection | null>(() => {
    if (!rawGeo) return null;
    return normalizeFeatureCollection(rawGeo as Parameters<typeof normalizeFeatureCollection>[0]);
  }, [rawGeo]);

  const filtered = useMemo<CountryFeatureCollection | null>(() => {
    if (!normalized) return null;
    return filterFeatures(normalized, continent, subregion);
  }, [normalized, continent, subregion]);

  const layerRefsByIso3 = useRef(new Map<string, Layer>());
  const geoJsonKey = `${continent}|${subregion}`;

  useEffect(() => {
    const map = layerRefsByIso3.current;
    for (const [iso3, layer] of map.entries()) {
      const path = layer as L.Path;
      if (iso3 === selectedIso3) path.setStyle(SELECTED_STYLE);
      else path.setStyle(BASE_STYLE);
    }
  }, [selectedIso3]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Загружаем карту...
      </div>
    );
  }
  if (error || !filtered) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-500">
        Не удалось загрузить карту
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
      />
      <GeoJSON
        key={geoJsonKey}
        data={filtered}
        style={(feat) => {
          const iso3 = (feat as Feature<Geometry, CountryProperties> | undefined)?.properties?.iso3;
          return iso3 === selectedIso3 ? SELECTED_STYLE : BASE_STYLE;
        }}
        onEachFeature={(feature, layer) => {
          const props = (feature as Feature<Geometry, CountryProperties>).properties;
          if (!props) return;
          layerRefsByIso3.current.set(props.iso3, layer);

          layer.bindTooltip(props.name, { sticky: true, direction: "top", offset: [0, -4] });

          layer.on({
            mouseover: (e) => {
              if (props.iso3 === selectedIso3) return;
              (e.target as L.Path).setStyle(HOVER_STYLE);
              (e.target as L.Path).bringToFront();
            },
            mouseout: (e) => {
              if (props.iso3 === selectedIso3) return;
              (e.target as L.Path).setStyle(BASE_STYLE);
            },
            click: () => selectCountry(props.iso3),
          });
        }}
      />
      <FitToFiltered fc={filtered} />
    </MapContainer>
  );
}
