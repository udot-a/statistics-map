import { describe, expect, it } from "vitest";
import type { FeatureCollection, Geometry, Polygon } from "geojson";
import {
  bboxOf,
  featureCenter,
  filterFeatures,
  normalizeFeatureCollection,
  uniqueCountries,
  uniqueSubregions,
  findByIso3,
} from "@/lib/geojson";
import type { RawCountryProperties } from "@/types/geo";

function makePolygon(xRange: [number, number], yRange: [number, number]): Polygon {
  const [x1, x2] = xRange;
  const [y1, y2] = yRange;
  return {
    type: "Polygon",
    coordinates: [
      [
        [x1, y1],
        [x2, y1],
        [x2, y2],
        [x1, y2],
        [x1, y1],
      ],
    ],
  };
}

function makeRaw(
  iso: string,
  continent: string,
  subregion: string,
  geom: Polygon,
  extra: Partial<RawCountryProperties> = {},
) {
  return {
    type: "Feature" as const,
    geometry: geom as Geometry,
    properties: {
      ISO_A3: iso,
      ADM0_A3: iso,
      NAME: iso,
      CONTINENT: continent,
      REGION_UN: continent,
      SUBREGION: subregion,
      ...extra,
    } as RawCountryProperties,
  };
}

const sampleRaw: FeatureCollection<Geometry, RawCountryProperties> = {
  type: "FeatureCollection",
  features: [
    makeRaw("FRA", "Europe", "Western Europe", makePolygon([0, 10], [40, 50])),
    makeRaw("DEU", "Europe", "Western Europe", makePolygon([5, 15], [45, 55])),
    makeRaw("EGY", "Africa", "Northern Africa", makePolygon([25, 35], [22, 32])),
    makeRaw("BAD", "Seven seas (open ocean)", "Seven seas (open ocean)", makePolygon([0, 1], [0, 1])),
    {
      type: "Feature" as const,
      geometry: makePolygon([0, 1], [0, 1]) as Geometry,
      properties: {
        ISO_A3: "-99",
        ADM0_A3: "-99",
        NAME: "Disputed",
        CONTINENT: "Europe",
        REGION_UN: "Europe",
        SUBREGION: "Western Europe",
      } as RawCountryProperties,
    },
  ],
};

describe("normalizeFeatureCollection", () => {
  it("drops entries without valid iso or on the excluded continent", () => {
    const fc = normalizeFeatureCollection(sampleRaw);
    const isos = fc.features.map((f) => f.properties.iso3).sort();
    expect(isos).toEqual(["DEU", "EGY", "FRA"]);
  });

  it("falls back to ADM0_A3 when ISO_A3 is -99", () => {
    const raw: FeatureCollection<Geometry, RawCountryProperties> = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: makePolygon([0, 10], [40, 50]) as Geometry,
          properties: {
            ISO_A3: "-99",
            ADM0_A3: "KOS",
            NAME: "Kosovo",
            CONTINENT: "Europe",
            REGION_UN: "Europe",
            SUBREGION: "Southern Europe",
          },
        },
      ],
    };
    const fc = normalizeFeatureCollection(raw);
    expect(fc.features[0]?.properties.iso3).toBe("KOS");
  });

  it("computes centroid from bbox when LABEL_X/Y missing", () => {
    const fc = normalizeFeatureCollection(sampleRaw);
    const fra = fc.features.find((f) => f.properties.iso3 === "FRA")!;
    expect(fra.properties.lon).toBeCloseTo(5, 5);
    expect(fra.properties.lat).toBeCloseTo(45, 5);
  });

  it("prefers LABEL_X/Y when provided", () => {
    const raw: FeatureCollection<Geometry, RawCountryProperties> = {
      type: "FeatureCollection",
      features: [
        makeRaw("FRA", "Europe", "Western Europe", makePolygon([0, 10], [40, 50]), {
          LABEL_X: 2.35,
          LABEL_Y: 48.85,
        }),
      ],
    };
    const fc = normalizeFeatureCollection(raw);
    expect(fc.features[0]?.properties.lon).toBeCloseTo(2.35);
    expect(fc.features[0]?.properties.lat).toBeCloseTo(48.85);
  });
});

describe("filterFeatures", () => {
  const fc = normalizeFeatureCollection(sampleRaw);

  it("returns all when subregion=ALL", () => {
    expect(filterFeatures(fc, "ALL").features.length).toBe(3);
  });

  it("filters by subregion", () => {
    const res = filterFeatures(fc, "Western Europe");
    expect(res.features.map((f) => f.properties.iso3).sort()).toEqual(["DEU", "FRA"]);
  });

  it("returns empty for unknown subregion", () => {
    expect(filterFeatures(fc, "Mars").features).toEqual([]);
  });
});

describe("misc helpers", () => {
  const fc = normalizeFeatureCollection(sampleRaw);
  it("uniqueSubregions returns distinct subregions", () => {
    expect(uniqueSubregions(fc).sort()).toEqual(["Northern Africa", "Western Europe"]);
  });
  it("uniqueCountries respects subregion scope and sorts by name", () => {
    const all = uniqueCountries(fc, "ALL").map((c) => c.properties.iso3);
    expect(all.sort()).toEqual(["DEU", "EGY", "FRA"]);
    const eu = uniqueCountries(fc, "Western Europe").map((c) => c.properties.iso3);
    expect(eu.sort()).toEqual(["DEU", "FRA"]);
  });
  it("bboxOf aggregates across features", () => {
    const bbox = bboxOf(fc);
    expect(bbox).not.toBeNull();
    const [minX, minY, maxX, maxY] = bbox!;
    expect(minX).toBeCloseTo(0);
    expect(minY).toBeCloseTo(22);
    expect(maxX).toBeCloseTo(35);
    expect(maxY).toBeCloseTo(55);
  });
  it("findByIso3 returns matching feature", () => {
    expect(findByIso3(fc, "FRA")?.properties.name).toBe("FRA");
    expect(findByIso3(fc, "XXX")).toBeUndefined();
  });
  it("featureCenter uses fallback when provided", () => {
    const c = featureCenter(makePolygon([0, 10], [0, 10]), 7, 3);
    expect(c).toEqual({ lat: 3, lon: 7 });
  });
});
