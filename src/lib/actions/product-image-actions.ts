'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';
import { productImages } from '@/db/schema';
import { db } from '@/lib/db';
import { withAdmin } from '@/lib/auth';

const productImageUrlSchema = z.string().url();
const productImageInputSchema = z.object({
  productId: z.string().uuid(),
  source: z.union([z.string().url(), z.instanceof(File)]),
});

export type UploadProductImageInput = {
  productId: string;
  source: File | string;
};

export type UploadProductImageResult =
  | {
      success: true;
      data: {
        id: string;
        url: string;
        publicId: string;
        isPrimary: boolean;
        displayOrder: number;
      };
    }
  | { success: false; message: string };

type ProductImageMutationResult =
  | { success: true; message?: string }
  | { success: false; message: string };

const updateImagesOrderSchema = z.object({
  productId: z.string().uuid(),
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        order: z.number().int().min(0),
      })
    )
    .min(1),
});

const productImageMutationSchema = z.object({
  productId: z.string().uuid(),
  imageId: z.string().uuid(),
});

cloudinary.config({
  secure: true,
});

function toDataUri(file: File, buffer: Buffer) {
  const mimeType = file.type || 'application/octet-stream';
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

async function uploadToCloudinary(productId: string, source: File | string) {
  const uploadSource =
    typeof source === 'string'
      ? source
      : toDataUri(source, Buffer.from(await source.arrayBuffer()));

  return await cloudinary.uploader.upload(uploadSource, {
    folder: `tww/products/${productId}`,
    resource_type: 'image',
    use_filename: typeof source !== 'string',
    unique_filename: true,
  });
}

export async function uploadProductImageAction(
  input: UploadProductImageInput
): Promise<UploadProductImageResult> {
  return await withAdmin(async () => {
    const parsed = productImageInputSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Gecersiz gorsel yukleme verisi.',
      };
    }

    if (typeof parsed.data.source === 'string') {
      const urlCheck = productImageUrlSchema.safeParse(parsed.data.source);
      if (!urlCheck.success) {
        return {
          success: false,
          message: 'Gecersiz gorsel URLsi.',
        };
      }
    } else if (parsed.data.source.size === 0) {
      return {
        success: false,
        message: 'Bos dosya yuklenemez.',
      };
    }

    let uploadedPublicId: string | null = null;

    try {
      const uploaded = await uploadToCloudinary(parsed.data.productId, parsed.data.source);
      const uploadedUrl = uploaded.secure_url;
      uploadedPublicId = uploaded.public_id;

      if (!uploadedUrl || !uploadedPublicId) {
        return {
          success: false,
          message: 'Cloudinary yuklemesi beklenen veriyi donmedi.',
        };
      }

      const persistedUrl = uploadedUrl;
      const persistedPublicId = uploadedPublicId;

      const inserted = await db.transaction(async (tx) => {
        const existingImages = await tx
          .select({ id: productImages.id })
          .from(productImages)
          .where(eq(productImages.productId, parsed.data.productId));

        const displayOrder = existingImages.length;
        const isPrimary = existingImages.length === 0;

        const rows = await tx
          .insert(productImages)
          .values({
            productId: parsed.data.productId,
            url: persistedUrl,
            publicId: persistedPublicId,
            displayOrder,
            isPrimary,
          })
          .returning({
            id: productImages.id,
            url: productImages.url,
            publicId: productImages.publicId,
            isPrimary: productImages.isPrimary,
            displayOrder: productImages.displayOrder,
          });

        const created = rows[0];
        if (!created) {
          throw new Error('Product image kaydi olusturulamadi.');
        }

        return created;
      });

      revalidatePath('/admin/inventory');
      revalidatePath(`/admin/inventory/${parsed.data.productId}/edit`);

      return {
        success: true,
        data: inserted,
      };
    } catch (error) {
      if (uploadedPublicId) {
        try {
          await cloudinary.uploader.destroy(uploadedPublicId, { resource_type: 'image' });
        } catch (cleanupError) {
          console.error('[uploadProductImageAction] Failed to cleanup Cloudinary upload:', cleanupError);
        }
      }

      console.error('[uploadProductImageAction] Unexpected error:', error);
      return {
        success: false,
        message: 'Gorsel yuklenirken beklenmeyen bir hata olustu.',
      };
    }
  });
}

