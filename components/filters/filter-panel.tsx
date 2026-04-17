"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useFiltersStore } from "@/stores/filters.store";
import { useCountriesGeoJson } from "@/hooks/use-country-data";
import { normalizeFeatureCollection, uniqueContinents, uniqueSubregions } from "@/lib/geojson";
import { DATA_SOURCES } from "@/lib/constants";
import type { DataSourceId } from "@/types/geo";

export function FilterPanel() {
  const { data: rawGeo } = useCountriesGeoJson();
  const continent = useFiltersStore((s) => s.continent);
  const subregion = useFiltersStore((s) => s.subregion);
  const sources = useFiltersStore((s) => s.dataSources);
  const setContinent = useFiltersStore((s) => s.setContinent);
  const setSubregion = useFiltersStore((s) => s.setSubregion);
  const toggleDataSource = useFiltersStore((s) => s.toggleDataSource);

  const normalized = useMemo(() => {
    if (!rawGeo) return null;
    return normalizeFeatureCollection(
      rawGeo as Parameters<typeof normalizeFeatureCollection>[0],
    );
  }, [rawGeo]);

  const continents = useMemo(
    () => (normalized ? uniqueContinents(normalized) : []),
    [normalized],
  );
  const subregions = useMemo(
    () => (normalized ? uniqueSubregions(normalized, continent) : []),
    [normalized, continent],
  );

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">Континент</label>
        <Select value={continent} onValueChange={setContinent}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Континент" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Все</SelectItem>
            {continents.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">Регион (ООН)</label>
        <Select value={subregion} onValueChange={setSubregion}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Регион" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Все</SelectItem>
            {subregions.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-zinc-500">Источники данных</label>
        <div className="flex items-center gap-4">
          {DATA_SOURCES.map((ds) => {
            const checked = sources.includes(ds.id as DataSourceId);
            return (
              <label key={ds.id} className="flex items-center gap-2 text-sm select-none">
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggleDataSource(ds.id as DataSourceId)}
                />
                {ds.label}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
