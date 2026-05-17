import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getInventoryProductForEdit } from '@/lib/data';
import InventoryEditFormClient from '@/components/admin/InventoryEditFormClient';
import { CATEGORY_VALUES, COLOR_VALUES } from '@/lib/product-config';
import { db } from '@/lib/db';
import { categories, colors } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic';

export default async function AdminInventoryEditPage({ params }: PageProps) {
  const { id } = await params;

  const dbCategories = await db.query.categories.findMany({
    where: eq(categories.isActive, true),
    orderBy: [asc(categories.sortOrder)]
  });

  const dbColors = await db.query.colors.findMany({
    where: eq(colors.isActive, true),
    orderBy: [asc(colors.sortOrder)]
  });

  const formCategories = dbCategories.map((item) => ({
    name: item.name,
    slug: item.slug,
  }));

  const formColors = dbColors.map((item) => ({
    name: item.name,
    slug: item.slug,
    hex: item.hex,
  }));

  const EMPTY_PRODUCT = {
    sku: '',
    slug: '',
    category: dbCategories.length > 0 ? dbCategories[0].slug : CATEGORY_VALUES[0],
    color: dbColors.length > 0 ? dbColors[0].slug : COLOR_VALUES[0],
    priceType: 'fixed' as const,
    price: null,
    currency: 'TRY' as const,
    stock: 0,
    colorHex: dbColors.length > 0 ? dbColors[0].hex : '',
    images: [] as string[],
    productImages: [] as { id: string; url: string; publicId: string; displayOrder: number; isPrimary: boolean }[],
    dimensions: { width: 0, height: 0, depth: 0 },
    featured: false,
    translations: {
      tr: { name: '', material: '', description: '' },
      en: { name: '', material: '', description: '' },
    },
  };

  if (id === 'new') {
    return (
      <section className="mx-auto w-full max-w-[1440px] border border-[#2a2a2a] bg-[#131313] p-5 md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#2a2a2a] pb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8e8e8e]">Inventory</p>
            <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">New Product</h1>
          </div>

          <Link
            href="/admin/inventory"
            className="inline-flex min-h-10 items-center justify-center gap-2 border border-[#2a2a2a] px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#d3d3d3] transition-colors hover:border-white hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
        </div>

        <InventoryEditFormClient
          productId="new"
          product={EMPTY_PRODUCT}
          dbCategories={formCategories}
          dbColors={formColors}
        />
      </section>
    );
  }

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

      <InventoryEditFormClient
        productId={id}
        product={product}
        dbCategories={formCategories}
        dbColors={formColors}
      />
    </section>
  );
}
