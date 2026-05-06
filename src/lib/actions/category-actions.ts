'use server';

import { asc, eq, inArray, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { categories, products } from '@/db/schema';
import { withAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

type CategoryActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | {
      success: false;
      message: string;
      usageCount?: number;
      requiresForce?: boolean;
    };

const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
});

const updateCategoryNameSchema = z.object({
  id: z.string().uuid(),
  newName: z.string().trim().min(1).max(120),
});

const updateCategoryStatusSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

const updateCategorySortOrderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        sortOrder: z.number().int().min(0),
      })
    )
    .min(1),
});

const bulkUpdateCategoryStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  isActive: z.boolean(),
});

const deleteCategorySchema = z.object({
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

async function ensureUniqueCategorySlug(baseName: string) {
  const base = slugify(baseName) || 'category';

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;

    const existing = await db.query.categories.findFirst({
      where: (table, { eq }) => eq(table.slug, candidate),
      columns: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error('Could not generate a unique category slug.');
}

function revalidateCategoryPaths() {
  revalidatePath('/admin/inventory');
  revalidatePath('/en/catalog');
  revalidatePath('/tr/catalog');
}

export async function getAllCategoriesAction(): Promise<CategoryActionResult<typeof categories.$inferSelect[]>> {
  return await withAdmin(async () => {
    try {
      const rows = await db
        .select()
        .from(categories)
        .orderBy(asc(categories.sortOrder), asc(categories.createdAt));

      return { success: true, data: rows };
    } catch (error) {
      console.error('[actions/getAllCategoriesAction] Unexpected error:', error);
      return { success: false, message: 'Kategoriler getirilemedi.' };
    }
  });
}

export async function createCategoryAction(input: {
  name: string;
}): Promise<CategoryActionResult<typeof categories.$inferSelect>> {
  return await withAdmin(async () => {
    const parsed = createCategorySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: 'Gecersiz kategori verisi.' };
    }

    try {
      const slug = await ensureUniqueCategorySlug(parsed.data.name);

      const inserted = await db
        .insert(categories)
        .values({
          name: parsed.data.name,
          slug,
        })
        .returning();

      const created = inserted[0];
      if (!created) {
        return { success: false, message: 'Kategori olusturulamadi.' };
      }

      revalidateCategoryPaths();

      return { success: true, data: created };
    } catch (error) {
      console.error('[actions/createCategoryAction] Unexpected error:', error);
      return { success: false, message: 'Kategori olusturulurken hata olustu.' };
    }
  });
}

export async function updateCategoryNameAction(
  id: string,
  newName: string
): Promise<CategoryActionResult> {
  return await withAdmin(async () => {
    const parsed = updateCategoryNameSchema.safeParse({ id, newName });
    if (!parsed.success) {
      return { success: false, message: 'Gecersiz kategori guncelleme verisi.' };
    }

    try {
      const updated = await db
        .update(categories)
        .set({ name: parsed.data.newName })
        .where(eq(categories.id, parsed.data.id))
        .returning({ id: categories.id });

      if (updated.length === 0) {
        return { success: false, message: 'Kategori bulunamadi.' };
      }

      revalidateCategoryPaths();

      return { success: true };
    } catch (error) {
      console.error('[actions/updateCategoryNameAction] Unexpected error:', error);
      return { success: false, message: 'Kategori adi guncellenemedi.' };
    }
  });
}

export async function updateCategoryStatusAction(
  id: string,
  isActive: boolean
): Promise<CategoryActionResult> {
  return await withAdmin(async () => {
    const parsed = updateCategoryStatusSchema.safeParse({ id, isActive });
    if (!parsed.success) {
      return { success: false, message: 'Gecersiz kategori durum verisi.' };
    }

    try {
      const updated = await db
        .update(categories)
        .set({ isActive: parsed.data.isActive })
        .where(eq(categories.id, parsed.data.id))
        .returning({ id: categories.id });

      if (updated.length === 0) {
        return { success: false, message: 'Kategori bulunamadi.' };
      }

      revalidateCategoryPaths();

      return { success: true };
    } catch (error) {
      console.error('[actions/updateCategoryStatusAction] Unexpected error:', error);
      return { success: false, message: 'Kategori durumu guncellenemedi.' };
    }
  });
}

export async function updateCategorySortOrderAction(
  items: Array<{ id: string; sortOrder: number }>
): Promise<CategoryActionResult> {
  return await withAdmin(async () => {
    const parsed = updateCategorySortOrderSchema.safeParse({ items });
    if (!parsed.success) {
      return { success: false, message: 'Gecersiz kategori siralama verisi.' };
    }

    try {
      await db.transaction(async (tx) => {
        for (const item of parsed.data.items) {
          await tx
            .update(categories)
            .set({ sortOrder: item.sortOrder })
            .where(eq(categories.id, item.id));
        }
      });

      revalidateCategoryPaths();

      return { success: true };
    } catch (error) {
      console.error('[actions/updateCategorySortOrderAction] Unexpected error:', error);
      return { success: false, message: 'Kategori sirasi guncellenemedi.' };
    }
  });
}

export async function bulkUpdateCategoryStatusAction(
  ids: string[],
  isActive: boolean
): Promise<CategoryActionResult> {
  return await withAdmin(async () => {
    const parsed = bulkUpdateCategoryStatusSchema.safeParse({ ids, isActive });
    if (!parsed.success) {
      return { success: false, message: 'Gecersiz toplu kategori durum verisi.' };
    }

    try {
      await db
        .update(categories)
        .set({ isActive: parsed.data.isActive })
        .where(inArray(categories.id, parsed.data.ids));

      revalidateCategoryPaths();

      return { success: true };
    } catch (error) {
      console.error('[actions/bulkUpdateCategoryStatusAction] Unexpected error:', error);
      return { success: false, message: 'Kategoriler guncellenemedi.' };
    }
  });
}

export async function deleteCategoryAction(input: {
  id: string;
  force?: boolean;
}): Promise<CategoryActionResult<{ usageCount: number }>> {
  return await withAdmin(async () => {
    const parsed = deleteCategorySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: 'Gecersiz kategori silme verisi.' };
    }

    try {
      const existing = await db.query.categories.findFirst({
        where: (table, { eq }) => eq(table.id, parsed.data.id),
        columns: { id: true, slug: true },
      });

      if (!existing) {
        return { success: false, message: 'Kategori bulunamadi.' };
      }

      const usageRows = await db
        .select({ id: products.id })
        .from(products)
        .where(sql`${products.category} = ${existing.slug}`);

      const usageCount = usageRows.length;

      if (!parsed.data.force) {
        return {
          success: false,
          message: `Bu kategori ${usageCount} urunde kullaniliyor. Silmek icin force=true gonderin.`,
          usageCount,
          requiresForce: true,
        };
      }

      await db.delete(categories).where(eq(categories.id, existing.id));

      revalidateCategoryPaths();

      return { success: true, data: { usageCount } };
    } catch (error) {
      console.error('[actions/deleteCategoryAction] Unexpected error:', error);
      return { success: false, message: 'Kategori silinemedi.' };
    }
  });
}
