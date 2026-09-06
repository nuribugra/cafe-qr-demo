import Image from "next/image";
import type { Category, MenuItem } from "@/lib/menu";
import { t, ui, type Locale } from "@/lib/i18n";

export function CategoryGrid({
  categories,
  items,
  locale,
  onSelect,
}: {
  categories: Category[];
  items: MenuItem[];
  locale: Locale;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-muted">
        {ui[locale].categoriesEyebrow}
      </p>
      <div className="grid grid-cols-2 gap-3.5">
        {categories.map((category) => {
          const count = items.filter((i) => i.categoryId === category.id).length;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl border border-border text-left shadow-[0_1px_2px_rgba(43,33,24,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(43,33,24,0.35)]"
            >
              <Image
                src={category.image}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 320px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Warm overlay so the title/tagline stay legible over any photo. */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/35 to-foreground/5" />

              <div className="relative z-10 p-4">
                <h2 className="font-serif text-lg leading-tight text-white drop-shadow-sm">
                  {t(category.name, locale)}
                </h2>
                {category.tagline && (
                  <p className="mt-1 text-xs leading-snug text-white/85">
                    {t(category.tagline, locale)}
                  </p>
                )}
                <div className="mt-2.5 flex items-center justify-between border-t border-white/25 pt-2 text-[11px] font-medium text-white/85">
                  <span>{ui[locale].itemCount(count)}</span>
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
