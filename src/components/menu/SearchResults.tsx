import type { Category, MenuItem } from "@/lib/menu";
import { t, ui, type Locale } from "@/lib/i18n";
import { ProductCard } from "./ProductCard";

export function SearchResults({
  categories,
  items,
  query,
  rawQuery,
  locale,
}: {
  categories: Category[];
  items: MenuItem[];
  /** Lowercased, trimmed query used for matching. */
  query: string;
  /** Original search text, for display in messages. */
  rawQuery: string;
  locale: Locale;
}) {
  const groups = categories
    .map((category) => ({
      category,
      items: items.filter(
        (item) =>
          item.categoryId === category.id &&
          (item.name.en.toLowerCase().includes(query) ||
            item.name.tr.toLowerCase().includes(query))
      ),
    }))
    .filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return <p className="mt-16 text-center text-sm text-muted">{ui[locale].noResults(rawQuery)}</p>;
  }

  return (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-muted">
        {ui[locale].searchResultsFor(rawQuery)}
      </p>
      <div className="flex flex-col gap-6">
        {groups.map(({ category, items }) => (
          <section key={category.id}>
            <h2 className="mb-3 font-serif text-lg text-foreground">{t(category.name, locale)}</h2>
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <ProductCard key={item.id} item={item} locale={locale} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
