"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ui } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-store";
import { LanguageToggle } from "@/components/LanguageToggle";

const ERROR_CODE_KEY = {
  rate_limited: "rateLimited",
  incorrect_password: "incorrectPin",
  invalid_request: "incorrectPin",
  server_error: "loadError",
} as const;

export default function AdminLoginPage() {
  const [locale] = useLocale();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // The cookie is already set (applied from the response above); push
        // + refresh so the next server round-trip for /admin sees it.
        router.push("/admin");
        router.refresh();
        return;
      }
      const body = await res.json().catch(() => ({}));
      const key = ERROR_CODE_KEY[body.code as keyof typeof ERROR_CODE_KEY];
      setError(key ? ui[locale][key] : ui[locale].incorrectPin);
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  }

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
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={ui[locale].passwordPlaceholder}
          className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none"
        />
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !password}
          className="mt-4 w-full rounded-lg bg-accent py-2 font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? ui[locale].loggingIn : ui[locale].unlock}
        </button>
      </form>
    </div>
  );
}
