import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchOpenMeteoCurrent } from "@/services/openmeteo.service";
import type { OpenMeteoResponse } from "@/types/data";

const QuerySchema = z.object({
  iso3: z.string().trim().regex(/^[A-Za-z]{3}$/),
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export async function GET(req: Request): Promise<NextResponse<OpenMeteoResponse>> {
  const { searchParams } = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    iso3: searchParams.get("iso3"),
    lat: searchParams.get("lat"),
    lon: searchParams.get("lon"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, iso3: "", message: parsed.error.issues[0]?.message ?? "Bad request" },
      { status: 400 },
    );
  }
  const { iso3, lat, lon } = parsed.data;

  try {
    const data = await fetchOpenMeteoCurrent(lat, lon);
    if (!data) {
      return NextResponse.json({
        ok: false,
        iso3: iso3.toUpperCase(),
        message: "Данные временно недоступны",
      });
    }
    return NextResponse.json({ ok: true, iso3: iso3.toUpperCase(), lat, lon, data });
  } catch (err) {
    console.error("[api/data/open-meteo] error", err);
    return NextResponse.json(
      {
        ok: false,
        iso3: iso3.toUpperCase(),
        message: "Не удалось загрузить данные погоды",
      },
      { status: 502 },
    );
  }
}
