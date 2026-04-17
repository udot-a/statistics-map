import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchWorldBankIndicators, isEmptyWorldBank } from "@/services/worldbank.service";
import type { WorldBankResponse } from "@/types/data";

const QuerySchema = z.object({
  iso3: z.string().trim().regex(/^[A-Za-z]{3}$/, "iso3 must be a 3-letter code"),
});

export async function GET(req: Request): Promise<NextResponse<WorldBankResponse>> {
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
    const data = await fetchWorldBankIndicators(iso3);
    if (isEmptyWorldBank(data)) {
      return NextResponse.json({ ok: false, iso3, message: "Данные временно недоступны" });
    }
    return NextResponse.json({ ok: true, iso3, data });
  } catch (err) {
    console.error("[api/data/worldbank] error", err);
    return NextResponse.json(
      { ok: false, iso3, message: "Не удалось загрузить данные World Bank" },
      { status: 502 },
    );
  }
}
