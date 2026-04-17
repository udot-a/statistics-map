import { DynamicMap } from "@/components/map/dynamic-map";
import { FilterPanel } from "@/components/filters/filter-panel";
import { CountryDataDialog } from "@/components/country-modal/country-data-dialog";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 h-screen">
      <header className="flex items-start justify-between gap-4 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Country Info</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Наводите на страну, чтобы подсветить границу, и кликайте для данных.
          </p>
        </div>
        <ThemeSwitcher />
      </header>
      <FilterPanel />
      <main className="flex flex-1 min-h-0 w-full">
        <DynamicMap />
      </main>
      <CountryDataDialog />
    </div>
  );
}
