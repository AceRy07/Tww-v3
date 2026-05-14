import 'server-only';

import { and, asc, desc, eq, like, not } from 'drizzle-orm';
import type { Locale } from '@/i18n/config';
import { categories, colors, productImages, productTranslations, products } from '@/db/schema';
import { db } from '@/lib/db';
import {
  getCategoryLabel,
  isCategoryKey,
  type CategoryKey,
  type Color,
} from '@/lib/product-config';

export type { CategoryKey, Color };
export { COLORS, getCategoryOptions } from '@/lib/product-config';

export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; message: string };

export type Product = {
  id: string;
  slug: string;
  sku: string;
  title: string;
  category: string;
  categoryLabel: string;
  price: number;
  material: string;
  color: string;
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
  category: string;
  slug: string;
  images: string[];
  title: string | null;
  description: string | null;
};

export type CreateInventoryProductInput = {
  sku: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  color: string;
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
  category: string;
  price: number;
  stock: number;
  color: string;
  colorHex: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  images: string[];
  productImages: {
    id: string;
    url: string;
    publicId: string;
    displayOrder: number;
    isPrimary: boolean;
  }[];
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

export type CatalogCategoryFilterOption = {
  slug: string;
  name: string;
};

export type CatalogColorFilterOption = {
  name: string;
  hex: string;
};

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

type InventoryQueryRow = {
  id: string;
  sku: string;
  price: string;
  stock: number;
  category: string;
  slug: string;
  images: string[];
  title: string | null;
  description: string | null;
};

type DbErrorShape = {
  name?: string;
  message?: string;
  code?: string;
  detail?: string;
  constraint?: string;
  cause?: unknown;
};

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

function parsePrice(value: string | number): number {
  return typeof value === 'number' ? value : Number(value);
}

function toDbPrice(value: number): string {
  return String(value);
}

function toObject(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  return value as Record<string, unknown>;
}

function asDbError(error: unknown): DbErrorShape {
  if (error instanceof Error) {
    return error as DbErrorShape;
  }

  const record = toObject(error);
  if (record) {
    return {
      name: typeof record.name === 'string' ? record.name : 'UnknownError',
      message: typeof record.message === 'string' ? record.message : 'Unknown error',
      code: typeof record.code === 'string' ? record.code : undefined,
      detail: typeof record.detail === 'string' ? record.detail : undefined,
      constraint: typeof record.constraint === 'string' ? record.constraint : undefined,
      cause: record.cause,
    };
  }

  return {
    name: 'UnknownError',
    message: 'Unknown error',
  };
}

function getPgCode(error: unknown): string | undefined {
  const normalized = asDbError(error);
  if (normalized.code) {
    return normalized.code;
  }

  const cause = toObject(normalized.cause);
  if (cause && typeof cause.code === 'string') {
    return cause.code;
  }

  return undefined;
}

function getConstraint(error: unknown): string | undefined {
  const normalized = asDbError(error);
  if (normalized.constraint) {
    return normalized.constraint;
  }

  const cause = toObject(normalized.cause);
  if (cause && typeof cause.constraint === 'string') {
    return cause.constraint;
  }

  return undefined;
}

function getDetail(error: unknown): string | undefined {
  const normalized = asDbError(error);
  if (normalized.detail) {
    return normalized.detail;
  }

  const cause = toObject(normalized.cause);
  if (cause && typeof cause.detail === 'string') {
    return cause.detail;
  }

  return undefined;
}

function logError(scope: string, error: unknown, context?: Record<string, unknown>) {
  const normalized = asDbError(error);
  const cause = toObject(normalized.cause);

  console.error(`[data/${scope}]`, {
    name: normalized.name,
    message: normalized.message,
    code: getPgCode(error),
    constraint: getConstraint(error),
    detail: getDetail(error),
    causeName: cause && typeof cause.name === 'string' ? cause.name : undefined,
    causeMessage: cause && typeof cause.message === 'string' ? cause.message : undefined,
    context,
  });
}

function isUniqueViolation(error: unknown): boolean {
  return getPgCode(error) === '23505';
}

function getUniqueViolationMessage(error: unknown, fallbackMessage: string): string {
  const constraint = getConstraint(error);
  const detail = getDetail(error);

  if (constraint?.includes('sku')) {
    return 'Bu SKU zaten kullaniliyor.';
  }

  if (constraint?.includes('slug')) {
    return 'Bu slug zaten kullaniliyor.';
  }

  if (constraint?.includes('product_lang')) {
    return 'Bu urun icin ayni dilde ceviri zaten mevcut.';
  }

  if (detail && detail.toLowerCase().includes('slug')) {
    return 'Bu slug zaten kullaniliyor.';
  }

  if (detail && detail.toLowerCase().includes('sku')) {
    return 'Bu SKU zaten kullaniliyor.';
  }

  return fallbackMessage;
}

function mapToProduct(row: ProductQueryRow, locale: Locale): Product | null {
  if (!row.title || !row.material || !row.description) {
    return null;
  }

  const categoryLabel = isCategoryKey(row.category)
    ? getCategoryLabel(row.category, locale)
    : row.category
        .split('-')
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ');

  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    title: row.title,
    category: row.category,
    categoryLabel,
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

function mapToInventoryItem(row: InventoryQueryRow): InventoryItem {
  return {
    id: row.id,
    sku: row.sku,
    price: parsePrice(row.price),
    stock: row.stock,
    category: row.category,
    slug: row.slug,
    images: row.images,
    title: row.title,
    description: row.description,
  };
}

function buildProductSelect() {
  return {
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
  };
}

function buildInventorySelect() {
  return {
    id: products.id,
    sku: products.sku,
    price: products.price,
    stock: products.stock,
    category: products.category,
    slug: products.slug,
    images: products.images,
    title: productTranslations.name,
    description: productTranslations.description,
  };
}

function queryProductsByLocale(locale: Locale) {
  return db
    .select(buildProductSelect())
    .from(products)
    .leftJoin(
      productTranslations,
      and(eq(productTranslations.productId, products.id), eq(productTranslations.languageCode, locale))
    );
}

function queryProductBySlugWithLocale(slug: string, locale: Locale) {
  return db
    .select(buildProductSelect())
    .from(products)
    .leftJoin(
      productTranslations,
      and(eq(productTranslations.productId, products.id), eq(productTranslations.languageCode, locale))
    )
    .where(eq(products.slug, slug))
    .limit(1);
}

async function upsertTranslation(
  tx: Tx,
  productId: string,
  languageCode: 'tr' | 'en',
  translation: { name: string; material: string; description: string }
): Promise<void> {
  const updated = await tx
    .update(productTranslations)
    .set({
      name: translation.name,
      material: translation.material,
      description: translation.description,
    })
    .where(
      and(eq(productTranslations.productId, productId), eq(productTranslations.languageCode, languageCode))
    )
    .returning({ id: productTranslations.id });

  if (updated.length > 0) {
    return;
  }

  await tx.insert(productTranslations).values({
    productId,
    languageCode,
    name: translation.name,
    material: translation.material,
    description: translation.description,
  });
}

export async function getProducts(locale: Locale): Promise<Product[]> {
  try {
    const rows = (await queryProductsByLocale(locale).orderBy(desc(products.createdAt))) as ProductQueryRow[];

    return rows
      .map((row) => mapToProduct(row, locale))
      .filter((product): product is Product => product !== null);
  } catch (error) {
    logError('getProducts', error, { locale });
    return [];
  }
}

export async function getActiveCategoryFilters(): Promise<CatalogCategoryFilterOption[]> {
  try {
    const rows = await db
      .select({ slug: categories.slug, name: categories.name })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.createdAt));

    return rows;
  } catch (error) {
    logError('getActiveCategoryFilters', error);
    return [];
  }
}

