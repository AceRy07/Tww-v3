import Image from 'next/image';
import { and, desc, eq } from 'drizzle-orm';
import { AlertTriangle, MoreHorizontal, Plus, Search } from 'lucide-react';
import { db } from '@/lib/db';
import { products, productTranslations } from '@/lib/db/schema';
export const dynamic = "force-dynamic"; // Bu sayfanın statik olarak build edilmesini engeller

const LOW_STOCK_THRESHOLD = 12;

function toLabelCase(value: string): string {
  return value
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function AdminInventoryPage() {
  const inventoryItems = await db
    .select({
      id: products.id,
      sku: products.sku,
      price: products.price,
      stock: products.stock,
      category: products.category,
      slug: products.slug,
      images: products.images,
      title: productTranslations.name,
      description: productTranslations.description,
    })
    .from(products)
    .leftJoin(
      productTranslations,
      and(eq(productTranslations.productId, products.id), eq(productTranslations.languageCode, 'tr'))
    )
    .orderBy(desc(products.createdAt));

  const totalInventory = inventoryItems.reduce((sum, item) => sum + item.stock, 0);
  const criticalDeficits = inventoryItems.filter((item) => item.stock <= LOW_STOCK_THRESHOLD).length;
  const inboundDeliveries = inventoryItems.filter((item) => item.stock === 0).length;

  return (
    <section className="mx-auto w-full max-w-[1440px] border border-[#2a2a2a] bg-[#131313] p-5 md:p-8">
      <div className="mb-8 flex flex-col gap-5 border-b border-[#2a2a2a] pb-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <h1 className="font-[Inter,sans-serif] text-[24px] font-medium leading-[1.3] text-white">
            Inventory &amp; Stock Control
          </h1>

          <div className="w-full max-w-md border-b border-[#8e8e8e] px-2 focus-within:border focus-within:border-white">
            <label htmlFor="inventory-search" className="sr-only">
              Search inventory
            </label>
            <div className="flex min-h-12 items-center gap-2">
              <Search className="h-4 w-4 shrink-0 text-[#8e8e8e]" aria-hidden="true" />
              <input
                id="inventory-search"
                type="search"
                placeholder="Search inventory"
                className="h-12 w-full bg-transparent text-sm text-white placeholder:text-[#8e8e8e] outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex min-h-12 min-w-12 items-center justify-center gap-2 border border-white bg-white px-5 text-xs font-semibold uppercase tracking-[0.1em] text-black"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Product
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="border border-[#2a2a2a] p-5 md:p-6">
          <p className="font-[Inter,sans-serif] text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">
            Total Inventory
          </p>
          <p className="mt-4 font-[Inter,sans-serif] text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-[64px]">
            {totalInventory}
          </p>
        </article>

        <article className="border border-[#2a2a2a] p-5 md:p-6">
          <div className="flex items-center justify-between gap-2">
            <p className="font-[Inter,sans-serif] text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">
              Critical Deficits
            </p>
            <AlertTriangle className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <p className="mt-4 font-[Inter,sans-serif] text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-[64px]">
            {criticalDeficits}
          </p>
        </article>

        <article className="border border-[#2a2a2a] p-5 md:p-6">
          <p className="font-[Inter,sans-serif] text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">
            Inbound Deliveries
          </p>
          <p className="mt-4 font-[Inter,sans-serif] text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-[64px]">
            {inboundDeliveries}
          </p>
        </article>
      </div>

      <div className="overflow-hidden border border-[#2a2a2a]">
        <div className="hidden min-h-12 grid-cols-[96px_1.5fr_140px_180px_130px_96px] items-center gap-4 border-b border-[#2a2a2a] px-6 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e] md:grid">
          <span>Image</span>
          <span>Title / SKU</span>
          <span>Category</span>
          <span>Price</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>

        <div>
          {inventoryItems.map((item) => {
            const isLowStock = item.stock <= LOW_STOCK_THRESHOLD;
            const title = item.title ?? item.slug;

            return (
              <article
                key={item.id}
                className="grid min-h-16 grid-cols-1 gap-4 border-b border-[#2a2a2a] px-4 py-4 transition-colors last:border-b-0 hover:bg-surface-container md:grid-cols-[96px_1.5fr_140px_180px_130px_96px] md:items-center md:gap-4 md:px-6"
              >
                <div className="relative h-16 w-16 overflow-hidden border border-[#2a2a2a]">
                  <Image src={item.images[0]} alt={title} fill sizes="64px" className="object-cover" />
                </div>

                <div>
                  <p className="text-base font-medium text-white">{title}</p>
                  <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">{item.sku}</p>
                </div>

                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">{toLabelCase(item.category)}</p>

                <p className="text-sm font-medium text-white">{formatPrice(Number(item.price))}</p>

                <div>
                  {isLowStock ? (
                    <span className="inline-flex min-h-8 items-center bg-white px-3 text-[12px] font-bold uppercase tracking-[0.1em] text-black">
                      Low Stock
                    </span>
                  ) : (
                    <span className="inline-flex min-h-8 items-center border border-[#2a2a2a] px-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">
                      Stable
                    </span>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex min-h-12 min-w-12 items-center justify-center border border-transparent text-[#8e8e8e] transition-colors hover:border-[#2a2a2a] hover:text-white"
                    aria-label={`More actions for ${title}`}
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {inventoryItems.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[#8e8e8e]">No products match your search.</div>
        ) : null}
      </div>
    </section>
  );
}
