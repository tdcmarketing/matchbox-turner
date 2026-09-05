"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Renders children only on the client after hydration, so persisted demo state never mismatches server HTML. */
export function Hydrated({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  if (!ready) return <>{fallback ?? null}</>;
  return <>{children}</>;
}
