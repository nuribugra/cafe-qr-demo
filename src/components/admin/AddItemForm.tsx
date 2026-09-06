"use client";

import { useState, type FormEvent } from "react";
import { ui, type Locale, type LocalizedText } from "@/lib/i18n";

export interface NewItemValues {
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  image: string;
  popular: boolean;
}

export function AddItemForm({
  categoryName,
  locale,
  onAdd,
  onCancel,
}: {
  categoryName: string;
  locale: Locale;
  onAdd: (values: NewItemValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [nameEn, setNameEn] = useState("");
  const [nameTr, setNameTr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descTr, setDescTr] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [popular, setPopular] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const priceNum = Number(price);
    if (!nameEn.trim() && !nameTr.trim()) return setError(ui[locale].nameRequired);
    if (!Number.isFinite(priceNum) || priceNum < 0) return setError(ui[locale].priceInvalid);

    setSaving(true);
    setError("");
    try {
      await onAdd({
        name: { en: nameEn.trim() || nameTr.trim(), tr: nameTr.trim() || nameEn.trim() },
        description: { en: descEn.trim() || descTr.trim(), tr: descTr.trim() || descEn.trim() },
        price: priceNum,
        image: image.trim(),
        popular,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : ui[locale].addItemFailed);
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <h3 className="font-semibold text-foreground">{ui[locale].newItemHeading(categoryName)}</h3>
      </div>

      <label className="flex flex-col gap-1 text-sm text-muted">
        {ui[locale].nameEnLabel}
        <input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted">
        {ui[locale].nameTrLabel}
        <input
          value={nameTr}
          onChange={(e) => setNameTr(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted">
        {ui[locale].descEnLabel} <span className="text-xs">({ui[locale].descOptionalHint})</span>
        <textarea
          value={descEn}
          onChange={(e) => setDescEn(e.target.value)}
          rows={2}
          className="rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted">
        {ui[locale].descTrLabel} <span className="text-xs">({ui[locale].descOptionalHint})</span>
        <textarea
          value={descTr}
          onChange={(e) => setDescTr(e.target.value)}
          rows={2}
          className="rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted">
        {ui[locale].priceLabel}
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted">
        {ui[locale].imageLabel} <span className="text-xs">({ui[locale].imageOptionalHint})</span>
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://…"
          className="rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-accent focus:outline-none"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={popular}
          onChange={(e) => setPopular(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        {ui[locale].popularLabel}
      </label>

      {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}

      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-4 py-2 font-medium text-accent-foreground disabled:opacity-50"
        >
          {saving ? ui[locale].addItemSubmitting : ui[locale].addItemSubmit}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-muted hover:text-foreground"
        >
          {ui[locale].formCancel}
        </button>
      </div>
    </form>
  );
}
