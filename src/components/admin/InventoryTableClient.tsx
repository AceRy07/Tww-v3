'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { deleteInventoryProductAction } from '@/lib/actions/inventory-actions';
import type { InventoryItem } from '@/lib/data';

type InventoryTableClientProps = {
  inventoryItems: InventoryItem[];
  lowStockThreshold: number;
};

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

export default function InventoryTableClient({ inventoryItems, lowStockThreshold }: InventoryTableClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return inventoryItems;
    }

    return inventoryItems.filter((item) => {
      const haystack = [
        item.title ?? '',
        item.sku,
        item.slug,
        item.category,
        item.description ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [inventoryItems, searchQuery]);

  return (
    <div className="space-y-5">
      <div className="w-full max-w-md border-b border-[#8e8e8e] px-2 focus-within:border focus-within:border-white">
        <label htmlFor="inventory-search" className="sr-only">
          Search inventory
        </label>
        <div className="flex min-h-12 items-center gap-2">
          <Search className="h-4 w-4 shrink-0 text-[#8e8e8e]" aria-hidden="true" />
          <input
            id="inventory-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search inventory"
            className="h-12 w-full bg-transparent text-sm text-white placeholder:text-[#8e8e8e] outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden border border-[#2a2a2a]">
        <div className="hidden min-h-12 grid-cols-[96px_minmax(220px,1.5fr)_140px_140px_150px_220px] items-center gap-4 border-b border-[#2a2a2a] px-6 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e] md:grid">
          <span>Image</span>
          <span>Title / SKU</span>
          <span>Category</span>
          <span>Price</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>

        <div>
          {filteredItems.map((item) => {
            const isLowStock = item.stock <= lowStockThreshold;
            const title = item.title ?? item.slug;

            return (
              <article
                key={item.id}
                className="grid min-h-16 grid-cols-1 gap-4 border-b border-[#2a2a2a] px-4 py-4 transition-colors last:border-b-0 hover:bg-surface-container md:grid-cols-[96px_minmax(220px,1.5fr)_140px_140px_150px_220px] md:items-center md:gap-4 md:px-6"
              >
                <div className="relative h-16 w-16 overflow-hidden border border-[#2a2a2a]">
                  {item.images[0] ? (
                    <Image src={item.images[0]} alt={title} fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a] text-[10px] uppercase tracking-[0.08em] text-[#8e8e8e]">
                      No Img
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-base font-medium text-white">{title}</p>
                  <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">{item.sku}</p>
                </div>

                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">{toLabelCase(item.category)}</p>

                <p className="text-sm font-medium text-white">{formatPrice(item.price)}</p>

                <div>
                  {isLowStock ? (
                    <span className="inline-flex min-h-8 items-center whitespace-nowrap bg-white px-3 text-[12px] font-bold uppercase tracking-[0.1em] text-black">
                      Low Stock
                    </span>
                  ) : (
                    <span className="inline-flex min-h-8 items-center whitespace-nowrap border border-[#2a2a2a] px-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e8e8e]">
                      Stable
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 md:flex-nowrap">
                  <Link
                    href={`/admin/inventory/${item.id}/edit`}
                    className="inline-flex min-h-9 items-center justify-center border border-[#2a2a2a] px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#d3d3d3] transition-colors hover:border-white hover:text-white"
                  >
                    Edit
                  </Link>

                  <form action={deleteInventoryProductAction}>
                    <input type="hidden" name="productId" value={item.id} />
                    <button
                      type="submit"
                      className="inline-flex min-h-9 items-center justify-center border border-[#3b2929] px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#f0c2c2] transition-colors hover:border-[#f0c2c2] hover:text-white"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>

        {filteredItems.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[#8e8e8e]">No products match your search.</div>
        ) : null}
      </div>
    </div>
  );
}
