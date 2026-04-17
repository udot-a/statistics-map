import type { Feature, FeatureCollection, Geometry, Position } from "geojson";
import type {
  CountryFeature,
  CountryFeatureCollection,
  CountryProperties,
  RawCountryProperties,
} from "@/types/geo";

const ALLOWED_CONTINENTS = new Set([
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
  "Antarctica",
]);

function computeBbox(geometry: Geometry): [number, number, number, number] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const visit = (coords: unknown): void => {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === "number" && typeof coords[1] === "number") {
      const [x, y] = coords as Position;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      return;
    }
    for (const c of coords) visit(c);
  };

  if ("coordinates" in geometry) visit((geometry as { coordinates: unknown }).coordinates);
  return [minX, minY, maxX, maxY];
}

export function featureCenter(
  geometry: Geometry,
  fallbackX?: number,
  fallbackY?: number,
): { lat: number; lon: number } {
  if (
    typeof fallbackX === "number" &&
    typeof fallbackY === "number" &&
    Number.isFinite(fallbackX) &&
    Number.isFinite(fallbackY)
  ) {
    return { lat: fallbackY, lon: fallbackX };
  }
  const [minX, minY, maxX, maxY] = computeBbox(geometry);
  return { lat: (minY + maxY) / 2, lon: (minX + maxX) / 2 };
}

export function normalizeFeatureCollection(
  raw: FeatureCollection<Geometry, RawCountryProperties>,
): CountryFeatureCollection {
  const features: CountryFeature[] = [];
  for (const feat of raw.features) {
    const p = feat.properties ?? ({} as RawCountryProperties);
    const iso3 = (p.ISO_A3 && p.ISO_A3 !== "-99" ? p.ISO_A3 : p.ADM0_A3) ?? "";
    if (!iso3 || iso3 === "-99") continue;
    if (!ALLOWED_CONTINENTS.has(p.CONTINENT)) continue;
    const center = featureCenter(feat.geometry, p.LABEL_X, p.LABEL_Y);

    const props: CountryProperties = {
      iso3,
      name: p.NAME_LONG || p.NAME || iso3,
      formalName: p.FORMAL_EN || p.NAME_LONG || p.NAME || iso3,
      continent: p.CONTINENT,
      regionUn: p.REGION_UN,
      subregion: p.SUBREGION,
      lat: center.lat,
      lon: center.lon,
    };

    features.push({
      type: "Feature",
      id: iso3,
      geometry: feat.geometry,
      properties: props,
    });
  }
  return { type: "FeatureCollection", features };
}

export function filterFeatures(
  fc: CountryFeatureCollection,
  continent: string,
  subregion: string,
): CountryFeatureCollection {
  const features = fc.features.filter((f) => {
    const p = f.properties;
    if (continent !== "ALL" && p.continent !== continent) return false;
    if (subregion !== "ALL" && p.subregion !== subregion) return false;
    return true;
  });
  return { type: "FeatureCollection", features };
}

export function uniqueContinents(fc: CountryFeatureCollection): string[] {
  return [...new Set(fc.features.map((f) => f.properties.continent))].sort();
}

export function uniqueSubregions(
  fc: CountryFeatureCollection,
  continent: string,
): string[] {
  const scope =
    continent === "ALL"
      ? fc.features
      : fc.features.filter((f) => f.properties.continent === continent);
  return [...new Set(scope.map((f) => f.properties.subregion))].sort();
}

export function bboxOf(fc: CountryFeatureCollection): [number, number, number, number] | null {
  if (fc.features.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const f of fc.features) {
    const [nx, ny, xx, xy] = computeBbox(f.geometry);
    if (nx < minX) minX = nx;
    if (ny < minY) minY = ny;
    if (xx > maxX) maxX = xx;
    if (xy > maxY) maxY = xy;
  }
  return [minX, minY, maxX, maxY];
}

export function findByIso3(
  fc: CountryFeatureCollection,
  iso3: string,
): CountryFeature | undefined {
  return fc.features.find((f) => f.properties.iso3 === iso3);
}

// Test-only helper: take a raw feature and produce normalized props via a narrow path
export function __testNormalizeProps(p: RawCountryProperties, geometry: Geometry) {
  return normalizeFeatureCollection({
    type: "FeatureCollection",
    features: [
      { type: "Feature", geometry, properties: p } as Feature<Geometry, RawCountryProperties>,
    ],
  }).features[0]?.properties;
}
