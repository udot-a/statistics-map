"use client";

import { create } from "zustand";
import type { DataSourceId } from "@/types/geo";

export type FiltersState = {
  continent: string; // 'ALL' or continent name
  subregion: string; // 'ALL' or subregion name
  dataSources: DataSourceId[];
  selectedIso3: string | null;
  modalOpen: boolean;
  setContinent: (c: string) => void;
  setSubregion: (s: string) => void;
  toggleDataSource: (id: DataSourceId) => void;
  setDataSources: (ids: DataSourceId[]) => void;
  selectCountry: (iso3: string) => void;
  closeModal: () => void;
};

export const useFiltersStore = create<FiltersState>((set) => ({
  continent: "ALL",
  subregion: "ALL",
  dataSources: ["worldbank", "openmeteo", "unesco"],
  selectedIso3: null,
  modalOpen: false,
  setContinent: (c) =>
    set(() => ({
      continent: c,
      subregion: "ALL",
    })),
  setSubregion: (s) => set({ subregion: s }),
  toggleDataSource: (id) =>
    set((state) => {
      const has = state.dataSources.includes(id);
      const next = has
        ? state.dataSources.filter((d) => d !== id)
        : [...state.dataSources, id];
      return { dataSources: next.length > 0 ? next : state.dataSources };
    }),
  setDataSources: (ids) => set({ dataSources: ids }),
  selectCountry: (iso3) => set({ selectedIso3: iso3, modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),
}));
