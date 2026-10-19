"use client";

import { useSyncExternalStore } from "react";
import { subscribe, getState, getServerState } from "./storage";

// React hook: { books, loaded, error } – a könyvlista az adatbázisból.
// Az első használatkor betölti az adatokat, és újrarajzol, ha változnak.
export function useBooks() {
  return useSyncExternalStore(subscribe, getState, getServerState);
}