export async function getActiveColorFilters(): Promise<CatalogColorFilterOption[]> {
  try {
    const rows = await db
      .select({ name: colors.name, hex: colors.hex })
      .from(colors)
      .where(eq(colors.isActive, true))
      .orderBy(asc(colors.sortOrder), asc(colors.createdAt));

    return rows;
  } catch (error) {
    logError('getActiveColorFilters', error);
    return [];
  }
}

export async function getProductBySlug(slug: string, locale: Locale): Promise<Product | undefined> {
  try {
    const preferredRows = (await queryProductBySlugWithLocale(slug, locale)) as ProductQueryRow[];
    const preferred = preferredRows[0] ? mapToProduct(preferredRows[0], locale) : null;

    if (preferred) {
      return preferred;
    }

    const fallbackRows = (await queryProductBySlugWithLocale(slug, 'en')) as ProductQueryRow[];
    const fallback = fallbackRows[0] ? mapToProduct(fallbackRows[0], locale) : null;

    return fallback ?? undefined;
  } catch (error) {
    logError('getProductBySlug', error, { slug, locale });
    return undefined;
  }
}

export async function getFeaturedProducts(locale: Locale): Promise<Product[]> {
  try {
    const rows = (await queryProductsByLocale(locale)
      .where(eq(products.featured, true))
      .orderBy(desc(products.createdAt))) as ProductQueryRow[];

    return rows
      .map((row) => mapToProduct(row, locale))
      .filter((product): product is Product => product !== null);
  } catch (error) {
    logError('getFeaturedProducts', error, { locale });
    return [];
  }
}

