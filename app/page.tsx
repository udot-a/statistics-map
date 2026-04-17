import { DynamicMap } from "@/components/map/dynamic-map";
import { FilterPanel } from "@/components/filters/filter-panel";
import { CountryDataDialog } from "@/components/country-modal/country-data-dialog";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 h-screen">
      <header className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-lg font-semibold">Country Info</h1>
        <p className="text-xs text-zinc-500">
          Наводите на страну, чтобы подсветить границу, и кликайте для данных.
        </p>
      </header>
      <FilterPanel />
      <main className="flex-1 min-h-0">
        <DynamicMap />
      </main>
      <CountryDataDialog />
    </div>
  );
}
