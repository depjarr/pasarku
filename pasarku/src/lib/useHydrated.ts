"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** true setelah render di browser — dipakai agar isi keranjang (localStorage) tidak bikin hydration mismatch. */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
