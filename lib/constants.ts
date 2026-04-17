export const GEOJSON_URL = "/geo/world-simplified.geo.json";

export const STALE_TIME_LONG = 24 * 60 * 60 * 1000; // 24h
export const STALE_TIME_WEATHER = 30 * 60 * 1000; // 30m

export const DATA_SOURCES = [
  { id: "worldbank", label: "World Bank" },
  { id: "openmeteo", label: "Open-Meteo" },
  { id: "unesco", label: "UNESCO" },
] as const;
