'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
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
  // withAdmin role kontrolünü yaptığı için burada sadece userId'yi audit amaçlı alıyoruz.
  const { userId } = await auth();

  // Development bypass senaryosunda kimlik yoksa data katmanının beklediği fallback id'yi kullan.
  return userId ?? 'dev-user-id';
}

export async function createInventoryProductAction(formData: FormData) {
  // Tüm admin kontrolünü wrapper'a taşıyarak action içinde tekrar eden requireAdmin çağrılarını kaldırıyoruz.
  return await withAdmin(async () => {
    try {
      // Tüm hata akışlarını structured response ile döndürmek için fonksiyonu tek bir try/catch içinde yönetiyoruz.
      const userId = await getAuthorizedActionUserId();

      const parsed = parseInventoryProductFormData(formData);

      // Zod/validation hatalarında throw yerine tutarlı response formatı dön.
      if (!parsed.success) {
        console.error('[actions/createInventoryProductAction] Validation failed:', parsed.error.flatten());
        return {
          success: false,
          message: 'Form alanları geçersiz. Lütfen bilgileri kontrol edin.',
        };
      }

      // Insert öncesi SKU benzersizlik kontrolü: DB unique hatasını kullanıcıya 500 olarak yansıtmamak için erken dön.
      const existingSku = await db.query.products.findFirst({
        where: (products, { eq }) => eq(products.sku, parsed.data.sku),
        columns: { id: true },
      });

      if (existingSku) {
        return {
          success: false,
          message: 'Bu SKU zaten kullanılıyor.',
        };
      }

      const result = await createInventoryProduct(mapParsedToInput(parsed.data), userId);

      // Data katmanından gelen başarısızlıkları da aynı structured formatla ilet.
      if (!result.success) {
        return {
          success: false,
          message: result.message,
        };
      }

      // Sadece başarılı insert sonrasında cache invalidation yap.
      revalidatePath('/admin/inventory');

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      // Beklenmeyen hatalarda throw etmeden, istemciye güvenli ve tutarlı mesaj dön.
      console.error('[actions/createInventoryProductAction] Unexpected error:', error);
      return {
        success: false,
        message: 'Ürün oluşturulurken beklenmeyen bir hata oluştu.',
      };
    }
  });
}

export async function updateInventoryProductAction(productId: string, formData: FormData) {
  // Admin yetkilendirmesini merkezi wrapper üzerinden sağlıyoruz.
  return await withAdmin(async () => {
    try {
      const userId = await getAuthorizedActionUserId();

      const parsed = parseInventoryProductFormData(formData);

      // Validation hatalarını throw yerine structured response ile döndür.
      if (!parsed.success) {
        console.error('[actions/updateInventoryProductAction] Validation failed:', parsed.error.flatten());
        return {
          success: false,
          message: 'Form alanları geçersiz. Lütfen bilgileri kontrol edin.',
        };
      }

      const result = await updateInventoryProduct(productId, mapParsedToInput(parsed.data), userId);

      // Data katmanından dönen başarısızlıkları da standart response formatında ilet.
      if (!result.success) {
        return {
          success: false,
          message: result.message,
        };
      }

      revalidatePath('/admin/inventory');
      revalidatePath(`/admin/inventory/${productId}/edit`);
      redirect('/admin/inventory');
    } catch (error) {
      // Beklenmeyen hatalarda throw etmeden güvenli mesaj dön.
      console.error('[actions/updateInventoryProductAction] Unexpected error:', error);
      return {
        success: false,
        message: 'Ürün güncellenirken beklenmeyen bir hata oluştu.',
      };
    }
  });
}

export async function deleteInventoryProductAction(formData: FormData) {
  // Admin yetkilendirmesini merkezi wrapper üzerinden sağlıyoruz.
  return await withAdmin(async () => {
    try {
      const userId = await getAuthorizedActionUserId();

      const productIdValue = formData.get('productId');
      const productId = typeof productIdValue === 'string' ? productIdValue : '';

      // Eksik productId durumunda throw yerine structured response dön.
      if (!productId) {
        return {
          success: false,
          message: 'Silinecek ürün kimliği bulunamadı.',
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
      // Beklenmeyen hatalarda throw etmeden güvenli mesaj dön.
      console.error('[actions/deleteInventoryProductAction] Unexpected error:', error);
      return {
        success: false,
        message: 'Ürün silinirken beklenmeyen bir hata oluştu.',
      };
    }
  });
}