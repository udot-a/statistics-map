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
import {
  normalizeFeatureCollection,
  uniqueCountries,
  uniqueSubregions,
} from "@/lib/geojson";
import { DATA_SOURCES } from "@/lib/constants";
import type { DataSourceId } from "@/types/geo";

export function FilterPanel() {
  const { data: rawGeo } = useCountriesGeoJson();
  const subregion = useFiltersStore((s) => s.subregion);
  const selectedIso3 = useFiltersStore((s) => s.selectedIso3);
  const sources = useFiltersStore((s) => s.dataSources);
  const setSubregion = useFiltersStore((s) => s.setSubregion);
  const selectCountry = useFiltersStore((s) => s.selectCountry);
  const clearCountry = useFiltersStore((s) => s.clearCountry);
  const toggleDataSource = useFiltersStore((s) => s.toggleDataSource);

  const normalized = useMemo(() => {
    if (!rawGeo) return null;
    return normalizeFeatureCollection(
      rawGeo as Parameters<typeof normalizeFeatureCollection>[0],
    );
  }, [rawGeo]);

  const subregions = useMemo(
    () => (normalized ? uniqueSubregions(normalized) : []),
    [normalized],
  );
  const countries = useMemo(
    () => (normalized ? uniqueCountries(normalized, subregion) : []),
    [normalized, subregion],
  );

  const onPickCountry = (iso3: string) => {
    if (iso3 === "NONE") {
      clearCountry();
      return;
    }
    const country = countries.find((c) => c.properties.iso3 === iso3);
    if (!country) return;
    selectCountry({
      iso3,
      subregion: country.properties.subregion,
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500 dark:text-zinc-400">Регион / Область</label>
        <Select value={subregion} onValueChange={setSubregion}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Все регионы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Все регионы</SelectItem>
            {subregions.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500 dark:text-zinc-400">Страна</label>
        <Select value={selectedIso3 ?? "NONE"} onValueChange={onPickCountry}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Выберите страну" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">— не выбрана —</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c.properties.iso3} value={c.properties.iso3}>
                {c.properties.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-zinc-500 dark:text-zinc-400">Источники данных</label>
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
