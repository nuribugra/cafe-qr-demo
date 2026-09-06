"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ADMIN_PIN, ADMIN_SESSION_KEY } from "@/lib/admin";
import { ui } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-store";
import { LanguageToggle } from "@/components/LanguageToggle";

function readStoredAuth(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

// Rendered only via a client-only dynamic import (see AdminClientOnly), so
// there's no server-rendered HTML to match — reading sessionStorage directly
// in the initial state is safe here and needs no effect.
export function PinGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(readStoredAuth);
  const [locale] = useLocale();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthed(true);
      setError("");
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
      } catch {
        // ignore — worst case the PIN is asked again on next visit
      }
    } else {
      setError(ui[locale].incorrectPin);
      setPin("");
    }
  }

  if (!authed) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xs rounded-2xl border border-border bg-surface p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              The Copper Cup
            </p>
            <LanguageToggle />
          </div>
          <h1 className="mt-2 text-xl font-semibold text-foreground">{ui[locale].pinTitle}</h1>
          <p className="mt-2 text-sm text-muted">{ui[locale].pinSubtitle}</p>
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-center text-lg tracking-[0.4em] text-foreground focus:border-accent focus:outline-none"
          />
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-accent py-2 font-medium text-accent-foreground hover:opacity-90"
          >
            {ui[locale].unlock}
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
