"use client";

import { useUnesco } from "@/hooks/use-country-data";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_LABELS: Record<string, string> = {
  cultural: "культурный",
  natural: "природный",
  mixed: "смешанный",
};

export function UnescoSection({ iso3 }: { iso3: string }) {
  const { data, isLoading, error } = useUnesco(iso3);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }
  if (error)
    return <p className="text-sm text-red-500 dark:text-red-400">Ошибка: {(error as Error).message}</p>;
  if (!data || !data.ok) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {data && "message" in data ? data.message : "Данные временно недоступны"}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Объектов Всемирного наследия: {data.count}
      </p>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-800 max-h-80 overflow-auto">
        {data.sites.map((site) => (
          <li key={site.id} className="p-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{site.name}</span>
              <span className="text-xs whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                {CATEGORY_LABELS[site.category] ?? site.category}
                {site.dateInscribed ? ` · ${site.dateInscribed}` : ""}
              </span>
            </div>
            {site.shortDescription ? (
              <p className="mt-1 line-clamp-3 text-xs text-zinc-500 dark:text-zinc-400">
                {site.shortDescription}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
