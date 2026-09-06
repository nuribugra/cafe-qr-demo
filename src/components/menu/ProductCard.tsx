import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { MenuItem } from "@/lib/menu";
import { t, ui, type Locale } from "@/lib/i18n";

export function ProductCard({ item, locale }: { item: MenuItem; locale: Locale }) {
  return (
    <div
      className={`group relative flex gap-4 rounded-2xl border border-border bg-surface p-3.5 transition-all ${
        item.active
          ? "hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(43,33,24,0.25)]"
          : "opacity-60"
      }`}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24">
        <Image
          src={item.image}
          alt={t(item.name, locale)}
          fill
          sizes="96px"
          className="object-cover"
        />
        {!item.active && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <span className="rounded-full bg-black/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              {ui[locale].soldOut}
            </span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate font-serif text-lg leading-tight text-foreground">
            {t(item.name, locale)}
          </h3>
          <span className="shrink-0 rounded-full border border-gold/40 bg-background px-2.5 py-0.5 text-sm font-semibold text-accent">
            {formatPrice(item.price)}
          </span>
        </div>
        <p className="line-clamp-2 text-sm leading-snug text-muted">{t(item.description, locale)}</p>
        {item.popular && (
          <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-[11px] font-medium text-accent">
            ✦ {ui[locale].featured}
          </span>
        )}
      </div>
    </div>
  );
}
