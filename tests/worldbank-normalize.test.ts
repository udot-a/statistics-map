import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWorldBankIndicators, isEmptyWorldBank } from "@/services/worldbank.service";

const makeWbResponse = (rows: Array<{ date: string; value: number | null }>) => [
  { page: 1, pages: 1, per_page: 80, total: rows.length },
  rows,
];

describe("worldbank service", () => {
  afterEach(() => vi.restoreAllMocks());

  it("normalizes series, filters nulls, sorts by year", async () => {
    const fetchSpy = vi.fn(async (url: string) => {
      if (url.includes("SP.POP.TOTL"))
        return new Response(
          JSON.stringify(
            makeWbResponse([
              { date: "2022", value: 100 },
              { date: "2021", value: null },
              { date: "2020", value: 80 },
            ]),
          ),
        );
      if (url.includes("NY.GDP.MKTP.CD"))
        return new Response(JSON.stringify(makeWbResponse([])));
      return new Response(JSON.stringify(makeWbResponse([{ date: "2020", value: 75.5 }])));
    });
    vi.stubGlobal("fetch", fetchSpy);

    const data = await fetchWorldBankIndicators("FRA");
    expect(data.population).toEqual([
      { year: 2020, value: 80 },
      { year: 2022, value: 100 },
    ]);
    expect(data.gdpUsd).toEqual([]);
    expect(data.lifeExpectancy).toEqual([{ year: 2020, value: 75.5 }]);
    expect(isEmptyWorldBank(data)).toBe(false);
  });

  it("detects empty data set", async () => {
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify(makeWbResponse([]))));
    vi.stubGlobal("fetch", fetchSpy);
    const data = await fetchWorldBankIndicators("XXX");
    expect(isEmptyWorldBank(data)).toBe(true);
  });

  it("treats non-array body as empty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ message: "Invalid country code" }))),
    );
    const data = await fetchWorldBankIndicators("ZZZ");
    expect(isEmptyWorldBank(data)).toBe(true);
  });
});
