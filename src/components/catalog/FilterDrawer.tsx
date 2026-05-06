'use client';

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import FilterBar from '@/components/catalog/FilterBar';
import { useLanguage } from '@/components/providers/LanguageProvider';

type FilterDrawerProps = {
  categoryOptions: Array<{ slug: string; name: string }>;
  colorOptions: Array<{ name: string; hex: string }>;
};

export default function FilterDrawer({ categoryOptions, colorOptions }: FilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { locale } = useLanguage();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-border rounded-lg hover:border-muted-foreground transition-colors"
      >
        <SlidersHorizontal size={16} />
        {locale === 'tr' ? 'Filtreler' : 'Filters'}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-screen w-80 bg-background shadow-lg z-50 lg:hidden transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-lg font-semibold text-foreground">
            {locale === 'tr' ? 'Filtreler' : 'Filters'}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-80px)] p-6">
          <FilterBar categoryOptions={categoryOptions} colorOptions={colorOptions} />
        </div>
      </div>
    </>
  );
}
