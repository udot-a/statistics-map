"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFiltersStore } from "@/stores/filters.store";
import { useCountriesGeoJson } from "@/hooks/use-country-data";
import { findByIso3, normalizeFeatureCollection } from "@/lib/geojson";
import { WorldBankSection } from "./sections/world-bank-section";
import { OpenMeteoSection } from "./sections/open-meteo-section";
import { UnescoSection } from "./sections/unesco-section";

export function CountryDataDialog() {
  const modalOpen = useFiltersStore((s) => s.modalOpen);
  const selectedIso3 = useFiltersStore((s) => s.selectedIso3);
  const dataSources = useFiltersStore((s) => s.dataSources);
  const closeModal = useFiltersStore((s) => s.closeModal);

  const { data: rawGeo } = useCountriesGeoJson();
  const country = useMemo(() => {
    if (!rawGeo || !selectedIso3) return null;
    const fc = normalizeFeatureCollection(
      rawGeo as Parameters<typeof normalizeFeatureCollection>[0],
    );
    return findByIso3(fc, selectedIso3) ?? null;
  }, [rawGeo, selectedIso3]);

  const defaultTab = dataSources[0] ?? "worldbank";

  return (
    <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {country?.properties.name ?? selectedIso3 ?? "Страна"}
            {selectedIso3 ? (
              <span className="ml-2 text-xs font-normal text-zinc-500">{selectedIso3}</span>
            ) : null}
          </DialogTitle>
          {country ? (
            <DialogDescription>
              {country.properties.continent} · {country.properties.subregion}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        {selectedIso3 && country ? (
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList>
              {dataSources.includes("worldbank") && (
                <TabsTrigger value="worldbank">World Bank</TabsTrigger>
              )}
              {dataSources.includes("openmeteo") && (
                <TabsTrigger value="openmeteo">Open-Meteo</TabsTrigger>
              )}
              {dataSources.includes("unesco") && (
                <TabsTrigger value="unesco">UNESCO</TabsTrigger>
              )}
            </TabsList>
            {dataSources.includes("worldbank") && (
              <TabsContent value="worldbank">
                <WorldBankSection iso3={selectedIso3} />
              </TabsContent>
            )}
            {dataSources.includes("openmeteo") && (
              <TabsContent value="openmeteo">
                <OpenMeteoSection
                  iso3={selectedIso3}
                  lat={country.properties.lat}
                  lon={country.properties.lon}
                />
              </TabsContent>
            )}
            {dataSources.includes("unesco") && (
              <TabsContent value="unesco">
                <UnescoSection iso3={selectedIso3} />
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <p className="text-sm text-zinc-500">Загрузка страны...</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
