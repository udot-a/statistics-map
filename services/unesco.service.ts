import { XMLParser } from "fast-xml-parser";
import type { UnescoSite } from "@/types/data";
import { iso2ToIso3 } from "@/lib/iso";

type UnescoRow = {
  id_number?: string | number;
  unique_number?: string | number;
  site?: string;
  category?: string;
  iso_code?: string;
  states?: string;
  date_inscribed?: string | number;
  short_description?: string;
};

let cachedIndex: Map<string, UnescoSite[]> | null = null;
let loading: Promise<Map<string, UnescoSite[]>> | null = null;

const WHC_XML_URL = "https://whc.unesco.org/en/list/xml/";

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCharCode(Number(d)));
}

function stripHtml(s: string): string {
  return decodeEntities(s)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCategory(cat: string | undefined): UnescoSite["category"] {
  if (!cat) return "cultural";
  const v = cat.toLowerCase();
  if (v.includes("mixed")) return "mixed";
  if (v.includes("natural")) return "natural";
  return "cultural";
}

async function loadIndex(): Promise<Map<string, UnescoSite[]>> {
  if (cachedIndex) return cachedIndex;
  if (loading) return loading;

  loading = (async () => {
    // cache manually in-module (cachedIndex) — Next data cache rejects >2MB payloads
    const res = await fetch(WHC_XML_URL, {
      cache: "no-store",
      headers: { "User-Agent": "country-info-app" },
    });
    if (!res.ok) throw new Error(`UNESCO fetch failed: ${res.status}`);
    const xml = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: true,
      textNodeName: "_text",
      trimValues: true,
      processEntities: false,
    });
    const parsed = parser.parse(xml);
    const rowsRaw = parsed?.query?.row;
    const rows: UnescoRow[] = Array.isArray(rowsRaw) ? rowsRaw : rowsRaw ? [rowsRaw] : [];

    const index = new Map<string, UnescoSite[]>();
    for (const row of rows) {
      const iso2List = String(row.iso_code ?? "")
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      if (iso2List.length === 0) continue;

      const site: UnescoSite = {
        id: String(row.unique_number ?? row.id_number ?? row.site ?? ""),
        name: String(row.site ?? "").trim(),
        category: normalizeCategory(row.category),
        dateInscribed: row.date_inscribed ? Number(row.date_inscribed) : null,
        shortDescription: row.short_description ? stripHtml(String(row.short_description)) : undefined,
      };

      for (const iso2 of iso2List) {
        const iso3 = iso2ToIso3(iso2);
        if (!iso3) continue;
        const bucket = index.get(iso3);
        if (bucket) bucket.push(site);
        else index.set(iso3, [site]);
      }
    }
    cachedIndex = index;
    loading = null;
    return index;
  })();

  return loading;
}

export async function fetchUnescoSitesFor(iso3: string): Promise<UnescoSite[]> {
  const index = await loadIndex();
  const key = iso3.toUpperCase();
  return (index.get(key) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));
}
