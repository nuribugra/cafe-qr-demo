"use client";

import { ui, type Locale } from "@/lib/i18n";

export function SearchBar({
  value,
  onChange,
  locale,
}: {
  value: string;
  onChange: (value: string) => void;
  locale: Locale;
}) {
  return (
    <div className="px-4 pb-4 pt-3">
      <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-3">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="h-4 w-4 shrink-0 text-muted"
        >
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="m17 17-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          inputMode="search"
          placeholder={ui[locale].searchPlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted focus:outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={ui[locale].clearSearch}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-background hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
