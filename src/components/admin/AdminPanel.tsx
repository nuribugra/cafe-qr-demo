"use client";

import { useEffect, useMemo, useState } from "react";
import type { MenuData, MenuItem } from "@/lib/menu";
import { ADMIN_PIN, ADMIN_PIN_HEADER, ADMIN_SESSION_KEY } from "@/lib/admin";
import { t, ui } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-store";
import { LanguageToggle } from "@/components/LanguageToggle";
import { EditablePrice } from "./EditablePrice";
import { AddItemForm, type NewItemValues } from "./AddItemForm";

async function adminFetch(input: string, init: RequestInit = {}) {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      [ADMIN_PIN_HEADER]: ADMIN_PIN,
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

export function AdminPanel() {
  const [data, setData] = useState<MenuData | null>(null);
  const [locale] = useLocale();
  const [loadError, setLoadError] = useState("");
  const [addingFor, setAddingFor] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setData)
      .catch(() => setLoadError(ui.en.loadError));
  }, []);

  const sortedCategories = useMemo(
    () => (data ? [...data.categories].sort((a, b) => a.order - b.order) : []),
    [data]
  );

  async function updateItem(id: string, updates: Partial<MenuItem>) {
    const updated: MenuItem = await adminFetch("/api/menu", {
      method: "PATCH",
      body: JSON.stringify({ id, ...updates }),
    });
    setData((prev) =>
      prev ? { ...prev, items: prev.items.map((i) => (i.id === id ? updated : i)) } : prev
    );
  }

  async function deleteItem(id: string) {
    if (!confirm(ui[locale].deleteConfirm)) return;
    await adminFetch(`/api/menu?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setData((prev) => (prev ? { ...prev, items: prev.items.filter((i) => i.id !== id) } : prev));
  }

  async function addItem(categoryId: string, values: NewItemValues) {
    const created: MenuItem = await adminFetch("/api/menu", {
      method: "POST",
      body: JSON.stringify({ ...values, categoryId }),
    });
    setData((prev) => (prev ? { ...prev, items: [...prev.items, created] } : prev));
    setAddingFor(null);
  }

  function handleLogout() {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }
    window.location.reload();
  }

  if (loadError) return <p className="p-6 text-danger">{loadError}</p>;
  if (!data) return <p className="p-6 text-muted">{ui[locale].loadingMenu}</p>;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            The Copper Cup
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">{ui[locale].adminTitle}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:text-foreground"
          >
            {ui[locale].logOut}
          </button>
        </div>
      </div>

      {sortedCategories.map((category) => {
        const items = data.items.filter((i) => i.categoryId === category.id);
        return (
          <section key={category.id} className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{t(category.name, locale)}</h2>
              <button
                type="button"
                onClick={() => setAddingFor(addingFor === category.id ? null : category.id)}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-accent hover:bg-surface"
              >
                {addingFor === category.id ? ui[locale].close : ui[locale].addItem}
              </button>
            </div>

            {addingFor === category.id && (
              <AddItemForm
                categoryName={t(category.name, locale)}
                locale={locale}
                onAdd={(values) => addItem(category.id, values)}
                onCancel={() => setAddingFor(null)}
              />
            )}

            <div className="mt-3 flex flex-col gap-2">
              {items.length === 0 && (
                <p className="text-sm text-muted">{ui[locale].noItemsYet}</p>
              )}
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-3 ${
                    item.active ? "" : "opacity-60"
                  }`}
                >
                  <div className="min-w-[10rem] flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{t(item.name, locale)}</p>
                      {item.popular && (
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
                          {ui[locale].featured}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-1 text-sm text-muted">{t(item.description, locale)}</p>
                  </div>

                  <EditablePrice
                    price={item.price}
                    locale={locale}
                    onSave={(price) => updateItem(item.id, { price })}
                  />

                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={(e) => updateItem(item.id, { active: e.target.checked })}
                      className="h-4 w-4 accent-accent"
                    />
                    {ui[locale].active}
                  </label>

                  <button
                    type="button"
                    onClick={() => updateItem(item.id, { popular: !item.popular })}
                    className="rounded-lg border border-border px-2 py-1 text-xs text-muted hover:text-foreground"
                  >
                    {item.popular ? ui[locale].unfeature : ui[locale].feature}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    className="rounded-lg border border-danger/40 px-2 py-1 text-xs text-danger hover:bg-danger/10"
                  >
                    {ui[locale].delete}
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
