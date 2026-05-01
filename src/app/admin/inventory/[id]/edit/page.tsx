import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getInventoryProductForEdit } from '@/lib/data';
import InventoryEditFormClient from '@/components/admin/InventoryEditFormClient';

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
    <section className="mx-auto w-full max-w-[1440px] border border-[#2a2a2a] bg-[#131313] p-5 md:p-8">
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

      <InventoryEditFormClient productId={id} product={product} />
    </section>
  );
}
