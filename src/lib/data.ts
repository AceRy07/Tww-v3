import 'server-only';

import { and, desc, eq } from 'drizzle-orm';
import type { Locale } from '@/i18n/config';
import { db } from '@/lib/db';
import { productTranslations, products } from '@/db/schema';
import {
  getCategoryLabel,
  isCategoryKey,
  isColor,
  type CategoryKey,
  type Color,
} from '@/lib/product-config';

export type { CategoryKey, Color };
export { COLORS, getCategoryOptions } from '@/lib/product-config';

export type Product = {
  id: string;
  slug: string;
  sku: string;
  title: string;
  category: CategoryKey;
  categoryLabel: string;
  price: number;
  material: string;
  color: Color;
  colorHex: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  images: string[];
  description: string;
  featured: boolean;
};

export type InventoryItem = {
  id: string;
  sku: string;
  price: number;
  stock: number;
  category: CategoryKey;
  slug: string;
  images: string[];
  title: string | null;
  description: string | null;
};

export type CreateInventoryProductInput = {
  sku: string;
  slug: string;
  category: CategoryKey;
  price: number;
  stock: number;
  color: Color;
  colorHex: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  images: string[];
  featured: boolean;
  translations: {
    tr: {
      name: string;
      material: string;
      description: string;
    };
    en: {
      name: string;
      material: string;
      description: string;
    };
  };
};

export type UpdateInventoryProductInput = CreateInventoryProductInput;

export type InventoryProductForEdit = {
  id: string;
  sku: string;
  slug: string;
  category: CategoryKey;
  price: number;
  stock: number;
  color: Color;
  colorHex: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  images: string[];
  featured: boolean;
  translations: {
    tr: {
      name: string;
      material: string;
      description: string;
    };
    en: {
      name: string;
      material: string;
      description: string;
    };
  };
};

function parsePrice(value: string | number): number {
  return typeof value === 'number' ? value : Number(value);
}

type ProductQueryRow = {
  id: string;
  slug: string;
  sku: string;
  category: string;
  price: string;
  color: string;
  colorHex: string;
  dimensions: { width: number; height: number; depth: number };
  images: string[];
  featured: boolean;
  title: string | null;
  material: string | null;
  description: string | null;
};

function mapToProduct(row: ProductQueryRow, locale: Locale): Product | null {
  if (!isCategoryKey(row.category) || !isColor(row.color)) {
    return null;
  }

  if (!row.title || !row.material || !row.description) {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    title: row.title,
    category: row.category,
    categoryLabel: getCategoryLabel(row.category, locale),
    price: parsePrice(row.price),
    material: row.material,
    color: row.color,
    colorHex: row.colorHex,
    dimensions: row.dimensions,
    images: row.images,
    description: row.description,
    featured: row.featured,
  };
}

export async function getProducts(locale: Locale): Promise<Product[]> {
  try {
    const rows = await db
      .select({
        id: products.id,
        slug: products.slug,
        sku: products.sku,
        category: products.category,
        price: products.price,
        color: products.color,
        colorHex: products.colorHex,
        dimensions: products.dimensions,
        images: products.images,
        featured: products.featured,
        title: productTranslations.name,
        material: productTranslations.material,
        description: productTranslations.description,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.languageCode, locale))
      )
      .orderBy(desc(products.createdAt));

    return rows
      .map((row) => mapToProduct(row, locale))
      .filter((product): product is Product => product !== null);
  } catch (error) {
    console.error('[data/getProducts] Failed to fetch products:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string, locale: Locale): Promise<Product | undefined> {
  try {
    const preferred = await db
      .select({
        id: products.id,
        slug: products.slug,
        sku: products.sku,
        category: products.category,
        price: products.price,
        color: products.color,
        colorHex: products.colorHex,
        dimensions: products.dimensions,
        images: products.images,
        featured: products.featured,
        title: productTranslations.name,
        material: productTranslations.material,
        description: productTranslations.description,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.languageCode, locale))
      )
      .where(eq(products.slug, slug))
      .limit(1);

    const preferredProduct = preferred[0] ? mapToProduct(preferred[0], locale) : null;
    if (preferredProduct) {
      return preferredProduct;
    }

    const fallback = await db
      .select({
        id: products.id,
        slug: products.slug,
        sku: products.sku,
        category: products.category,
        price: products.price,
        color: products.color,
        colorHex: products.colorHex,
        dimensions: products.dimensions,
        images: products.images,
        featured: products.featured,
        title: productTranslations.name,
        material: productTranslations.material,
        description: productTranslations.description,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.languageCode, 'en'))
      )
      .where(eq(products.slug, slug))
      .limit(1);

    return fallback[0] ? mapToProduct(fallback[0], locale) ?? undefined : undefined;
  } catch (error) {
    console.error('[data/getProductBySlug] Failed to fetch product:', error);
    return undefined;
  }
}

export async function getFeaturedProducts(locale: Locale): Promise<Product[]> {
  try {
    const rows = await db
      .select({
        id: products.id,
        slug: products.slug,
        sku: products.sku,
        category: products.category,
        price: products.price,
        color: products.color,
        colorHex: products.colorHex,
        dimensions: products.dimensions,
        images: products.images,
        featured: products.featured,
        title: productTranslations.name,
        material: productTranslations.material,
        description: productTranslations.description,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.languageCode, locale))
      )
      .where(eq(products.featured, true))
      .orderBy(desc(products.createdAt));

    return rows
      .map((row) => mapToProduct(row, locale))
      .filter((product): product is Product => product !== null);
  } catch (error) {
    console.error('[data/getFeaturedProducts] Failed to fetch featured products:', error);
    return [];
  }
}

