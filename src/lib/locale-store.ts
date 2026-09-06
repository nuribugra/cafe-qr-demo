"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n";

const STORAGE_KEY = "cafe-locale";
const CHANGE_EVENT = "cafe-locale-change";

// Turkish is the café's default language — only an explicit "en" choice
// saved by the toggle switches it.
function getSnapshot(): Locale {
  try {
    return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "tr";
  } catch {
    return "tr";
  }
}

// Always "tr" on the server, so the first client render matches the SSR
// markup exactly — a saved "en" preference is picked up right after
// hydration via the subscription below, with no manual effect needed.
function getServerSnapshot(): Locale {
  return "tr";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

/** Shared language preference, persisted to localStorage and synced across every component that reads it. */
export function useLocale(): [Locale, (locale: Locale) => void] {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = useCallback((next: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore — the toggle just won't persist across reloads
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return [locale, setLocale];
}
