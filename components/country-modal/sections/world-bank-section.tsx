"use client";

import { useWorldBank } from "@/hooks/use-country-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SeriesPoint } from "@/types/data";

function lastOf(series: SeriesPoint[]): SeriesPoint | null {
  if (series.length === 0) return null;
  return series[series.length - 1];
}

function formatNumber(value: number | null | undefined, fractionDigits = 0): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

function formatUsd(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${formatNumber(value)}`;
}

export function WorldBankSection({ iso3 }: { iso3: string }) {
  const { data, isLoading, error } = useWorldBank(iso3);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500 dark:text-red-400">Ошибка: {(error as Error).message}</p>;
  }

  if (!data || !data.ok) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {data && "message" in data ? data.message : "Данные временно недоступны"}
      </p>
    );
  }

  const { population, gdpUsd, lifeExpectancy } = data.data;
  const popLast = lastOf(population);
  const gdpLast = lastOf(gdpUsd);
  const lifeLast = lastOf(lifeExpectancy);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Население</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{formatNumber(popLast?.value)}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {popLast ? popLast.year : "нет данных"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ВВП</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{formatUsd(gdpLast?.value)}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {gdpLast ? gdpLast.year : "нет данных"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ожидаемая продолжительность жизни</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">
              {lifeLast ? `${lifeLast.value.toFixed(1)} лет` : "—"}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {lifeLast ? lifeLast.year : "нет данных"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
