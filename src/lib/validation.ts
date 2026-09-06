import { z } from "zod";

const localizedTextSchema = z.object({
  en: z.string().trim().max(500).optional().default(""),
  tr: z.string().trim().max(500).optional().default(""),
});

/** A LocalizedText where at least one language must actually have content. */
const requiredLocalizedTextSchema = localizedTextSchema.refine(
  (val) => val.en.length > 0 || val.tr.length > 0,
  { message: "At least one language is required." }
);

export const loginSchema = z.object({
  password: z.string().min(1).max(200),
});

export const createItemSchema = z.object({
  name: requiredLocalizedTextSchema,
  description: localizedTextSchema.optional(),
  price: z.number().finite().nonnegative(),
  image: z.string().trim().max(2000).optional().default(""),
  categoryId: z.string().trim().min(1, "Category is required."),
  popular: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
});

export const updateItemSchema = z.object({
  id: z.string().trim().min(1, "Item id is required."),
  name: requiredLocalizedTextSchema.optional(),
  description: localizedTextSchema.optional(),
  price: z.number().finite().nonnegative().optional(),
  image: z.string().trim().max(2000).optional(),
  categoryId: z.string().trim().min(1).optional(),
  popular: z.boolean().optional(),
  active: z.boolean().optional(),
});
