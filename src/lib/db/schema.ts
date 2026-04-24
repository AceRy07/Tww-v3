import { relations } from 'drizzle-orm';
import {
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

export const languageCodeEnum = pgEnum('language_code', ['tr', 'en']);

export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sku: text('sku').notNull().unique(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    stock: integer('stock').notNull().default(0),
    category: text('category').notNull(),
    dimensions: jsonb('dimensions')
      .$type<{ width: number; height: number; depth: number }>()
      .notNull(),
    images: text('images').array().notNull(),
    slug: text('slug').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index('products_category_idx').on(table.category),
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
    description: text('description').notNull(),
  },
  (table) => ({
    productLanguageUnique: uniqueIndex('product_translations_product_lang_uidx').on(
      table.productId,
      table.languageCode
    ),
  })
);

export const productsRelations = relations(products, ({ many }) => ({
  translations: many(productTranslations),
}));

export const productTranslationsRelations = relations(productTranslations, ({ one }) => ({
  product: one(products, {
    fields: [productTranslations.productId],
    references: [products.id],
  }),
}));

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
export type ProductTranslationRow = typeof productTranslations.$inferSelect;
export type NewProductTranslationRow = typeof productTranslations.$inferInsert;