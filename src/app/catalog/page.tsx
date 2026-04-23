import { Suspense } from 'react';
import type { Metadata } from 'next';
import { products, type Category, type Color } from '@/lib/data';
import ProductCard from '@/components/catalog/ProductCard';
import FilterBar from '@/components/catalog/FilterBar';
import FilterDrawer from '@/components/catalog/FilterDrawer';
import SearchInput from '@/components/catalog/SearchInput';
import ScrollReveal from '@/components/layout/ScrollReveal';

export const metadata: Metadata = {
  title: 'Catalog',
  description: 'Browse the full West Wing furniture collection. Filter by category, color, size, and price.',
};

interface CatalogPageProps {
  searchParams: Promise<{
    q?: string;
    cat?: string | string[];
    color?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    minWidth?: string;
    maxWidth?: string;
    minHeight?: string;
    maxHeight?: string;
    minDepth?: string;
    maxDepth?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  const query = params.q?.toLowerCase() ?? '';
  const categories = params.cat
    ? Array.isArray(params.cat)
      ? params.cat
      : [params.cat]
    : [];
  const colors = params.color
    ? Array.isArray(params.color)
      ? params.color
      : [params.color]
    : [];
  const minPrice = Number(params.minPrice ?? 0);
  const maxPrice = Number(params.maxPrice ?? Infinity);
  const minWidth = Number(params.minWidth ?? 0);
  const maxWidth = Number(params.maxWidth ?? Infinity);
  const minHeight = Number(params.minHeight ?? 0);
  const maxHeight = Number(params.maxHeight ?? Infinity);
  const minDepth = Number(params.minDepth ?? 0);
  const maxDepth = Number(params.maxDepth ?? Infinity);

  const filtered = products.filter((p) => {
    if (query && !p.title.toLowerCase().includes(query) && !p.category.toLowerCase().includes(query))
      return false;
    if (categories.length && !categories.includes(p.category)) return false;
    if (colors.length && !colors.includes(p.color)) return false;
    if (p.price < minPrice) return false;
    if (params.maxPrice && p.price > maxPrice) return false;
    if (p.dimensions.width < minWidth) return false;
    if (p.dimensions.width > maxWidth) return false;
    if (p.dimensions.height < minHeight) return false;
    if (p.dimensions.height > maxHeight) return false;
    if (p.dimensions.depth < minDepth) return false;
    if (p.dimensions.depth > maxDepth) return false;
    return true;
  });

  return (
    <div className="pt-16 min-h-screen">
      {/* Page header */}
      <div className="bg-[#F9F9F9] border-b border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-400 mb-2">
            Collection
          </p>
          <h1 className="text-4xl font-semibold text-[#1A1A1A] tracking-tight">
            All Products
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-24">
              <Suspense>
                <FilterBar />
              </Suspense>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search + mobile filter trigger */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1">
                <Suspense>
                  <SearchInput />
                </Suspense>
              </div>
              <FilterDrawer />
            </div>

            {/* Results count */}
            <p className="text-xs text-slate-400 mb-6">
              {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
            </p>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-2xl mb-2">🪑</p>
                <h3 className="font-medium text-[#1A1A1A] mb-2">No products found</h3>
                <p className="text-sm text-slate-400">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((product, idx) => (
                  <ScrollReveal key={product.id} delay={idx * 0.05}>
                    <ProductCard product={product} />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
