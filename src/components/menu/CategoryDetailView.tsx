import type { MenuItem } from "@/lib/menu";
import { ui, type Locale } from "@/lib/i18n";
import { ProductCard } from "./ProductCard";

export function CategoryDetailView({
  items,
  locale,
}: {
  items: MenuItem[];
  locale: Locale;
}) {
  return (
    <div>
      <div className="mb-4 h-px w-full bg-gradient-to-r from-gold/50 via-border to-transparent" />
      {items.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">{ui[locale].noItemsYet}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
