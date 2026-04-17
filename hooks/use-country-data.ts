"use client";

import { useQuery } from "@tanstack/react-query";
import { getOpenMeteo, getUnesco, getWorldBank } from "@/services/country-data.service";
import { STALE_TIME_LONG, STALE_TIME_WEATHER } from "@/lib/constants";

export function useWorldBank(iso3: string | null, enabled = true) {
  return useQuery({
    queryKey: ["worldbank", iso3],
    queryFn: () => getWorldBank(iso3 as string),
    enabled: Boolean(iso3) && enabled,
    staleTime: STALE_TIME_LONG,
    gcTime: STALE_TIME_LONG,
  });
}

export function useOpenMeteo(
  iso3: string | null,
  lat: number | null,
  lon: number | null,
  enabled = true,
) {
  return useQuery({
    queryKey: ["openmeteo", iso3, lat, lon],
    queryFn: () => getOpenMeteo(iso3 as string, lat as number, lon as number),
    enabled: Boolean(iso3 && lat != null && lon != null) && enabled,
    staleTime: STALE_TIME_WEATHER,
    gcTime: STALE_TIME_WEATHER,
  });
}

export function useUnesco(iso3: string | null, enabled = true) {
  return useQuery({
    queryKey: ["unesco", iso3],
    queryFn: () => getUnesco(iso3 as string),
    enabled: Boolean(iso3) && enabled,
    staleTime: STALE_TIME_LONG,
    gcTime: STALE_TIME_LONG,
  });
}

export function useCountriesGeoJson() {
  return useQuery({
    queryKey: ["geojson", "world-simplified"],
    queryFn: async () => {
      const res = await fetch("/geo/world-simplified.geo.json");
      if (!res.ok) throw new Error(`GeoJSON fetch failed: ${res.status}`);
      return res.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
