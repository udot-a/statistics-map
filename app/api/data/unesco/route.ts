import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchUnescoSitesFor } from "@/services/unesco.service";
import type { UnescoResponse } from "@/types/data";

const QuerySchema = z.object({
  iso3: z.string().trim().regex(/^[A-Za-z]{3}$/),
});

export async function GET(req: Request): Promise<NextResponse<UnescoResponse>> {
  const { searchParams } = new URL(req.url);
  const parsed = QuerySchema.safeParse({ iso3: searchParams.get("iso3") });
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, iso3: "", message: parsed.error.issues[0]?.message ?? "Bad request" },
      { status: 400 },
    );
  }
  const iso3 = parsed.data.iso3.toUpperCase();

  try {
    const sites = await fetchUnescoSitesFor(iso3);
    if (sites.length === 0) {
      return NextResponse.json({
        ok: false,
        iso3,
        message: "Данные временно недоступны",
      });
    }
    return NextResponse.json({ ok: true, iso3, count: sites.length, sites });
  } catch (err) {
    console.error("[api/data/unesco] error", err);
    return NextResponse.json(
      { ok: false, iso3, message: "Не удалось загрузить данные UNESCO" },
      { status: 502 },
    );
  }
}
