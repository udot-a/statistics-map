import type { Feature, FeatureCollection, Geometry } from "geojson";

export type RawCountryProperties = {
  ISO_A3: string;
  ADM0_A3: string;
  NAME: string;
  NAME_LONG?: string;
  FORMAL_EN?: string;
  CONTINENT: string;
  REGION_UN: string;
  SUBREGION: string;
  LABEL_X?: number;
  LABEL_Y?: number;
  POP_EST?: number;
  GDP_MD?: number;
};

export type CountryProperties = {
  iso3: string;
  name: string;
  formalName: string;
  continent: string;
  regionUn: string;
  subregion: string;
  lat: number;
  lon: number;
};

export type CountryFeature = Feature<Geometry, CountryProperties>;
export type CountryFeatureCollection = FeatureCollection<Geometry, CountryProperties>;

export type Continent = "ALL" | string;
export type Subregion = "ALL" | string;

export type DataSourceId = "worldbank" | "openmeteo" | "unesco";
