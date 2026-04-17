import type { SeriesPoint, WorldBankIndicators } from "@/types/data";

const INDICATORS = {
  population: "SP.POP.TOTL",
  gdpUsd: "NY.GDP.MKTP.CD",
  lifeExpectancy: "SP.DYN.LE00.IN",
} as const;

type WBValue = {
  date: string;
  value: number | null;
};

async function fetchIndicator(iso3: string, indicator: string): Promise<SeriesPoint[]> {
  const url = `https://api.worldbank.org/v2/country/${encodeURIComponent(
    iso3,
  )}/indicator/${indicator}?format=json&per_page=80`;
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
  if (!res.ok) return [];
  const body = (await res.json()) as unknown;
  if (!Array.isArray(body) || body.length < 2 || !Array.isArray(body[1])) return [];
  const rows = body[1] as WBValue[];
  return rows
    .filter((r) => r.value !== null && !Number.isNaN(Number(r.value)))
    .map((r) => ({ year: Number(r.date), value: Number(r.value) }))
    .sort((a, b) => a.year - b.year);
}

export async function fetchWorldBankIndicators(iso3: string): Promise<WorldBankIndicators> {
  const [population, gdpUsd, lifeExpectancy] = await Promise.all([
    fetchIndicator(iso3, INDICATORS.population),
    fetchIndicator(iso3, INDICATORS.gdpUsd),
    fetchIndicator(iso3, INDICATORS.lifeExpectancy),
  ]);
  return { population, gdpUsd, lifeExpectancy };
}

export function isEmptyWorldBank(d: WorldBankIndicators): boolean {
  return d.population.length === 0 && d.gdpUsd.length === 0 && d.lifeExpectancy.length === 0;
}