export async function updateImagesOrder(input: {
  productId: string;
  items: Array<{ id: string; order: number }>;
}): Promise<ProductImageMutationResult> {
  return await withAdmin(async () => {
    const parsed = updateImagesOrderSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: 'Gecersiz gorsel siralama verisi.' };
    }

    try {
      await db.transaction(async (tx) => {
        const ids = parsed.data.items.map((item) => item.id);
        const existing = await tx
          .select({ id: productImages.id })
          .from(productImages)
          .where(
            and(
              eq(productImages.productId, parsed.data.productId),
              inArray(productImages.id, ids)
            )
          );

        if (existing.length !== ids.length) {
          throw new Error('Some product images were not found for this product.');
        }

        for (const item of parsed.data.items) {
          await tx
            .update(productImages)
            .set({ displayOrder: item.order })
            .where(
              and(
                eq(productImages.id, item.id),
                eq(productImages.productId, parsed.data.productId)
              )
            );
        }
      });

      revalidatePath('/admin/inventory');
      revalidatePath(`/admin/inventory/${parsed.data.productId}/edit`);

      return { success: true, message: 'Gorsel sirasi guncellendi.' };
    } catch (error) {
      console.error('[updateImagesOrder] Unexpected error:', error);
      return { success: false, message: 'Gorsel sirasi guncellenemedi.' };
    }
  });
}

export async function setPrimaryProductImageAction(input: {
  productId: string;
  imageId: string;
}): Promise<ProductImageMutationResult> {
  return await withAdmin(async () => {
    const parsed = productImageMutationSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: 'Gecersiz ana gorsel verisi.' };
    }

    try {
      await db.transaction(async (tx) => {
        const existing = await tx
          .select({ id: productImages.id })
          .from(productImages)
          .where(
            and(
              eq(productImages.id, parsed.data.imageId),
              eq(productImages.productId, parsed.data.productId)
            )
          )
          .limit(1);

        if (!existing[0]) {
          throw new Error('Image not found.');
        }

        await tx
          .update(productImages)
          .set({ isPrimary: false })
          .where(eq(productImages.productId, parsed.data.productId));

        await tx
          .update(productImages)
          .set({ isPrimary: true })
          .where(
            and(
              eq(productImages.id, parsed.data.imageId),
              eq(productImages.productId, parsed.data.productId)
            )
          );
      });

      revalidatePath('/admin/inventory');
      revalidatePath(`/admin/inventory/${parsed.data.productId}/edit`);

      return { success: true, message: 'Ana gorsel guncellendi.' };
    } catch (error) {
      console.error('[setPrimaryProductImageAction] Unexpected error:', error);
      return { success: false, message: 'Ana gorsel guncellenemedi.' };
    }
  });
}

export async function deleteProductImageAction(input: {
  productId: string;
  imageId: string;
}): Promise<ProductImageMutationResult> {
  return await withAdmin(async () => {
    const parsed = productImageMutationSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: 'Gecersiz gorsel silme verisi.' };
    }

    try {
      const image = await db
        .select({
          id: productImages.id,
          publicId: productImages.publicId,
          isPrimary: productImages.isPrimary,
        })
        .from(productImages)
        .where(
          and(
            eq(productImages.id, parsed.data.imageId),
            eq(productImages.productId, parsed.data.productId)
          )
        )
        .limit(1);

      const currentImage = image[0];
      if (!currentImage) {
        return { success: false, message: 'Gorsel bulunamadi.' };
      }

      await db.transaction(async (tx) => {
        await tx
          .delete(productImages)
          .where(
            and(
              eq(productImages.id, parsed.data.imageId),
              eq(productImages.productId, parsed.data.productId)
            )
          );

        const remaining = await tx
          .select({ id: productImages.id })
          .from(productImages)
          .where(eq(productImages.productId, parsed.data.productId));

        for (const [index, item] of remaining.entries()) {
          await tx
            .update(productImages)
            .set({ displayOrder: index })
            .where(eq(productImages.id, item.id));
        }

        if (currentImage.isPrimary && remaining[0]) {
          await tx
            .update(productImages)
            .set({ isPrimary: true })
            .where(eq(productImages.id, remaining[0].id));
        }
      });

      try {
        await cloudinary.uploader.destroy(currentImage.publicId, { resource_type: 'image' });
      } catch (cleanupError) {
        console.error('[deleteProductImageAction] Failed to cleanup Cloudinary image:', cleanupError);
      }

      revalidatePath('/admin/inventory');
      revalidatePath(`/admin/inventory/${parsed.data.productId}/edit`);

      return { success: true, message: 'Gorsel silindi.' };
    } catch (error) {
      console.error('[deleteProductImageAction] Unexpected error:', error);
      return { success: false, message: 'Gorsel silinemedi.' };
    }
  });
}

