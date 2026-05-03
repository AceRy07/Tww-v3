import { AlertTriangle, Plus } from 'lucide-react';
import { createDraftProductAction } from '@/lib/actions/inventory-actions';

import InventoryTableClient from '@/components/admin/InventoryTableClient';
import { getInventoryItems } from '@/lib/data';

export const dynamic = "force-dynamic"; // Bu sayfanÄ±n statik olarak build edilmesini engeller

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

        <form action={createDraftProductAction}><button type="submit" className="inline-flex cursor-pointer list-none items-center gap-2 border border-white bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-black"><Plus className="h-4 w-4" aria-hidden="true" />New Product</button></form>
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



