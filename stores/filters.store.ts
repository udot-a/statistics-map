"use client";

import { create } from "zustand";
import type { DataSourceId } from "@/types/geo";

export type FiltersState = {
  subregion: string; // 'ALL' or subregion name
  dataSources: DataSourceId[];
  selectedIso3: string | null;
  modalOpen: boolean;
  setSubregion: (s: string) => void;
  toggleDataSource: (id: DataSourceId) => void;
  setDataSources: (ids: DataSourceId[]) => void;
  selectCountry: (country: { iso3: string; subregion?: string }) => void;
  clearCountry: () => void;
  closeModal: () => void;
};

export const useFiltersStore = create<FiltersState>((set) => ({
  subregion: "ALL",
  dataSources: ["worldbank", "openmeteo", "unesco"],
  selectedIso3: null,
  modalOpen: false,
  setSubregion: (s) =>
    set((state) => ({
      subregion: s,
      selectedIso3: s === "ALL" ? state.selectedIso3 : null,
    })),
  toggleDataSource: (id) =>
    set((state) => {
      const has = state.dataSources.includes(id);
      const next = has
        ? state.dataSources.filter((d) => d !== id)
        : [...state.dataSources, id];
      return { dataSources: next.length > 0 ? next : state.dataSources };
    }),
  setDataSources: (ids) => set({ dataSources: ids }),
  selectCountry: ({ iso3, subregion }) =>
    set((state) => ({
      selectedIso3: iso3,
      modalOpen: true,
      subregion: subregion ?? state.subregion,
    })),
  clearCountry: () => set({ selectedIso3: null, modalOpen: false }),
  closeModal: () => set({ modalOpen: false }),
}));
