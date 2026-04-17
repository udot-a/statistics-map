import type { OpenMeteoResponse, UnescoResponse, WorldBankResponse } from "@/types/data";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as Partial<{ message: string }>;
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export function getWorldBank(iso3: string): Promise<WorldBankResponse> {
  return getJson<WorldBankResponse>(`/api/data/worldbank?iso3=${encodeURIComponent(iso3)}`);
}

export function getOpenMeteo(
  iso3: string,
  lat: number,
  lon: number,
): Promise<OpenMeteoResponse> {
  const qs = new URLSearchParams({ iso3, lat: String(lat), lon: String(lon) });
  return getJson<OpenMeteoResponse>(`/api/data/open-meteo?${qs.toString()}`);
}

export function getUnesco(iso3: string): Promise<UnescoResponse> {
  return getJson<UnescoResponse>(`/api/data/unesco?iso3=${encodeURIComponent(iso3)}`);
}
