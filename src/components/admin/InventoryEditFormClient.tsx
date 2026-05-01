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

      toast.success('Ürün başarıyla güncellendi');
      router.push('/admin/inventory');
    });
  }

  return (
    <div className="space-y-8">
      <ImageManager productId={productId} images={product.productImages} />

      <form action={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          name="sku"
          defaultValue={product.sku}
          placeholder="SKU (TWW-XX-001)"
          className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white"
          required
        />
        <input
          name="slug"
          defaultValue={product.slug}
          placeholder="slug-example"
          className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white"
          required
        />

        <select
          name="category"
          defaultValue={product.category}
          className="min-h-10 border border-[#2a2a2a] bg-[#131313] px-3 text-sm text-white"
        >
          {CATEGORY_VALUES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          name="color"
          defaultValue={product.color}
          className="min-h-10 border border-[#2a2a2a] bg-[#131313] px-3 text-sm text-white"
        >
          {COLOR_VALUES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={product.price}
          placeholder="Price"
          className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white"
          required
        />
        <input
          name="stock"
          type="number"
          min="0"
          defaultValue={product.stock}
          placeholder="Stock"
          className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white"
          required
        />
        <input
          name="colorHex"
          defaultValue={product.colorHex}
          placeholder="#383838"
          className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white"
          required
        />
        <input
          name="images"
          defaultValue={product.images.join(', ')}
          placeholder="https://..., https://..."
          className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white"
          required
        />

        <input
          name="width"
          type="number"
          min="1"
          defaultValue={product.dimensions.width}
          placeholder="Width"
          className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white"
          required
        />
        <input
          name="height"
          type="number"
          min="1"
          defaultValue={product.dimensions.height}
          placeholder="Height"
          className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white"
          required
        />
        <input
          name="depth"
          type="number"
          min="1"
          defaultValue={product.dimensions.depth}
          placeholder="Depth"
          className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white md:col-span-2"
          required
        />

        <input
          name="nameTr"
          defaultValue={product.translations.tr.name}
          placeholder="TR Name"
          className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white"
          required
        />
        <input
          name="materialTr"
          defaultValue={product.translations.tr.material}
          placeholder="TR Material"
          className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white"
          required
        />
        <textarea
          name="descriptionTr"
          defaultValue={product.translations.tr.description}
          placeholder="TR Description"
          className="min-h-20 border border-[#2a2a2a] bg-transparent px-3 py-2 text-sm text-white md:col-span-2"
          required
        />

        <input
          name="nameEn"
          defaultValue={product.translations.en.name}
          placeholder="EN Name"
          className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white"
          required
        />
        <input
          name="materialEn"
          defaultValue={product.translations.en.material}
          placeholder="EN Material"
          className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white"
          required
        />
        <textarea
          name="descriptionEn"
          defaultValue={product.translations.en.description}
          placeholder="EN Description"
          className="min-h-20 border border-[#2a2a2a] bg-transparent px-3 py-2 text-sm text-white md:col-span-2"
          required
        />

        <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#8e8e8e]">
          <input type="checkbox" name="featured" className="h-4 w-4" defaultChecked={product.featured} />
          Featured product
        </label>

        {formError ? (
          <p className="md:col-span-2 text-sm text-[#ff8a8a]" aria-live="polite">
            {formError}
          </p>
        ) : null}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-10 items-center justify-center border border-white bg-white px-5 text-xs font-semibold uppercase tracking-[0.1em] text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? 'Saving...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
