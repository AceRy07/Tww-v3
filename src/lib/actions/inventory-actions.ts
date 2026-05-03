'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import {
  createInventoryProduct,
  deleteInventoryProduct,
  updateInventoryProduct,
} from '@/lib/data';
import { db } from '@/lib/db';
import { parseInventoryProductFormData } from '@/lib/validations/inventory';
import { withAdmin } from '@/lib/auth';
import type { InventoryProductSchema } from '@/lib/validations/inventory';

function mapParsedToInput(values: InventoryProductSchema) {
  return {
    sku: values.sku,
    slug: values.slug,
    category: values.category,
    price: values.price,
    stock: values.stock,
    color: values.color,
    colorHex: values.colorHex,
    dimensions: {
      width: values.width,
      height: values.height,
      depth: values.depth,
    },
    images: values.images,
    featured: values.featured,
    translations: {
      tr: {
        name: values.nameTr,
        material: values.materialTr,
        description: values.descriptionTr,
      },
      en: {
        name: values.nameEn,
        material: values.materialEn,
        description: values.descriptionEn,
      },
    },
  };
}

async function getAuthorizedActionUserId() {
  // withAdmin role kontrolÃ¼nÃ¼ yaptÄ±ÄŸÄ± iÃ§in burada sadece userId'yi audit amaÃ§lÄ± alÄ±yoruz.
  const { userId } = await auth();

  // Development bypass senaryosunda kimlik yoksa data katmanÄ±nÄ±n beklediÄŸi fallback id'yi kullan.
  return userId ?? 'dev-user-id';
}

export async function createInventoryProductAction(formData: FormData) {
  // TÃ¼m admin kontrolÃ¼nÃ¼ wrapper'a taÅŸÄ±yarak action iÃ§inde tekrar eden requireAdmin Ã§aÄŸrÄ±larÄ±nÄ± kaldÄ±rÄ±yoruz.
  return await withAdmin(async () => {
    try {
      // TÃ¼m hata akÄ±ÅŸlarÄ±nÄ± structured response ile dÃ¶ndÃ¼rmek iÃ§in fonksiyonu tek bir try/catch iÃ§inde yÃ¶netiyoruz.
      const userId = await getAuthorizedActionUserId();

      const parsed = parseInventoryProductFormData(formData);

      // Zod/validation hatalarÄ±nda throw yerine tutarlÄ± response formatÄ± dÃ¶n.
      if (!parsed.success) {
        console.error('[actions/createInventoryProductAction] Validation failed:', parsed.error.flatten());
        return {
          success: false,
          message: 'Form alanlarÄ± geÃ§ersiz. LÃ¼tfen bilgileri kontrol edin.',
        };
      }

      // Insert Ã¶ncesi SKU benzersizlik kontrolÃ¼: DB unique hatasÄ±nÄ± kullanÄ±cÄ±ya 500 olarak yansÄ±tmamak iÃ§in erken dÃ¶n.
      const existingSku = await db.query.products.findFirst({
        where: (products, { eq }) => eq(products.sku, parsed.data.sku),
        columns: { id: true },
      });

      if (existingSku) {
        return {
          success: false,
          message: 'Bu SKU zaten kullanÄ±lÄ±yor.',
        };
      }

      const result = await createInventoryProduct(mapParsedToInput(parsed.data), userId);

      // Data katmanÄ±ndan gelen baÅŸarÄ±sÄ±zlÄ±klarÄ± da aynÄ± structured formatla ilet.
      if (!result.success) {
        return {
          success: false,
          message: result.message,
        };
      }

      // Sadece baÅŸarÄ±lÄ± insert sonrasÄ±nda cache invalidation yap.
      revalidatePath('/admin/inventory');

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      // redirect() / notFound() exception'larÄ±nÄ± yakalamadan geÃ§ir.
      if (isRedirectError(error)) throw error;
      // Beklenmeyen hatalarda throw etmeden, istemciye gÃ¼venli ve tutarlÄ± mesaj dÃ¶n.
      console.error('[actions/createInventoryProductAction] Unexpected error:', error);
      return {
        success: false,
        message: 'ÃœrÃ¼n oluÅŸturulurken beklenmeyen bir hata oluÅŸtu.',
      };
    }
  });
}

