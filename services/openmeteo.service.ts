import type { OpenMeteoCurrent } from "@/types/data";

type OpenMeteoRaw = {
  current?: {
    time?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
};

export async function fetchOpenMeteoCurrent(
  lat: number,
  lon: number,
): Promise<OpenMeteoCurrent | null> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
  );
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString(), { next: { revalidate: 60 * 30 } });
  if (!res.ok) return null;
  const body = (await res.json()) as OpenMeteoRaw;
  const c = body.current;
  if (!c || typeof c.temperature_2m !== "number" || typeof c.weather_code !== "number") {
    return null;
  }
  return {
    temperatureC: c.temperature_2m,
    humidity: typeof c.relative_humidity_2m === "number" ? c.relative_humidity_2m : null,
    windKph:
      typeof c.wind_speed_10m === "number"
        ? Math.round(c.wind_speed_10m * 3.6 * 10) / 10
        : null,
    weatherCode: c.weather_code,
    time: c.time ?? new Date().toISOString(),
  };
}

const WEATHER_CODE_LABELS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

export function describeWeatherCode(code: number): string {
  return WEATHER_CODE_LABELS[code] ?? "Unknown";
}
