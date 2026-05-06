'use server';

import { asc, eq, inArray, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { colors, products } from '@/db/schema';
import { withAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

type ColorActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | {
      success: false;
      message: string;
      usageCount?: number;
      requiresForce?: boolean;
    };

const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const createColorSchema = z.object({
  name: z.string().trim().min(1).max(120),
  hex: z.string().regex(hexRegex, 'Invalid hex color.'),
});

const updateColorNameSchema = z.object({
  id: z.string().uuid(),
  newName: z.string().trim().min(1).max(120),
});

const updateColorStatusSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

const updateColorSortOrderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        sortOrder: z.number().int().min(0),
      })
    )
    .min(1),
});

const bulkUpdateColorStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  isActive: z.boolean(),
});

const deleteColorSchema = z.object({
  id: z.string().uuid(),
  force: z.boolean().default(false),
});

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

async function ensureUniqueColorSlug(baseName: string) {
  const base = slugify(baseName) || 'color';

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;

    const existing = await db.query.colors.findFirst({
      where: (table, { eq }) => eq(table.slug, candidate),
      columns: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error('Could not generate a unique color slug.');
}

function revalidateColorPaths() {
  revalidatePath('/admin/inventory');
  revalidatePath('/en/catalog');
  revalidatePath('/tr/catalog');
}

export async function getAllColorsAction(): Promise<ColorActionResult<typeof colors.$inferSelect[]>> {
  return await withAdmin(async () => {
    try {
      const rows = await db
        .select()
        .from(colors)
        .orderBy(asc(colors.sortOrder), asc(colors.createdAt));

      return { success: true, data: rows };
    } catch (error) {
      console.error('[actions/getAllColorsAction] Unexpected error:', error);
      return { success: false, message: 'Renkler getirilemedi.' };
    }
  });
}

export async function createColorAction(input: {
  name: string;
  hex: string;
}): Promise<ColorActionResult<typeof colors.$inferSelect>> {
  return await withAdmin(async () => {
    const parsed = createColorSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: 'Gecersiz renk verisi.' };
    }

    try {
      const slug = await ensureUniqueColorSlug(parsed.data.name);

      const inserted = await db
        .insert(colors)
        .values({
          name: parsed.data.name,
          hex: parsed.data.hex.toUpperCase(),
          slug,
        })
        .returning();

      const created = inserted[0];
      if (!created) {
        return { success: false, message: 'Renk olusturulamadi.' };
      }

      revalidateColorPaths();

      return { success: true, data: created };
    } catch (error) {
      console.error('[actions/createColorAction] Unexpected error:', error);
      return { success: false, message: 'Renk olusturulurken hata olustu.' };
    }
  });
}

export async function updateColorNameAction(
  id: string,
  newName: string
): Promise<ColorActionResult> {
  return await withAdmin(async () => {
    const parsed = updateColorNameSchema.safeParse({ id, newName });
    if (!parsed.success) {
      return { success: false, message: 'Gecersiz renk guncelleme verisi.' };
    }

    try {
      const updated = await db
        .update(colors)
        .set({ name: parsed.data.newName })
        .where(eq(colors.id, parsed.data.id))
        .returning({ id: colors.id });

      if (updated.length === 0) {
        return { success: false, message: 'Renk bulunamadi.' };
      }

      revalidateColorPaths();

      return { success: true };
    } catch (error) {
      console.error('[actions/updateColorNameAction] Unexpected error:', error);
      return { success: false, message: 'Renk adi guncellenemedi.' };
    }
  });
}

export async function updateColorStatusAction(
  id: string,
  isActive: boolean
): Promise<ColorActionResult> {
  return await withAdmin(async () => {
    const parsed = updateColorStatusSchema.safeParse({ id, isActive });
    if (!parsed.success) {
      return { success: false, message: 'Gecersiz renk durum verisi.' };
    }

    try {
      const updated = await db
        .update(colors)
        .set({ isActive: parsed.data.isActive })
        .where(eq(colors.id, parsed.data.id))
        .returning({ id: colors.id });

      if (updated.length === 0) {
        return { success: false, message: 'Renk bulunamadi.' };
      }

      revalidateColorPaths();

      return { success: true };
    } catch (error) {
      console.error('[actions/updateColorStatusAction] Unexpected error:', error);
      return { success: false, message: 'Renk durumu guncellenemedi.' };
    }
  });
}

export async function updateColorSortOrderAction(
  items: Array<{ id: string; sortOrder: number }>
): Promise<ColorActionResult> {
  return await withAdmin(async () => {
    const parsed = updateColorSortOrderSchema.safeParse({ items });
    if (!parsed.success) {
      return { success: false, message: 'Gecersiz renk siralama verisi.' };
    }

    try {
      await db.transaction(async (tx) => {
        for (const item of parsed.data.items) {
          await tx
            .update(colors)
            .set({ sortOrder: item.sortOrder })
            .where(eq(colors.id, item.id));
        }
      });

      revalidateColorPaths();

      return { success: true };
    } catch (error) {
      console.error('[actions/updateColorSortOrderAction] Unexpected error:', error);
      return { success: false, message: 'Renk sirasi guncellenemedi.' };
    }
  });
}

export async function bulkUpdateColorStatusAction(
  ids: string[],
  isActive: boolean
): Promise<ColorActionResult> {
  return await withAdmin(async () => {
    const parsed = bulkUpdateColorStatusSchema.safeParse({ ids, isActive });
    if (!parsed.success) {
      return { success: false, message: 'Gecersiz toplu renk durum verisi.' };
    }

    try {
      await db
        .update(colors)
        .set({ isActive: parsed.data.isActive })
        .where(inArray(colors.id, parsed.data.ids));

      revalidateColorPaths();

      return { success: true };
    } catch (error) {
      console.error('[actions/bulkUpdateColorStatusAction] Unexpected error:', error);
      return { success: false, message: 'Renkler guncellenemedi.' };
    }
  });
}

export async function deleteColorAction(input: {
  id: string;
  force?: boolean;
}): Promise<ColorActionResult<{ usageCount: number }>> {
  return await withAdmin(async () => {
    const parsed = deleteColorSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: 'Gecersiz renk silme verisi.' };
    }

    try {
      const existing = await db.query.colors.findFirst({
        where: (table, { eq }) => eq(table.id, parsed.data.id),
        columns: { id: true, name: true, slug: true },
      });

      if (!existing) {
        return { success: false, message: 'Renk bulunamadi.' };
      }

      const usageRows = await db
        .select({ id: products.id })
        .from(products)
        .where(sql`${products.color} = ${existing.name} or ${products.color} = ${existing.slug}`);

      const usageCount = usageRows.length;

      if (!parsed.data.force) {
        return {
          success: false,
          message: `Bu renk ${usageCount} urunde kullaniliyor. Silmek icin force=true gonderin.`,
          usageCount,
          requiresForce: true,
        };
      }

      await db.delete(colors).where(eq(colors.id, existing.id));

      revalidateColorPaths();

      return { success: true, data: { usageCount } };
    } catch (error) {
      console.error('[actions/deleteColorAction] Unexpected error:', error);
      return { success: false, message: 'Renk silinemedi.' };
    }
  });
}
