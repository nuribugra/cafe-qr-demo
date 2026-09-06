/**
 * Centralized price formatting — the menu is priced and displayed in
 * Turkish Lira everywhere, regardless of the selected UI language, per the
 * café's pricing convention. Formatted by hand (rather than Intl) so the
 * "₺1.234,56" grouping/decimal style is guaranteed across environments.
 */
export function formatPrice(price: number): string {
  const [whole, cents] = price.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `₺${grouped},${cents}`;
}
