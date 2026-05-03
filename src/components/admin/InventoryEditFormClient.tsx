'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateInventoryProductAction } from '@/lib/actions/inventory-actions';
import ImageManager, { type ManagedProductImage } from '@/components/admin/ImageManager';
import { CATEGORY_VALUES, COLOR_VALUES } from '@/lib/product-config';

type Product = {
  sku: string;
  slug: string;
  category: string;
  color: string;
  price: number;
  stock: number;
  colorHex: string;
  images: string[];
  productImages: ManagedProductImage[];
  dimensions: { width: number; height: number; depth: number };
  featured: boolean;
  translations: {
    tr: { name: string; material: string; description: string };
    en: { name: string; material: string; description: string };
  };
};

type Props = {
  productId: string;
  product: Product;
};

export default function InventoryEditFormClient({ productId, product }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [hasPendingUploads, setHasPendingUploads] = useState(false);

  const isDraft = product.sku.startsWith('DRAFT-');

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setFormError(null);
      const result = await updateInventoryProductAction(productId, formData);

      if (result && !result.success) {
        const message = result.message || 'Ürün güncellenemedi.';
        setFormError(message);
        toast.error(message);
        return;
      }

      toast.success('Ürün başarıyla kaydedildi');
      router.push('/admin/inventory');
    });
  }

  return (
    <div className="space-y-8">
      <ImageManager
        productId={productId}
        images={product.productImages}
        onPendingChange={setHasPendingUploads}
      />

      <form action={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">SKU</span>
          <input
            name="sku"
            defaultValue={isDraft ? '' : product.sku}
            placeholder="TWW-XX-001"
            className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white focus:outline-none focus:border-[#4a4a4a]"
            required
          />
        </label>
        
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Slug</span>
          <input
            name="slug"
            defaultValue={isDraft ? '' : product.slug}
            placeholder="ornek-urun-ismi"
            className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white focus:outline-none focus:border-[#4a4a4a]"
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Kategori</span>
          <select
            name="category"
            defaultValue={product.category}
            className="min-h-10 border border-[#2a2a2a] bg-[#131313] px-3 text-sm text-white focus:outline-none focus:border-[#4a4a4a]"
          >
            {CATEGORY_VALUES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Renk</span>
          <select
            name="color"
            defaultValue={product.color}
            className="min-h-10 border border-[#2a2a2a] bg-[#131313] px-3 text-sm text-white focus:outline-none focus:border-[#4a4a4a]"
          >
            {COLOR_VALUES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Fiyat</span>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={isDraft ? '' : product.price}
            placeholder="0.00"
            className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white focus:outline-none focus:border-[#4a4a4a]"
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Stok</span>
          <input
            name="stock"
            type="number"
            min="0"
            defaultValue={isDraft ? '' : product.stock}
            placeholder="0"
            className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white focus:outline-none focus:border-[#4a4a4a]"
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Renk Kodu (Hex)</span>
          <input
            name="colorHex"
            defaultValue={isDraft ? '' : product.colorHex}
            placeholder="#383838"
            className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white focus:outline-none focus:border-[#4a4a4a]"
            required
          />
        </label>
        
        {/* Gizli input ile yukaridaki ImageManager'dan gelen productImages url'lerini aktariyoruz */}
        <input 
          type="hidden" 
          name="images" 
          value={product.productImages.length > 0 ? product.productImages.map(img => img.url).join(', ') : 'https://placeholder.com/empty'} 
        />

        <div className="grid grid-cols-3 gap-3 md:col-span-1">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Genislik</span>
            <input
              name="width"
              type="number"
              min="1"
              defaultValue={isDraft ? '' : product.dimensions.width}
              placeholder="G"
              className="min-h-10 w-full border border-[#2a2a2a] bg-transparent px-3 text-sm text-white focus:outline-none focus:border-[#4a4a4a]"
              required
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Yukseklik</span>
            <input
              name="height"
              type="number"
              min="1"
              defaultValue={isDraft ? '' : product.dimensions.height}
              placeholder="Y"
              className="min-h-10 w-full border border-[#2a2a2a] bg-transparent px-3 text-sm text-white focus:outline-none focus:border-[#4a4a4a]"
              required
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Derinlik</span>
            <input
              name="depth"
              type="number"
              min="1"
              defaultValue={isDraft ? '' : product.dimensions.depth}
              placeholder="D"
              className="min-h-10 w-full border border-[#2a2a2a] bg-transparent px-3 text-sm text-white focus:outline-none focus:border-[#4a4a4a]"
              required
            />
          </label>
        </div>

        <div className="md:col-span-2 border-t border-[#2a2a2a] pt-6 mt-2">
          <h3 className="text-sm font-medium text-white mb-4">Türkçe İçerik</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Ürün Adı (TR)</span>
              <input
                name="nameTr"
                defaultValue={isDraft ? '' : product.translations.tr.name}
                placeholder="Örn: Siyah Yemek Masası"
                className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white focus:outline-none focus:border-[#4a4a4a]"
                required
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Materyal (TR)</span>
              <input
                name="materialTr"
                defaultValue={isDraft ? '' : product.translations.tr.material}
                placeholder="Örn: Masif Ahşap ve Demir"
                className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white focus:outline-none focus:border-[#4a4a4a]"
                required
              />
            </label>
            <label className="flex flex-col gap-1.5 md:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Açıklama (TR)</span>
              <textarea
                name="descriptionTr"
                defaultValue={isDraft ? '' : product.translations.tr.description}
                placeholder="Ürünün detaylı açıklaması..."
                className="min-h-20 border border-[#2a2a2a] bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4a4a4a]"
                required
              />
            </label>
          </div>
        </div>

        <div className="md:col-span-2 border-t border-[#2a2a2a] pt-6 mt-2">
          <h3 className="text-sm font-medium text-white mb-4">English Content</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Product Name (EN)</span>
              <input
                name="nameEn"
                defaultValue={isDraft ? '' : product.translations.en.name}
                placeholder="e.g. Black Dining Table"
                className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white focus:outline-none focus:border-[#4a4a4a]"
                required
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Material (EN)</span>
              <input
                name="materialEn"
                defaultValue={isDraft ? '' : product.translations.en.material}
                placeholder="e.g. Solid Wood and Iron"
                className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white focus:outline-none focus:border-[#4a4a4a]"
                required
              />
            </label>
            <label className="flex flex-col gap-1.5 md:col-span-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">Description (EN)</span>
              <textarea
                name="descriptionEn"
                defaultValue={isDraft ? '' : product.translations.en.description}
                placeholder="Detailed description of the product..."
                className="min-h-20 border border-[#2a2a2a] bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4a4a4a]"
                required
              />
            </label>
          </div>
        </div>

        <label className="md:col-span-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#8e8e8e] cursor-pointer mt-4">
          <input type="checkbox" name="featured" className="h-4 w-4" defaultChecked={product.featured} />
          Featured product
        </label>

        {formError ? (
          <p className="md:col-span-2 text-sm text-[#ff8a8a]" aria-live="polite">
            {formError}
          </p>
        ) : null}

        <div className="md:col-span-2 border-t border-[#2a2a2a] pt-4 flex flex-col gap-3">
          {hasPendingUploads && (
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]" aria-live="polite">
              Gorseller yuklenirken urun kaydedilemez.
            </p>
          )}
          <div>
            <button
              type="submit"
              disabled={isPending || hasPendingUploads}
              className="inline-flex min-h-10 items-center justify-center border border-white bg-white px-5 text-xs font-semibold uppercase tracking-[0.1em] text-black disabled:cursor-not-allowed disabled:opacity-60 transition-colors hover:bg-gray-200"
            >
              {isPending ? 'Kaydediliyor...' : hasPendingUploads ? 'Gorseller Yukleniyor...' : 'Save Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
