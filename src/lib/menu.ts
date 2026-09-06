import { Redis } from "@upstash/redis";
import type { LocalizedText } from "@/lib/i18n";
import seedMenuData from "../../data/menu.json";

// The whole menu is stored as a single JSON value under this key — reads and
// writes replace it wholesale, the same way the old file-based version read
// and rewrote the entire data/menu.json file on every change.
const MENU_KEY = "cafe:menu";

let cachedClient: Redis | null = null;

/**
 * Lazily builds the Upstash client, with a clear error if it isn't configured.
 * Accepts both env var namings: UPSTASH_REDIS_REST_* (a plain Upstash.com
 * account, or the older Vercel Marketplace naming) and KV_REST_API_* (what
 * Vercel's current "Upstash for Redis" integration injects), so it works
 * regardless of how the database was provisioned.
 */
function getRedis(): Redis {
  if (cachedClient) return cachedClient;

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Missing Upstash Redis env vars (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN, " +
        "or KV_REST_API_URL / KV_REST_API_TOKEN). Create a free database at " +
        "https://upstash.com (or add the 'Upstash for Redis' integration from the " +
        "Vercel Marketplace) and set these env vars — see .env.example."
    );
  }

  cachedClient = new Redis({ url, token });
  return cachedClient;
}

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

/**
 * Reads the menu from Redis. On first run — nothing in Redis yet — it seeds
 * the store from the starter menu bundled in data/menu.json, so a fresh
 * deploy (or a fresh local Upstash database) still comes up with a working
 * menu. After that, Redis is the source of truth; the JSON file is never
 * read again at runtime.
 */
export async function readMenuData(): Promise<MenuData> {
  const redis = getRedis();
  const data = await redis.get<MenuData>(MENU_KEY);
  if (data) return data;

  const seeded = seedMenuData as MenuData;
  await redis.set(MENU_KEY, seeded);
  return seeded;
}

/** Writes the menu back to Redis, replacing the previous value entirely. */
export async function writeMenuData(data: MenuData): Promise<void> {
  const redis = getRedis();
  await redis.set(MENU_KEY, data);
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