export async function updateInventoryProductAction(productId: string, formData: FormData) {
  // Admin yetkilendirmesini merkezi wrapper Ã¼zerinden saÄŸlÄ±yoruz.
  return await withAdmin(async () => {
    try {
      const userId = await getAuthorizedActionUserId();

      const parsed = parseInventoryProductFormData(formData);

      // Validation hatalarÄ±nÄ± throw yerine structured response ile dÃ¶ndÃ¼r.
      if (!parsed.success) {
        console.error('[actions/updateInventoryProductAction] Validation failed:', parsed.error.flatten());
        return {
          success: false,
          message: 'Form alanlarÄ± geÃ§ersiz. LÃ¼tfen bilgileri kontrol edin.',
        };
      }

      const result = await updateInventoryProduct(productId, mapParsedToInput(parsed.data), userId);

      // Data katmanÄ±ndan dÃ¶nen baÅŸarÄ±sÄ±zlÄ±klarÄ± da standart response formatÄ±nda ilet.
      if (!result.success) {
        return {
          success: false,
          message: result.message,
        };
      }

      revalidatePath('/admin/inventory');
      revalidatePath(`/admin/inventory/${productId}/edit`);

      return { success: true };
    } catch (error) {
      // redirect() / notFound() exception'larÄ±nÄ± yakalamadan geÃ§ir.
      if (isRedirectError(error)) throw error;
      // Beklenmeyen hatalarda throw etmeden gÃ¼venli mesaj dÃ¶n.
      console.error('[actions/updateInventoryProductAction] Unexpected error:', error);
      return {
        success: false,
        message: 'ÃœrÃ¼n gÃ¼ncellenirken beklenmeyen bir hata oluÅŸtu.',
      };
    }
  });
}

export async function deleteInventoryProductAction(formData: FormData) {
  // Admin yetkilendirmesini merkezi wrapper Ã¼zerinden saÄŸlÄ±yoruz.
  return await withAdmin(async () => {
    try {
      const userId = await getAuthorizedActionUserId();

      const productIdValue = formData.get('productId');
      const productId = typeof productIdValue === 'string' ? productIdValue : '';

      // Eksik productId durumunda throw yerine structured response dÃ¶n.
      if (!productId) {
        return {
          success: false,
          message: 'Silinecek Ã¼rÃ¼n kimliÄŸi bulunamadÄ±.',
        };
      }

      const result = await deleteInventoryProduct(productId, userId);

      if (!result.success) {
        return {
          success: false,
          message: result.message,
        };
      }

      revalidatePath('/admin/inventory');

      return {
        success: true,
      };
    } catch (error) {
      // redirect() / notFound() exception'larÄ±nÄ± yakalamadan geÃ§ir.
      if (isRedirectError(error)) throw error;
      // Beklenmeyen hatalarda throw etmeden gÃ¼venli mesaj dÃ¶n.
      console.error('[actions/deleteInventoryProductAction] Unexpected error:', error);
      return {
        success: false,
        message: 'ÃœrÃ¼n silinirken beklenmeyen bir hata oluÅŸtu.',
      };
    }
  });
}


import { redirect } from 'next/navigation';
import { products, productTranslations } from '@/db/schema';
import { randomUUID } from 'crypto';

export async function createDraftProductAction() {
  return await withAdmin(async () => {
    let draftId = '';
    try {
      const userId = await getAuthorizedActionUserId();
      const id = randomUUID();
      draftId = id;
      const shortId = id.slice(0, 8);

      await db.transaction(async (tx) => {
        await tx.insert(products).values({
          id,
          sku: `DRAFT-${shortId}`,
          slug: `draft-${shortId}`,
          category: 'dining-tables',
          price: "0",
          stock: 0,
          color: 'Anthracite',
          colorHex: '#383838',
          dimensions: { width: 1, height: 1, depth: 1 },
          images: [],
          featured: false,
          updatedAt: new Date(),
        });
        
        await tx.insert(productTranslations).values([
          { productId: id, languageCode: 'tr', name: 'Yeni Urun', material: '-', description: '-' },
          { productId: id, languageCode: 'en', name: 'New Product', material: '-', description: '-' }
        ]);
      });
      
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Draft could not be created' };
    }
    
    redirect(`/admin/inventory/${draftId}/edit`);
  });
}
