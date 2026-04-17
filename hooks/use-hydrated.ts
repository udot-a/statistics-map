"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

let hydrated = false;
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function getSnapshot() {
  return hydrated;
}

function getServerSnapshot() {
  return false;
}

function markHydrated() {
  if (hydrated) return;
  hydrated = true;
  for (const l of listeners) l();
}

/**
 * false on server and on the client’s first render (matches SSR), then true after layout.
 * Use to gate UI that depends on client-only state (e.g. theme) and avoid hydration mismatches.
 */
export function useHydrated() {
  useLayoutEffect(() => {
    markHydrated();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