export async function getAllProductSlugs(): Promise<string[]> {
  try {
    const rows = await db.select({ slug: products.slug }).from(products);
    return rows.map((row) => row.slug);
  } catch (error) {
    logError('getAllProductSlugs', error);
    return [];
  }
}

export async function getInventoryItems(locale: Locale = 'tr'): Promise<InventoryItem[]> {
    try {
      const rows = (await db
        .select(buildInventorySelect())
        .from(products)
        .leftJoin(
          productTranslations,
          and(eq(productTranslations.productId, products.id), eq(productTranslations.languageCode, locale))
        )
        .where(not(like(products.sku, 'DRAFT-%')))
        .orderBy(desc(products.createdAt))) as InventoryQueryRow[];

    return rows
      .map(mapToInventoryItem)
      .filter((item): item is InventoryItem => item !== null);
  } catch (error) {
    logError('getInventoryItems', error, { locale });
    return [];
  }
}

export async function createInventoryProduct(
  input: CreateInventoryProductInput,
  userId: string
): Promise<ActionResult<{ id: string }>> {
  if (!userId) throw new Error('Yetkisiz islem');

  try {
    const created = await db.transaction(async (tx) => {
      const productData = {
        sku: input.sku,
        slug: input.slug,
        category: input.category as any,
        price: toDbPrice(input.price),
        stock: input.stock,
        color: input.color as any,
        colorHex: input.colorHex,
        dimensions: input.dimensions,
        images: input.images,
        featured: input.featured,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdRows = await tx
        .insert(products)
        .values(productData)
        .returning({ id: products.id });

      const createdProduct = createdRows[0];
      if (!createdProduct) {
        throw new Error('Urun kaydi olusturulamadi.');
      }

      await tx.insert(productTranslations).values([
        {
          productId: createdProduct.id,
          languageCode: 'tr',
          name: input.translations.tr.name,
          material: input.translations.tr.material,
          description: input.translations.tr.description,
        },
        {
          productId: createdProduct.id,
          languageCode: 'en',
          name: input.translations.en.name,
          material: input.translations.en.material,
          description: input.translations.en.description,
        },
      ]);

      return createdProduct;
    });

    return {
      success: true,
      data: { id: created.id },
      message: 'Urun basariyla olusturuldu.',
    };
  } catch (error) {
    logError('createInventoryProduct', error, { userId, sku: input.sku, slug: input.slug });

    if (isUniqueViolation(error)) {
      return {
        success: false,
        message: getUniqueViolationMessage(error, 'Kayit zaten mevcut.'),
      };
    }

    return {
      success: false,
      message: 'Urun olusturulurken beklenmeyen bir hata olustu.',
    };
  }
}

export async function getInventoryProductForEdit(productId: string): Promise<InventoryProductForEdit | null> {
  try {
    const productRows = await db
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

    const productRow = productRows[0];
    if (!productRow) {
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

    const productImageRows = await db
      .select({
        id: productImages.id,
        url: productImages.url,
        publicId: productImages.publicId,
        displayOrder: productImages.displayOrder,
        isPrimary: productImages.isPrimary,
      })
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(productImages.displayOrder);

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
      productImages: productImageRows,
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
    logError('getInventoryProductForEdit', error, { productId });
    return null;
  }
}

export async function updateInventoryProduct(
  productId: string,
  input: UpdateInventoryProductInput,
  userId: string
): Promise<ActionResult<{ id: string }>> {
  if (!userId) throw new Error('Yetkisiz islem');

  try {
    const updatedProduct = await db.transaction(async (tx) => {
      const updatedRows = await tx
        .update(products)
        .set({
          sku: input.sku,
          slug: input.slug,
          category: input.category as any,
          price: toDbPrice(input.price),
          stock: input.stock,
          color: input.color as any,
          colorHex: input.colorHex,
          dimensions: input.dimensions,
          images: input.images,
          featured: input.featured,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
        .returning({ id: products.id });

      const updated = updatedRows[0];
      if (!updated) {
        return null;
      }

      await upsertTranslation(tx, productId, 'tr', {
        name: input.translations.tr.name,
        material: input.translations.tr.material,
        description: input.translations.tr.description,
      });

      await upsertTranslation(tx, productId, 'en', {
        name: input.translations.en.name,
        material: input.translations.en.material,
        description: input.translations.en.description,
      });

      return updated;
    });

    if (!updatedProduct) {
      return {
        success: false,
        message: 'Guncellenecek urun bulunamadi.',
      };
    }

    return {
      success: true,
      data: { id: updatedProduct.id },
      message: 'Urun basariyla guncellendi.',
    };
  } catch (error) {
    logError('updateInventoryProduct', error, {
      userId,
      productId,
      sku: input.sku,
      slug: input.slug,
    });

    if (isUniqueViolation(error)) {
      return {
        success: false,
        message: getUniqueViolationMessage(error, 'Ayni urun bilgileri zaten mevcut.'),
      };
    }

    return {
      success: false,
      message: 'Urun guncellenirken beklenmeyen bir hata olustu.',
    };
  }
}

export async function deleteInventoryProduct(
  productId: string,
  userId: string
): Promise<ActionResult<{ id: string }>> {
  if (!userId) throw new Error('Yetkisiz islem');

  try {
    const deletedProduct = await db.transaction(async (tx) => {
      await tx.delete(productTranslations).where(eq(productTranslations.productId, productId));

      const deletedRows = await tx
        .delete(products)
        .where(eq(products.id, productId))
        .returning({ id: products.id });

      return deletedRows[0] ?? null;
    });

    if (!deletedProduct) {
      return {
        success: false,
        message: 'Silinecek urun bulunamadi.',
      };
    }

    return {
      success: true,
      data: { id: deletedProduct.id },
      message: 'Urun basariyla silindi.',
    };
  } catch (error) {
    logError('deleteInventoryProduct', error, { userId, productId });

    if (isUniqueViolation(error)) {
      return {
        success: false,
        message: getUniqueViolationMessage(error, 'Silme islemi benzersizlik kisitina takildi.'),
      };
    }

    return {
      success: false,
      message: 'Urun silinirken beklenmeyen bir hata olustu.',
    };
  }
}


