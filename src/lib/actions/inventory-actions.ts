'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createInventoryProduct,
  deleteInventoryProduct,
  updateInventoryProduct,
} from '@/lib/data';
import { parseInventoryProductFormData } from '@/lib/validations/inventory';
import { requireAdmin } from '@/lib/auth';
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

export async function createInventoryProductAction(formData: FormData) {
  const userId = await requireAdmin();   // ← Tek satır bu

  const parsed = parseInventoryProductFormData(formData);

  if (!parsed.success) {
    console.error('[actions/createInventoryProductAction] Validation failed:', parsed.error.flatten());
    throw new Error('Form alanları geçersiz. Lütfen bilgileri kontrol edin.');
  }

  const result = await createInventoryProduct(mapParsedToInput(parsed.data), userId);

  if (!result.success) {
    throw new Error(result.message);
  }

  revalidatePath('/admin/inventory');
  redirect('/admin/inventory');
}

export async function updateInventoryProductAction(productId: string, formData: FormData) {
  const userId = await requireAdmin();   // ← Tek satır bu

  const parsed = parseInventoryProductFormData(formData);

  if (!parsed.success) {
    console.error('[actions/updateInventoryProductAction] Validation failed:', parsed.error.flatten());
    throw new Error('Form alanları geçersiz. Lütfen bilgileri kontrol edin.');
  }

  const result = await updateInventoryProduct(productId, mapParsedToInput(parsed.data), userId);

  if (!result.success) {
    throw new Error(result.message);
  }

  revalidatePath('/admin/inventory');
  revalidatePath(`/admin/inventory/${productId}/edit`);
  redirect('/admin/inventory');
}

export async function deleteInventoryProductAction(formData: FormData) {
  const userId = await requireAdmin();   // ← Tek satır bu

  const productIdValue = formData.get('productId');
  const productId = typeof productIdValue === 'string' ? productIdValue : '';

  if (!productId) {
    throw new Error('Silinecek ürün kimliği bulunamadı.');
  }

  const result = await deleteInventoryProduct(productId, userId);

  if (!result.success) {
    throw new Error(result.message);
  }

  revalidatePath('/admin/inventory');
}