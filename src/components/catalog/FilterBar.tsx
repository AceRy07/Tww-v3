'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CATEGORIES, COLORS, type Category, type Color } from '@/lib/data';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategories = searchParams.getAll('cat') as Category[];
  const selectedColors = searchParams.getAll('color') as Color[];
  const minPrice = Number(searchParams.get('minPrice') ?? 0);
  const maxPrice = Number(searchParams.get('maxPrice') ?? 10000);
  const minWidth = Number(searchParams.get('minWidth') ?? 0);
  const maxWidth = Number(searchParams.get('maxWidth') ?? 300);
  const minHeight = Number(searchParams.get('minHeight') ?? 0);
  const maxHeight = Number(searchParams.get('maxHeight') ?? 300);
  const minDepth = Number(searchParams.get('minDepth') ?? 0);
  const maxDepth = Number(searchParams.get('maxDepth') ?? 300);

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');

      for (const [key, value] of Object.entries(updates)) {
        params.delete(key);
        if (value === null) continue;
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const toggleCategory = (cat: Category) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    updateParams({ cat: next.length ? next : null });
  };

  const toggleColor = (color: Color) => {
    const next = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    updateParams({ color: next.length ? next : null });
  };

  const clearAll = () => {
    router.push(pathname);
  };

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedColors.length > 0 ||
    minPrice > 0 ||
    maxPrice < 10000 ||
    minWidth > 0 ||
    maxWidth < 300 ||
    minHeight > 0 ||
    maxHeight < 300 ||
    minDepth > 0 ||
    maxDepth < 300;

  return (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-widest">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#1A1A1A] transition-colors"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
          Category
        </h3>
        <div className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={cn(
                'text-left text-sm px-3 py-2 rounded-lg transition-all',
                selectedCategories.includes(cat)
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="mb-8">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
          Finish / Color
        </h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.name}
              onClick={() => toggleColor(c.name)}
              title={c.name}
              className={cn(
                'group flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all',
                selectedColors.includes(c.name)
                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400'
              )}
            >
              <span
                className="w-3 h-3 rounded-full border border-white/30 shrink-0"
                style={{ backgroundColor: c.hex }}
              />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="mb-8">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
          Price Range
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-400 mb-1 block">Min (₺)</label>
            <input
              type="number"
              min={0}
              max={maxPrice}
              defaultValue={minPrice}
              onBlur={(e) => updateParams({ minPrice: e.target.value || null })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1A1A1A] transition"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-slate-400 mb-1 block">Max (₺)</label>
            <input
              type="number"
              min={minPrice}
              defaultValue={maxPrice}
              onBlur={(e) => updateParams({ maxPrice: e.target.value || null })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1A1A1A] transition"
            />
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="pt-8 border-t border-slate-100">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
          Dimensions (cm)
        </h3>
        
        <div className="mb-6">
          <label className="text-xs text-slate-500 font-medium mb-2 block">Width</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={maxWidth}
              defaultValue={minWidth}
              onBlur={(e) => updateParams({ minWidth: e.target.value || null })}
              placeholder="Min"
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#1A1A1A] transition"
            />
            <span className="text-xs text-slate-400">–</span>
            <input
              type="number"
              min={minWidth}
              defaultValue={maxWidth}
              onBlur={(e) => updateParams({ maxWidth: e.target.value || null })}
              placeholder="Max"
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#1A1A1A] transition"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="text-xs text-slate-500 font-medium mb-2 block">Height</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={maxHeight}
              defaultValue={minHeight}
              onBlur={(e) => updateParams({ minHeight: e.target.value || null })}
              placeholder="Min"
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#1A1A1A] transition"
            />
            <span className="text-xs text-slate-400">–</span>
            <input
              type="number"
              min={minHeight}
              defaultValue={maxHeight}
              onBlur={(e) => updateParams({ maxHeight: e.target.value || null })}
              placeholder="Max"
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#1A1A1A] transition"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-500 font-medium mb-2 block">Depth</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={maxDepth}
              defaultValue={minDepth}
              onBlur={(e) => updateParams({ minDepth: e.target.value || null })}
              placeholder="Min"
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#1A1A1A] transition"
            />
            <span className="text-xs text-slate-400">–</span>
            <input
              type="number"
              min={minDepth}
              defaultValue={maxDepth}
              onBlur={(e) => updateParams({ maxDepth: e.target.value || null })}
              placeholder="Max"
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#1A1A1A] transition"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
