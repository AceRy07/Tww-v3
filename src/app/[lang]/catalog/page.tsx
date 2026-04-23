import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducts, type CategoryKey, type Color } from "@/lib/data";
import { hasLocale } from "@/i18n/config";
import ProductCard from "@/components/catalog/ProductCard";
import FilterBar from "@/components/catalog/FilterBar";
import FilterDrawer from "@/components/catalog/FilterDrawer";
import SearchInput from "@/components/catalog/SearchInput";
import ScrollReveal from "@/components/layout/ScrollReveal";

export const metadata: Metadata = {
  title: "Catalog",
  description: "Browse the full West Wing furniture collection.",
};

interface CatalogPageProps {
  params: Promise<{ lang: string }>;
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

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const { lang } = await params;
  const queryParams = await searchParams;

  if (!hasLocale(lang)) {
    notFound();
  }

  const query = queryParams.q?.toLowerCase() ?? "";
  const categories = queryParams.cat
    ? (Array.isArray(queryParams.cat) ? queryParams.cat : [queryParams.cat])
    : [];
  const colors = queryParams.color
    ? (Array.isArray(queryParams.color) ? queryParams.color : [queryParams.color])
    : [];

  const minPrice = Number(queryParams.minPrice ?? 0);
  const maxPrice = Number(queryParams.maxPrice ?? Infinity);
  const minWidth = Number(queryParams.minWidth ?? 0);
  const maxWidth = Number(queryParams.maxWidth ?? Infinity);
  const minHeight = Number(queryParams.minHeight ?? 0);
  const maxHeight = Number(queryParams.maxHeight ?? Infinity);
  const minDepth = Number(queryParams.minDepth ?? 0);
  const maxDepth = Number(queryParams.maxDepth ?? Infinity);

  const products = getProducts(lang);
  const filtered = products.filter((p) => {
    if (
      query &&
      !p.title.toLowerCase().includes(query) &&
      !p.categoryLabel.toLowerCase().includes(query)
    ) {
      return false;
    }

    if (categories.length && !categories.includes(p.category as CategoryKey)) return false;
    if (colors.length && !colors.includes(p.color as Color)) return false;
    if (p.price < minPrice) return false;
    if (queryParams.maxPrice && p.price > maxPrice) return false;
    if (p.dimensions.width < minWidth || p.dimensions.width > maxWidth) return false;
    if (p.dimensions.height < minHeight || p.dimensions.height > maxHeight) return false;
    if (p.dimensions.depth < minDepth || p.dimensions.depth > maxDepth) return false;
    return true;
  });

  return (
    <div className="min-h-screen pt-16">
      <div className="border-b border-border bg-muted py-12 px-6">
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            {lang === "tr" ? "Koleksiyon" : "Collection"}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            {lang === "tr" ? "Tum Urunler" : "All Products"}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex gap-12">
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-24">
              <Suspense>
                <FilterBar />
              </Suspense>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex-1">
                <Suspense>
                  <SearchInput />
                </Suspense>
              </div>
              <FilterDrawer />
            </div>

            <p className="mb-6 text-xs text-muted-foreground">
              {filtered.length} {lang === "tr" ? "urun" : filtered.length === 1 ? "product" : "products"}
            </p>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <h3 className="mb-2 font-medium text-foreground">
                  {lang === "tr" ? "Urun bulunamadi" : "No products found"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "tr"
                    ? "Filtreleri veya arama sorgusunu duzenleyin."
                    : "Try adjusting your filters or search query."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
