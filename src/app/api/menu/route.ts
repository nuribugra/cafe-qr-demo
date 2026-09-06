import { NextRequest, NextResponse } from "next/server";
import { readMenuData, writeMenuData, slugify, type MenuItem } from "@/lib/menu";
import type { LocalizedText } from "@/lib/i18n";
import { isRequestAuthed } from "@/lib/auth";
import { getMutationRateLimit, getClientIp } from "@/lib/rate-limit";
import { createItemSchema, updateItemSchema } from "@/lib/validation";

// Route Handlers aren't cached by default, but the menu is read/written via
// Redis on every request, so make that explicit.
export const dynamic = "force-dynamic";

/** Fills whichever language was left blank with the other one. */
function fillLocalized(text: { en: string; tr: string }): LocalizedText {
  return { en: text.en || text.tr, tr: text.tr || text.en };
}

/**
 * src/proxy.ts already blocks unauthenticated mutating requests before they
 * reach this file, but Next.js's own docs warn that a matcher change or
 * refactor can silently remove Proxy coverage — so every mutating handler
 * re-checks the session here too (defense in depth), plus applies the
 * per-IP rate limit.
 */
async function checkMutationAllowed(req: NextRequest): Promise<NextResponse | null> {
  if (!(await isRequestAuthed(req))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { success } = await getMutationRateLimit().limit(getClientIp(req));
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }
  return null;
}

/** GET /api/menu — public, returns the full menu (categories + items). */
export async function GET() {
  try {
    const data = await readMenuData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Could not read menu data." }, { status: 500 });
  }
}

/** POST /api/menu — admin only, creates a new item. */
export async function POST(req: NextRequest) {
  const denied = await checkMutationAllowed(req);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = createItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const data = await readMenuData();
  if (!data.categories.some((c) => c.id === parsed.data.categoryId)) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 });
  }

  const name = fillLocalized(parsed.data.name);
  const description = fillLocalized(parsed.data.description ?? { en: "", tr: "" });
  const existingIds = new Set(data.items.map((i) => i.id));

  const newItem: MenuItem = {
    id: slugify(name.en, existingIds),
    categoryId: parsed.data.categoryId,
    name,
    description,
    price: Math.round(parsed.data.price * 100) / 100,
    image:
      parsed.data.image || `https://picsum.photos/seed/${encodeURIComponent(name.en)}/600/400`,
    popular: parsed.data.popular,
    active: parsed.data.active,
  };

  data.items.push(newItem);
  await writeMenuData(data);

  return NextResponse.json(newItem, { status: 201 });
}

/** PATCH /api/menu — admin only, partially updates an existing item (price, active, popular, ...). */
export async function PATCH(req: NextRequest) {
  const denied = await checkMutationAllowed(req);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = updateItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { id, name, description, price, ...rest } = parsed.data;

  const data = await readMenuData();
  const idx = data.items.findIndex((i) => i.id === id);
  if (idx === -1) return NextResponse.json({ error: "Item not found." }, { status: 404 });

  if (rest.categoryId && !data.categories.some((c) => c.id === rest.categoryId)) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 });
  }

  const updates: Partial<MenuItem> = { ...rest };
  if (name) updates.name = fillLocalized(name);
  if (description) updates.description = fillLocalized(description);
  if (price !== undefined) updates.price = Math.round(price * 100) / 100;

  data.items[idx] = { ...data.items[idx], ...updates, id: data.items[idx].id };
  await writeMenuData(data);

  return NextResponse.json(data.items[idx]);
}

/** DELETE /api/menu?id=... — admin only, removes an item. */
export async function DELETE(req: NextRequest) {
  const denied = await checkMutationAllowed(req);
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Item id is required." }, { status: 400 });

  const data = await readMenuData();
  const idx = data.items.findIndex((i) => i.id === id);
  if (idx === -1) return NextResponse.json({ error: "Item not found." }, { status: 404 });

  const [removed] = data.items.splice(idx, 1);
  await writeMenuData(data);

  return NextResponse.json(removed);
}
