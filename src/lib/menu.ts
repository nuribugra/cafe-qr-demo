import { promises as fs } from "fs";
import path from "path";
import type { LocalizedText } from "@/lib/i18n";

const DATA_FILE = path.join(process.cwd(), "data", "menu.json");

export interface Category {
  id: string;
  name: LocalizedText;
  /** Short editorial subtitle shown on the category tile, e.g. "Freshly ground, carefully brewed". */
  tagline?: LocalizedText;
  /** Background photo for the category tile. */
  image: string;
  order: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  image: string;
  popular: boolean;
  active: boolean;
}

export interface MenuData {
  categories: Category[];
  items: MenuItem[];
}

/** Reads the menu JSON file from disk. */
export async function readMenuData(): Promise<MenuData> {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as MenuData;
}

/** Writes the menu JSON file back to disk, pretty-printed. */
export async function writeMenuData(data: MenuData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/** Generates a URL-friendly id from a product name, falling back to a random suffix on collision. */
export function slugify(name: string, existingIds: Set<string>): string {
  const base =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "item";

  if (!existingIds.has(base)) return base;

  let suffix = 2;
  while (existingIds.has(`${base}-${suffix}`)) suffix++;
  return `${base}-${suffix}`;
}
