import { NextRequest, NextResponse } from "next/server";
import { readMenuData, writeMenuData, slugify, type MenuItem } from "@/lib/menu";
import { ADMIN_PIN, ADMIN_PIN_HEADER } from "@/lib/admin";
import type { LocalizedText } from "@/lib/i18n";

// Route Handlers aren't cached by default, but the menu is read/written via
// the filesystem on every request, so make that explicit.
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  return req.headers.get(ADMIN_PIN_HEADER) === ADMIN_PIN;
}

function unauthorized() {
  return NextResponse.json({ error: "Invalid PIN." }, { status: 401 });
}

/**
 * Normalizes a { en, tr } input into a LocalizedText, filling in whichever
 * language was left blank with the other one. Throws if `required` and both
 * are blank.
 */
function normalizeLocalized(input: unknown, fieldName: string, required: boolean): LocalizedText {
  const obj = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const en = typeof obj.en === "string" ? obj.en.trim() : "";
  const tr = typeof obj.tr === "string" ? obj.tr.trim() : "";
  if (required && !en && !tr) {
    throw new Error(`${fieldName} is required.`);
  }
  return { en: en || tr, tr: tr || en };
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
  if (!isAuthorized(req)) return unauthorized();

  let body: Partial<MenuItem>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
  const price = Number(body.price);

  let name: LocalizedText;
  let description: LocalizedText;
  try {
    name = normalizeLocalized(body.name, "Name", true);
    description = normalizeLocalized(body.description, "Description", false);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid name." }, { status: 400 });
  }

  if (!categoryId) return NextResponse.json({ error: "Category is required." }, { status: 400 });
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Price must be a non-negative number." }, { status: 400 });
  }

  const data = await readMenuData();

  if (!data.categories.some((c) => c.id === categoryId)) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 });
  }

  const existingIds = new Set(data.items.map((i) => i.id));
  const newItem: MenuItem = {
    id: slugify(name.en, existingIds),
    categoryId,
    name,
    description,
    price: Math.round(price * 100) / 100,
    image: typeof body.image === "string" && body.image.trim()
      ? body.image.trim()
      : `https://picsum.photos/seed/${encodeURIComponent(name.en)}/600/400`,
    popular: Boolean(body.popular),
    active: body.active === undefined ? true : Boolean(body.active),
  };

  data.items.push(newItem);
  await writeMenuData(data);

  return NextResponse.json(newItem, { status: 201 });
}

/** PATCH /api/menu — admin only, partially updates an existing item (price, active, popular, ...). */
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  let body: Partial<MenuItem> & { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Item id is required." }, { status: 400 });

  if (updates.price !== undefined) {
    const price = Number(updates.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Price must be a non-negative number." }, { status: 400 });
    }
    updates.price = Math.round(price * 100) / 100;
  }
  if (updates.name !== undefined) {
    try {
      updates.name = normalizeLocalized(updates.name, "Name", true);
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid name." }, { status: 400 });
    }
  }
  if (updates.description !== undefined) {
    updates.description = normalizeLocalized(updates.description, "Description", false);
  }

  const data = await readMenuData();
  const idx = data.items.findIndex((i) => i.id === id);
  if (idx === -1) return NextResponse.json({ error: "Item not found." }, { status: 404 });

  if (updates.categoryId && !data.categories.some((c) => c.id === updates.categoryId)) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 });
  }

  data.items[idx] = { ...data.items[idx], ...updates, id: data.items[idx].id };
  await writeMenuData(data);

  return NextResponse.json(data.items[idx]);
}

/** DELETE /api/menu?id=... — admin only, removes an item. */
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Item id is required." }, { status: 400 });

  const data = await readMenuData();
  const idx = data.items.findIndex((i) => i.id === id);
  if (idx === -1) return NextResponse.json({ error: "Item not found." }, { status: 404 });

  const [removed] = data.items.splice(idx, 1);
  await writeMenuData(data);

  return NextResponse.json(removed);
}
