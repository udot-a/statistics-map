"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const WorldMap = dynamic(() => import("./world-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

export function DynamicMap() {
  return (
    <div className="relative flex-1 min-h-0 w-full">
      <div className="absolute inset-0">
        <WorldMap />
      </div>
    </div>
  );
}
