"use client";

import { useMemo, useState } from "react";
import type { MenuData } from "@/lib/menu";
import { t, ui } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-store";
import { LanguageToggle } from "@/components/LanguageToggle";
import { SearchBar } from "./SearchBar";
import { CategoryGrid } from "./CategoryGrid";
import { CategoryDetailView } from "./CategoryDetailView";
import { SearchResults } from "./SearchResults";

export function MenuView({ initialData }: { initialData: MenuData }) {
  const [data] = useState(initialData);
  const [locale] = useLocale();
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const sortedCategories = useMemo(
    () => [...data.categories].sort((a, b) => a.order - b.order),
    [data.categories]
  );

  const query = search.trim().toLowerCase();
  const selectedCategory = selectedCategoryId
    ? sortedCategories.find((c) => c.id === selectedCategoryId) ?? null
    : null;

  const showBack = Boolean(query || selectedCategory);

  function handleBack() {
    if (query) {
      setSearch("");
    } else {
      setSelectedCategoryId(null);
    }
  }

  let content;
  let viewKey;
  if (query) {
    content = (
      <SearchResults
        categories={sortedCategories}
        items={data.items}
        query={query}
        rawQuery={search}
        locale={locale}
      />
    );
    viewKey = "search";
  } else if (selectedCategory) {
    content = (
      <CategoryDetailView
        items={data.items.filter((i) => i.categoryId === selectedCategory.id)}
        locale={locale}
      />
    );
    viewKey = `category-${selectedCategory.id}`;
  } else {
    content = (
      <CategoryGrid
        categories={sortedCategories}
        items={data.items}
        locale={locale}
        onSelect={setSelectedCategoryId}
      />
    );
    viewKey = "grid";
  }

  return (
    <div className="menu-theme flex min-h-screen w-full flex-1 flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border/70 bg-background/92 backdrop-blur">
          <div className="flex min-h-[3.25rem] items-start justify-between gap-3 px-4 pt-6">
            {showBack ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:border-gold/60 hover:text-accent"
              >
                <span aria-hidden>←</span> {ui[locale].backToCategories}
              </button>
            ) : (
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-accent">
                  The Copper Cup
                </p>
                <h1 className="mt-1 font-serif text-3xl text-foreground">{ui[locale].menuTitle}</h1>
              </div>
            )}
            <LanguageToggle />
          </div>

          {selectedCategory && !query && (
            <div className="px-4 pt-3">
              <h2 className="font-serif text-xl text-foreground">
                {t(selectedCategory.name, locale)}
              </h2>
              {selectedCategory.tagline && (
                <p className="mt-0.5 text-xs text-muted">{t(selectedCategory.tagline, locale)}</p>
              )}
            </div>
          )}

          <SearchBar value={search} onChange={setSearch} locale={locale} />
        </header>

        <main key={viewKey} className="menu-fade-in flex-1 px-4 pb-16 pt-4">
          {content}
        </main>
      </div>
    </div>
  );
}
