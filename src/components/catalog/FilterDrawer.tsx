'use client';

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import FilterBar from '@/components/catalog/FilterBar';

export default function FilterDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger button (mobile only) */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-lg hover:border-slate-400 transition-colors"
      >
        <SlidersHorizontal size={16} />
        Filters
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-80 bg-white shadow-lg z-50 lg:hidden transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Filters</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-80px)] p-6">
          <FilterBar />
        </div>
      </div>
    </>
  );
}
