import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import type { CategoryKey, Color } from '@/lib/product-config';
import type { ProductCurrency, ProductPriceType } from '@/lib/pricing';

export const languageCodeEnum = pgEnum('language_code', ['tr', 'en']);
export const productPriceTypeEnum = pgEnum('product_price_type', [
  'fixed',
  'starting_from',
  'request_quote',
]);

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const colors = pgTable('colors', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  hex: text('hex').notNull(),
  slug: text('slug').notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sku: text('sku').notNull().unique(),
    slug: text('slug').notNull().unique(),
    category: text('category').$type<CategoryKey>().notNull(),
    priceType: productPriceTypeEnum('price_type').$type<ProductPriceType>().notNull().default('fixed'),
    price: numeric('price', { precision: 10, scale: 2 }),
    currency: text('currency').$type<ProductCurrency>().notNull().default('TRY'),
    stock: integer('stock').notNull().default(0),
    color: text('color').$type<Color>().notNull(),
    colorHex: text('color_hex').notNull(),
    dimensions: jsonb('dimensions')
      .$type<{ width: number; height: number; depth: number }>()
      .notNull(),
    images: text('images').array().notNull(),
    featured: boolean('featured').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index('products_category_idx').on(table.category),
    featuredIdx: index('products_featured_idx').on(table.featured),
  })
);

export const productTranslations = pgTable(
  'product_translations',
  {
    id: serial('id').primaryKey(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    languageCode: languageCodeEnum('language_code').notNull(),
    name: text('name').notNull(),
    material: text('material').notNull(),
    description: text('description').notNull(),
  },
  (table) => ({
    productLanguageUnique: uniqueIndex('product_translations_product_lang_uidx').on(
      table.productId,
      table.languageCode
    ),
  })
);

export const productImages = pgTable('product_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  publicId: text('public_id').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  isPrimary: boolean('is_primary').notNull().default(false),
});

export const productsRelations = relations(products, ({ many }) => ({
  translations: many(productTranslations),
  images: many(productImages),
}));

export const productTranslationsRelations = relations(productTranslations, ({ one }) => ({
  product: one(products, {
    fields: [productTranslations.productId],
    references: [products.id],
  }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
export type ProductTranslationRow = typeof productTranslations.$inferSelect;
export type NewProductTranslationRow = typeof productTranslations.$inferInsert;
export type ProductImageRow = typeof productImages.$inferSelect;
export type NewProductImageRow = typeof productImages.$inferInsert;

export const inquiryStatusEnum = pgEnum('inquiry_status', [
  'pending',
  'quoted',
  'approved',
  'in_production',
  'qc_packaging',
  'completed',
  'cancelled',
]);

export const inquiries = pgTable('inquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  status: inquiryStatusEnum('status').default('pending'),
  productDetails: jsonb('product_details').$type<{
    productId?: string;
    productName?: string;
    productSlug?: string;
    productImage?: string;
    sku?: string;
    product?: string;
    dimensions?: string;
    requestedDimensions?: string | Record<string, string>;
    notes?: string;
    customerNotes?: string;
    priceType?: ProductPriceType;
    displayedPrice?: number | null;
    currency?: ProductCurrency;
    displayedPriceText?: string;
  }>(),
  quotedPrice: numeric('quoted_price', { precision: 10, scale: 2 }),
  quotedCurrency: text('quoted_currency').$type<ProductCurrency>().notNull().default('TRY'),
  estimatedDeliveryDays: integer('estimated_delivery_days'),
  quoteNote: text('quote_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type InquiryRow = typeof inquiries.$inferSelect;
export type NewInquiryRow = typeof inquiries.$inferInsert;
