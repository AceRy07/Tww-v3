import 'dotenv/config';

import { db } from '@/lib/db';
import { products, productTranslations } from '@/lib/db/schema';
import { rawProducts } from '@/lib/data';

const stockBySku: Record<string, number> = {
  'TWW-DT-001': 24,
  'TWW-CT-001': 12,
  'TWW-ST-001': 8,
  'TWW-SH-001': 31,
  'TWW-SIT-001': 6,
  'TWW-DK-001': 18,
  'TWW-CT-002': 9,
  'TWW-DT-002': 14,
};

async function seed() {
  for (const product of rawProducts) {
    const [savedProduct] = await db
      .insert(products)
      .values({
        sku: product.sku,
        price: product.price.toString(),
        stock: stockBySku[product.sku] ?? 0,
        category: product.category,
        dimensions: product.dimensions,
        images: product.images,
        slug: product.slug,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: products.sku,
        set: {
          price: product.price.toString(),
          stock: stockBySku[product.sku] ?? 0,
          category: product.category,
          dimensions: product.dimensions,
          images: product.images,
          slug: product.slug,
          updatedAt: new Date(),
        },
      })
      .returning({ id: products.id });

    await db
      .insert(productTranslations)
      .values({
        productId: savedProduct.id,
        languageCode: 'tr',
        name: product.title,
        description: product.description.tr,
      })
      .onConflictDoUpdate({
        target: [productTranslations.productId, productTranslations.languageCode],
        set: {
          name: product.title,
          description: product.description.tr,
        },
      });

    await db
      .insert(productTranslations)
      .values({
        productId: savedProduct.id,
        languageCode: 'en',
        name: product.title,
        description: product.description.en,
      })
      .onConflictDoUpdate({
        target: [productTranslations.productId, productTranslations.languageCode],
        set: {
          name: product.title,
          description: product.description.en,
        },
      });
  }

  console.log(`Seed completed. Processed ${rawProducts.length} products.`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
