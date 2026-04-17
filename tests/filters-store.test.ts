import { describe, expect, it, beforeEach } from "vitest";
import { useFiltersStore } from "@/stores/filters.store";

function resetStore() {
  useFiltersStore.setState({
    subregion: "ALL",
    dataSources: ["worldbank", "openmeteo", "unesco"],
    selectedIso3: null,
    modalOpen: false,
  });
}

describe("filters store", () => {
  beforeEach(() => resetStore());

  it("setSubregion clears selectedIso3 when switching away from ALL", () => {
    useFiltersStore.getState().selectCountry({ iso3: "FRA", subregion: "Western Europe" });
    useFiltersStore.getState().setSubregion("Northern Africa");
    expect(useFiltersStore.getState().subregion).toBe("Northern Africa");
    expect(useFiltersStore.getState().selectedIso3).toBeNull();
  });

  it("setSubregion back to ALL keeps selected country", () => {
    useFiltersStore.getState().selectCountry({ iso3: "FRA", subregion: "Western Europe" });
    useFiltersStore.getState().setSubregion("ALL");
    expect(useFiltersStore.getState().selectedIso3).toBe("FRA");
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
    useFiltersStore.getState().selectCountry({ iso3: "FRA" });
    expect(useFiltersStore.getState().selectedIso3).toBe("FRA");
    expect(useFiltersStore.getState().modalOpen).toBe(true);
    useFiltersStore.getState().closeModal();
    expect(useFiltersStore.getState().modalOpen).toBe(false);
  });

  it("selectCountry syncs subregion filter", () => {
    useFiltersStore.getState().selectCountry({
      iso3: "FRA",
      subregion: "Western Europe",
    });
    expect(useFiltersStore.getState().selectedIso3).toBe("FRA");
    expect(useFiltersStore.getState().subregion).toBe("Western Europe");
    expect(useFiltersStore.getState().modalOpen).toBe(true);
  });

  it("clearCountry resets selection and closes modal", () => {
    useFiltersStore.getState().selectCountry({ iso3: "FRA" });
    useFiltersStore.getState().clearCountry();
    expect(useFiltersStore.getState().selectedIso3).toBeNull();
    expect(useFiltersStore.getState().modalOpen).toBe(false);
  });
});
