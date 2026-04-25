import { z } from 'zod';
import { CATEGORY_VALUES, COLOR_VALUES } from '@/lib/product-config';

export const inventoryProductSchema = z.object({
  sku: z.string().trim().min(3).max(64),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9-]+$/),
  category: z.enum(CATEGORY_VALUES),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  color: z.enum(COLOR_VALUES),
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
    images: imageList,
    featured: formData.get('featured') === 'on',
  });
}