export async function getAllProductSlugs(): Promise<string[]> {
  try {
    const rows = await db.select({ slug: products.slug }).from(products);
    return rows.map((row) => row.slug);
  } catch (error) {
    console.error('[data/getAllProductSlugs] Failed to fetch product slugs:', error);
    return [];
  }
}

export async function getInventoryItems(locale: Locale = 'tr'): Promise<InventoryItem[]> {
  try {
    const rows = await db
      .select({
        id: products.id,
        sku: products.sku,
        price: products.price,
        stock: products.stock,
        category: products.category,
        slug: products.slug,
        images: products.images,
        title: productTranslations.name,
        description: productTranslations.description,
      })
      .from(products)
      .leftJoin(
        productTranslations,
        and(eq(productTranslations.productId, products.id), eq(productTranslations.languageCode, locale))
      )
      .orderBy(desc(products.createdAt));

    return rows
      .filter((row) => isCategoryKey(row.category))
      .map((row) => ({
        id: row.id,
        sku: row.sku,
        price: parsePrice(row.price),
        stock: row.stock,
        category: row.category,
        slug: row.slug,
        images: row.images,
        title: row.title,
        description: row.description,
      }));
  } catch (error) {
    console.error('[data/getInventoryItems] Failed to fetch inventory:', error);
    return [];
  }
}

export async function createInventoryProduct(input: CreateInventoryProductInput): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(products)
        .values({
          sku: input.sku,
          slug: input.slug,
          category: input.category,
          price: input.price.toFixed(2),
          stock: input.stock,
          color: input.color,
          colorHex: input.colorHex,
          dimensions: input.dimensions,
          images: input.images,
          featured: input.featured,
          updatedAt: new Date(),
        })
        .returning({ id: products.id });

      await tx.insert(productTranslations).values([
        {
          productId: created.id,
          languageCode: 'tr',
          name: input.translations.tr.name,
          material: input.translations.tr.material,
          description: input.translations.tr.description,
        },
        {
          productId: created.id,
          languageCode: 'en',
          name: input.translations.en.name,
          material: input.translations.en.material,
          description: input.translations.en.description,
        },
      ]);
    });
  } catch (error) {
    console.error('[data/createInventoryProduct] Failed to create product:', error);
    throw new Error('Urun eklenemedi. Lutfen alanlari kontrol edip tekrar deneyin.');
  }
}

export async function getInventoryProductForEdit(productId: string): Promise<InventoryProductForEdit | null> {
  try {
    const [productRow] = await db
      .select({
        id: products.id,
        sku: products.sku,
        slug: products.slug,
        category: products.category,
        price: products.price,
        stock: products.stock,
        color: products.color,
        colorHex: products.colorHex,
        dimensions: products.dimensions,
        images: products.images,
        featured: products.featured,
      })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!productRow || !isCategoryKey(productRow.category) || !isColor(productRow.color)) {
      return null;
    }

    const translationRows = await db
      .select({
        languageCode: productTranslations.languageCode,
        name: productTranslations.name,
        material: productTranslations.material,
        description: productTranslations.description,
      })
      .from(productTranslations)
      .where(eq(productTranslations.productId, productId));

    const tr = translationRows.find((row) => row.languageCode === 'tr');
    const en = translationRows.find((row) => row.languageCode === 'en');

    return {
      id: productRow.id,
      sku: productRow.sku,
      slug: productRow.slug,
      category: productRow.category,
      price: parsePrice(productRow.price),
      stock: productRow.stock,
      color: productRow.color,
      colorHex: productRow.colorHex,
      dimensions: productRow.dimensions,
      images: productRow.images,
      featured: productRow.featured,
      translations: {
        tr: {
          name: tr?.name ?? '',
          material: tr?.material ?? '',
          description: tr?.description ?? '',
        },
        en: {
          name: en?.name ?? '',
          material: en?.material ?? '',
          description: en?.description ?? '',
        },
      },
    };
  } catch (error) {
    console.error('[data/getInventoryProductForEdit] Failed to fetch product:', error);
    return null;
  }
}

export async function updateInventoryProduct(
  productId: string,
  input: UpdateInventoryProductInput
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({
          sku: input.sku,
          slug: input.slug,
          category: input.category,
          price: input.price.toFixed(2),
          stock: input.stock,
          color: input.color,
          colorHex: input.colorHex,
          dimensions: input.dimensions,
          images: input.images,
          featured: input.featured,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

      await tx
        .insert(productTranslations)
        .values({
          productId,
          languageCode: 'tr',
          name: input.translations.tr.name,
          material: input.translations.tr.material,
          description: input.translations.tr.description,
        })
        .onConflictDoUpdate({
          target: [productTranslations.productId, productTranslations.languageCode],
          set: {
            name: input.translations.tr.name,
            material: input.translations.tr.material,
            description: input.translations.tr.description,
          },
        });

      await tx
        .insert(productTranslations)
        .values({
          productId,
          languageCode: 'en',
          name: input.translations.en.name,
          material: input.translations.en.material,
          description: input.translations.en.description,
        })
        .onConflictDoUpdate({
          target: [productTranslations.productId, productTranslations.languageCode],
          set: {
            name: input.translations.en.name,
            material: input.translations.en.material,
            description: input.translations.en.description,
          },
        });
    });
  } catch (error) {
    console.error('[data/updateInventoryProduct] Failed to update product:', error);
    throw new Error('Urun guncellenemedi. Lutfen tekrar deneyin.');
  }
}

export async function deleteInventoryProduct(productId: string): Promise<void> {
  try {
    await db.delete(products).where(eq(products.id, productId));
  } catch (error) {
    console.error('[data/deleteInventoryProduct] Failed to delete product:', error);
    throw new Error('Urun silinemedi. Lutfen tekrar deneyin.');
  }
}
