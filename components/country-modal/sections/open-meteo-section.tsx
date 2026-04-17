"use client";

import { useOpenMeteo } from "@/hooks/use-country-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { describeWeatherCode } from "@/services/openmeteo.service";

export function OpenMeteoSection({
  iso3,
  lat,
  lon,
}: {
  iso3: string;
  lat: number;
  lon: number;
}) {
  const { data, isLoading, error } = useOpenMeteo(iso3, lat, lon);

  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (error) return <p className="text-sm text-red-500">Ошибка: {(error as Error).message}</p>;
  if (!data || !data.ok) {
    return (
      <p className="text-sm text-zinc-500">
        {data && "message" in data ? data.message : "Данные временно недоступны"}
      </p>
    );
  }

  const { data: cur } = data;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Температура</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold">{cur.temperatureC.toFixed(1)}°C</div>
          <div className="text-xs text-zinc-500">{describeWeatherCode(cur.weatherCode)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Влажность</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold">
            {cur.humidity != null ? `${cur.humidity}%` : "—"}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ветер</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold">
            {cur.windKph != null ? `${cur.windKph} км/ч` : "—"}
          </div>
          <div className="text-xs text-zinc-500">
            {new Date(cur.time).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
