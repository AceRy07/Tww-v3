import { z } from 'zod';
import { PRODUCT_PRICE_TYPES } from '@/lib/pricing';

const optionalPriceSchema = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return null;
  return value;
}, z.coerce.number().positive().nullable());

export const inventoryProductSchema = z
  .object({
    sku: z.string().trim().min(3).max(64),
    slug: z
      .string()
      .trim()
      .min(3)
      .max(160)
      .regex(/^[a-z0-9-]+$/),
    category: z.string().min(1, "Category is required"),
    priceType: z.enum(PRODUCT_PRICE_TYPES),
    price: optionalPriceSchema,
    currency: z.enum(['TRY', 'USD']).default('TRY'),
    stock: z.coerce.number().int().min(0),
    color: z.string().min(1, "Color is required"),
    colorHex: z.string().trim().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
    width: z.coerce.number().positive(),
    height: z.coerce.number().positive(),
    depth: z.coerce.number().positive(),
    images: z.array(z.string().url()).min(1),
    featured: z.boolean(),
    nameTr: z.string().trim().min(2),
    materialTr: z.string().trim().min(2),
    descriptionTr: z.string().trim().min(10),
    nameEn: z.string().trim().min(2),
    materialEn: z.string().trim().min(2),
    descriptionEn: z.string().trim().min(10),
  })
  .superRefine((value, ctx) => {
    if ((value.priceType === 'fixed' || value.priceType === 'starting_from') && !value.price) {
      ctx.addIssue({
        code: 'custom',
        path: ['price'],
        message: 'Price is required for fixed and starting from pricing.',
      });
    }
  });

export type InventoryProductSchema = z.infer<typeof inventoryProductSchema>;

export function parseInventoryProductFormData(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const imageList = String(raw.images ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return inventoryProductSchema.safeParse({
    ...raw,
    priceType: raw.priceType ?? 'fixed',
    currency: raw.currency ?? 'TRY',
    images: imageList,
    featured: formData.get('featured') === 'on',
  });
}
