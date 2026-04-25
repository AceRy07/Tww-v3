import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { updateInventoryProductAction } from '@/lib/actions/inventory-actions';
import { getInventoryProductForEdit } from '@/lib/data';
import { CATEGORY_VALUES, COLOR_VALUES } from '@/lib/product-config';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic';

export default async function AdminInventoryEditPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getInventoryProductForEdit(id);

  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-[1100px] border border-[#2a2a2a] bg-[#131313] p-5 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#2a2a2a] pb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8e8e8e]">Inventory</p>
          <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">Edit Product</h1>
        </div>

        <Link
          href="/admin/inventory"
          className="inline-flex min-h-10 items-center justify-center gap-2 border border-[#2a2a2a] px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#d3d3d3] transition-colors hover:border-white hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Link>
      </div>

      <form action={updateInventoryProductAction.bind(null, id)} className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
          {CATEGORY_VALUES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          name="color"
          defaultValue={product.color}
          className="min-h-10 border border-[#2a2a2a] bg-[#131313] px-3 text-sm text-white"
        >
          {COLOR_VALUES.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
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

        <div className="md:col-span-2">
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center border border-white bg-white px-5 text-xs font-semibold uppercase tracking-[0.1em] text-black"
          >
            Update Product
          </button>
        </div>
      </form>
    </section>
  );
}