const mirrorUrlInputSchema = z.object({
  productId: z.string().uuid(),
  url: z.string().url(),
});

const MIRROR_MAX_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * URL Mirroring: Sunucu tarafinda URL'yi fetch eder, MIME tipini doğrular (image/*),
 * boyut sınırını kontrol eder ve Cloudinary'ye yükleyip DB'ye kaydeder.
 * SSRF riskini azaltmak için yalnızca admin yetkisiyle çalışır.
 */
export async function mirrorUrlToCloudinaryAction(input: {
  productId: string;
  url: string;
}): Promise<UploadProductImageResult> {
  return await withAdmin(async () => {
    const parsed = mirrorUrlInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: 'Gecersiz URL verisi.' };
    }

    let response: Response;
    try {
      response = await fetch(parsed.data.url, {
        method: 'GET',
        signal: AbortSignal.timeout(15_000),
        headers: { 'User-Agent': 'TWW-ImageMirror/1.0' },
        redirect: 'follow',
      });
    } catch {
      return { success: false, message: 'URL erisimi saglanamadi.' };
    }

    if (!response.ok) {
      return { success: false, message: `URL getirilemedi: HTTP ${response.status}` };
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) {
      return { success: false, message: 'URL bir gorsel kaynagina (image/*) isaret etmiyor.' };
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MIRROR_MAX_BYTES) {
      return { success: false, message: 'Gorsel 20 MB sinirini asiyor.' };
    }

    const mimeType = contentType.split(';')[0].trim();
    const dataUri = `data:${mimeType};base64,${Buffer.from(arrayBuffer).toString('base64')}`;

    let uploadedPublicId: string | null = null;

    try {
      const uploaded = await cloudinary.uploader.upload(dataUri, {
        folder: `tww/products/${parsed.data.productId}`,
        resource_type: 'image',
        unique_filename: true,
      });

      uploadedPublicId = uploaded.public_id;
      const uploadedUrl = uploaded.secure_url;

      if (!uploadedUrl || !uploadedPublicId) {
        return { success: false, message: 'Cloudinary yuklemesi beklenen veriyi donmedi.' };
      }

      const persistedPublicId = uploadedPublicId;
      const persistedUrl = uploadedUrl;

      const inserted = await db.transaction(async (tx) => {
        const existingImages = await tx
          .select({ id: productImages.id })
          .from(productImages)
          .where(eq(productImages.productId, parsed.data.productId));

        const displayOrder = existingImages.length;
        const isPrimary = existingImages.length === 0;

        const rows = await tx
          .insert(productImages)
          .values({
            productId: parsed.data.productId,
            url: persistedUrl,
            publicId: persistedPublicId,
            displayOrder,
            isPrimary,
          })
          .returning({
            id: productImages.id,
            url: productImages.url,
            publicId: productImages.publicId,
            isPrimary: productImages.isPrimary,
            displayOrder: productImages.displayOrder,
          });

        const created = rows[0];
        if (!created) throw new Error('Product image kaydi olusturulamadi.');
        return created;
      });

      revalidatePath('/admin/inventory');
      revalidatePath(`/admin/inventory/${parsed.data.productId}/edit`);

      return { success: true, data: inserted };
    } catch (error) {
      if (uploadedPublicId) {
        try {
          await cloudinary.uploader.destroy(uploadedPublicId, { resource_type: 'image' });
        } catch (cleanupError) {
          console.error('[mirrorUrlToCloudinaryAction] Cleanup failed:', cleanupError);
        }
      }
      console.error('[mirrorUrlToCloudinaryAction] Unexpected error:', error);
      return { success: false, message: 'URL gorsel olarak yuklenemedi.' };
    }
  });
}