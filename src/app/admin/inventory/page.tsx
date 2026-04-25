import { AlertTriangle, Plus } from 'lucide-react';
import { createInventoryProductAction } from '@/lib/actions/inventory-actions';
import InventoryTableClient from '@/components/admin/InventoryTableClient';
import { getInventoryItems } from '@/lib/data';
import { CATEGORY_VALUES, COLOR_VALUES } from '@/lib/product-config';

export const dynamic = "force-dynamic"; // Bu sayfanın statik olarak build edilmesini engeller

const LOW_STOCK_THRESHOLD = 12;

export default async function AdminInventoryPage() {
  const inventoryItems = await getInventoryItems('tr');

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
        </div>

        <details className="w-full max-w-[720px] border border-[#2a2a2a] bg-[#191919] p-4 md:w-auto md:min-w-[560px]">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 border border-white bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-black">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Product
          </summary>

          <form action={createInventoryProductAction} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input name="sku" placeholder="SKU (TWW-XX-001)" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
            <input name="slug" placeholder="slug-example" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />

            <select name="category" className="min-h-10 border border-[#2a2a2a] bg-[#131313] px-3 text-sm text-white" defaultValue="dining-tables">
              {CATEGORY_VALUES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select name="color" className="min-h-10 border border-[#2a2a2a] bg-[#131313] px-3 text-sm text-white" defaultValue="Anthracite">
              {COLOR_VALUES.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>

            <input name="price" type="number" step="0.01" min="0" placeholder="Price" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
            <input name="stock" type="number" min="0" placeholder="Stock" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
            <input name="colorHex" placeholder="#383838" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
            <input name="images" placeholder="https://..., https://..." className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />

            <input name="width" type="number" min="1" placeholder="Width" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
            <input name="height" type="number" min="1" placeholder="Height" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
            <input name="depth" type="number" min="1" placeholder="Depth" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white md:col-span-2" required />

            <input name="nameTr" placeholder="TR Name" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
            <input name="materialTr" placeholder="TR Material" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
            <textarea name="descriptionTr" placeholder="TR Description" className="min-h-20 border border-[#2a2a2a] bg-transparent px-3 py-2 text-sm text-white md:col-span-2" required />

            <input name="nameEn" placeholder="EN Name" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
            <input name="materialEn" placeholder="EN Material" className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white" required />
            <textarea name="descriptionEn" placeholder="EN Description" className="min-h-20 border border-[#2a2a2a] bg-transparent px-3 py-2 text-sm text-white md:col-span-2" required />

            <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#8e8e8e]">
              <input type="checkbox" name="featured" className="h-4 w-4" />
              Featured product
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="inline-flex min-h-10 items-center justify-center border border-white bg-white px-5 text-xs font-semibold uppercase tracking-[0.1em] text-black"
              >
                Save Product
              </button>
            </div>
          </form>
        </details>
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

      <InventoryTableClient inventoryItems={inventoryItems} lowStockThreshold={LOW_STOCK_THRESHOLD} />
    </section>
  );
}
