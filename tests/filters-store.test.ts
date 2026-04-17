import { describe, expect, it, beforeEach } from "vitest";
import { useFiltersStore } from "@/stores/filters.store";

function resetStore() {
  useFiltersStore.setState({
    continent: "ALL",
    subregion: "ALL",
    dataSources: ["worldbank", "openmeteo", "unesco"],
    selectedIso3: null,
    modalOpen: false,
  });
}

describe("filters store", () => {
  beforeEach(() => resetStore());

  it("setContinent resets subregion to ALL", () => {
    useFiltersStore.getState().setSubregion("Western Europe");
    useFiltersStore.getState().setContinent("Asia");
    expect(useFiltersStore.getState().subregion).toBe("ALL");
    expect(useFiltersStore.getState().continent).toBe("Asia");
  });

  it("toggleDataSource removes and re-adds", () => {
    useFiltersStore.getState().toggleDataSource("worldbank");
    expect(useFiltersStore.getState().dataSources).not.toContain("worldbank");
    useFiltersStore.getState().toggleDataSource("worldbank");
    expect(useFiltersStore.getState().dataSources).toContain("worldbank");
  });

  it("toggleDataSource refuses to leave an empty set", () => {
    const { toggleDataSource } = useFiltersStore.getState();
    toggleDataSource("worldbank");
    toggleDataSource("openmeteo");
    toggleDataSource("unesco");
    expect(useFiltersStore.getState().dataSources.length).toBeGreaterThan(0);
  });

  it("selectCountry opens modal and stores iso3", () => {
    useFiltersStore.getState().selectCountry("FRA");
    expect(useFiltersStore.getState().selectedIso3).toBe("FRA");
    expect(useFiltersStore.getState().modalOpen).toBe(true);
    useFiltersStore.getState().closeModal();
    expect(useFiltersStore.getState().modalOpen).toBe(false);
  });
});
