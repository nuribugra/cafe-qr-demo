"use client";

import { useLocale } from "@/lib/locale-store";
import type { Locale } from "@/lib/i18n";

const OPTIONS: { locale: Locale; label: string }[] = [
  { locale: "en", label: "EN" },
  { locale: "tr", label: "TR" },
];

export function LanguageToggle() {
  const [locale, setLocale] = useLocale();

  return (
    <div className="inline-flex shrink-0 rounded-full border border-border bg-surface p-0.5 text-xs font-semibold">
      {OPTIONS.map((opt) => (
        <button
          key={opt.locale}
          type="button"
          onClick={() => setLocale(opt.locale)}
          aria-pressed={locale === opt.locale}
          className={`flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 transition-colors ${
            locale === opt.locale
              ? "bg-accent text-accent-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
