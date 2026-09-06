"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { ui, type Locale } from "@/lib/i18n";

export function EditablePrice({
  price,
  locale,
  onSave,
}: {
  price: number;
  locale: Locale;
  onSave: (newPrice: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(price.toFixed(2));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(price.toFixed(2));
          setError("");
          setEditing(true);
        }}
        title="Click to edit price"
        className="rounded-md border border-transparent px-2 py-1 font-semibold text-accent hover:border-border hover:bg-background"
      >
        {formatPrice(price)}
      </button>
    );
  }

  async function handleSave() {
    const value = Number(draft);
    if (!Number.isFinite(value) || value < 0) {
      setError(ui[locale].editPriceInvalid);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(value);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : ui[locale].editPriceFailed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-muted">$</span>
      <input
        type="number"
        step="0.01"
        min="0"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") setEditing(false);
        }}
        className="w-20 rounded-md border border-border bg-background px-2 py-1 text-foreground focus:border-accent focus:outline-none"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground disabled:opacity-50"
      >
        {saving ? "…" : ui[locale].editPriceSave}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="rounded-md px-2 py-1 text-xs text-muted hover:text-foreground"
      >
        {ui[locale].editPriceCancel}
      </button>
      {error && <span className="w-full text-xs text-danger">{error}</span>}
    </div>
  );
}
