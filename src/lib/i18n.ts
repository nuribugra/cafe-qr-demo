export type Locale = "en" | "tr";

export const LOCALES: Locale[] = ["en", "tr"];

/** Bilingual text: content authored in both languages, e.g. an item name or description. */
export interface LocalizedText {
  en: string;
  tr: string;
}

/** Resolves a LocalizedText to a plain string for the given locale, falling back to English. */
export function t(text: LocalizedText, locale: Locale): string {
  return text[locale] || text.en;
}

/** All static UI copy, in both languages. */
export const ui = {
  en: {
    menuTitle: "Menu",
    categoriesEyebrow: "Categories",
    itemCount: (n: number) => `${n} item${n === 1 ? "" : "s"}`,
    backToCategories: "Back to Categories",
    searchPlaceholder: "Search the menu…",
    clearSearch: "Clear search",
    noResults: (query: string) => `No items match "${query}".`,
    searchResultsFor: (query: string) => `Results for "${query}"`,
    featured: "Featured",
    soldOut: "Sold out",

    adminTitle: "Admin panel",
    logOut: "Log out",
    addItem: "+ Add item",
    close: "Close",
    noItemsYet: "No items in this category yet.",
    active: "Active",
    feature: "Feature",
    unfeature: "Unfeature",
    delete: "Delete",
    deleteConfirm: "Delete this item? This cannot be undone.",
    loadingMenu: "Loading menu…",
    loadError: "Could not load the menu.",

    pinTitle: "Admin access",
    pinSubtitle: "Enter the staff PIN to manage the menu.",
    unlock: "Unlock",
    incorrectPin: "Incorrect PIN.",

    editPriceSave: "Save",
    editPriceCancel: "Cancel",
    editPriceInvalid: "Enter a valid price.",
    editPriceFailed: "Failed to save.",

    newItemHeading: (category: string) => `New item — ${category}`,
    nameEnLabel: "Name (English)",
    nameTrLabel: "Name (Turkish)",
    descEnLabel: "Description (English)",
    descTrLabel: "Description (Turkish)",
    descOptionalHint: "optional — falls back to the other language if left blank",
    priceLabel: "Price (₺)",
    imageLabel: "Image URL",
    imageOptionalHint: "optional — a placeholder is used if left blank",
    popularLabel: "Featured / popular",
    addItemSubmit: "Add item",
    addItemSubmitting: "Adding…",
    formCancel: "Cancel",
    nameRequired: "Name is required.",
    priceInvalid: "Enter a valid price.",
    addItemFailed: "Failed to add item.",
  },
  tr: {
    menuTitle: "Menü",
    categoriesEyebrow: "Kategoriler",
    itemCount: (n: number) => `${n} ürün`,
    backToCategories: "Geri Dön",
    searchPlaceholder: "Menüde ara…",
    clearSearch: "Aramayı temizle",
    noResults: (query: string) => `"${query}" ile eşleşen ürün yok.`,
    searchResultsFor: (query: string) => `"${query}" için sonuçlar`,
    featured: "Popüler",
    soldOut: "Tükendi",

    adminTitle: "Yönetim paneli",
    logOut: "Çıkış yap",
    addItem: "+ Ürün ekle",
    close: "Kapat",
    noItemsYet: "Bu kategoride henüz ürün yok.",
    active: "Aktif",
    feature: "Öne çıkar",
    unfeature: "Öne çıkarmayı kaldır",
    delete: "Sil",
    deleteConfirm: "Bu ürünü silmek istiyor musunuz? Bu işlem geri alınamaz.",
    loadingMenu: "Menü yükleniyor…",
    loadError: "Menü yüklenemedi.",

    pinTitle: "Yönetici girişi",
    pinSubtitle: "Menüyü yönetmek için personel PIN kodunu girin.",
    unlock: "Kilidi aç",
    incorrectPin: "Hatalı PIN.",

    editPriceSave: "Kaydet",
    editPriceCancel: "İptal",
    editPriceInvalid: "Geçerli bir fiyat girin.",
    editPriceFailed: "Kaydedilemedi.",

    newItemHeading: (category: string) => `Yeni ürün — ${category}`,
    nameEnLabel: "İsim (İngilizce)",
    nameTrLabel: "İsim (Türkçe)",
    descEnLabel: "Açıklama (İngilizce)",
    descTrLabel: "Açıklama (Türkçe)",
    descOptionalHint: "opsiyonel — boş bırakılırsa diğer dildeki metin kullanılır",
    priceLabel: "Fiyat (₺)",
    imageLabel: "Görsel URL'si",
    imageOptionalHint: "opsiyonel — boş bırakılırsa bir yer tutucu görsel kullanılır",
    popularLabel: "Öne çıkan ürün",
    addItemSubmit: "Ürün ekle",
    addItemSubmitting: "Ekleniyor…",
    formCancel: "İptal",
    nameRequired: "İsim gerekli.",
    priceInvalid: "Geçerli bir fiyat girin.",
    addItemFailed: "Ürün eklenemedi.",
  },
} as const;
