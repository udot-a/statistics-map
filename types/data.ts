export type SeriesPoint = { year: number; value: number };

export type WorldBankIndicators = {
  population: SeriesPoint[];
  gdpUsd: SeriesPoint[];
  lifeExpectancy: SeriesPoint[];
};

export type WorldBankResponse =
  | { ok: true; iso3: string; data: WorldBankIndicators }
  | { ok: false; iso3: string; message: string };

export type OpenMeteoCurrent = {
  temperatureC: number;
  humidity: number | null;
  windKph: number | null;
  weatherCode: number;
  time: string;
};

export type OpenMeteoResponse =
  | { ok: true; iso3: string; lat: number; lon: number; data: OpenMeteoCurrent }
  | { ok: false; iso3: string; message: string };

export type UnescoSite = {
  id: string;
  name: string;
  category: "cultural" | "natural" | "mixed" | string;
  dateInscribed: number | null;
  shortDescription?: string;
};

export type UnescoResponse =
  | { ok: true; iso3: string; count: number; sites: UnescoSite[] }
  | { ok: false; iso3: string; message: string };
