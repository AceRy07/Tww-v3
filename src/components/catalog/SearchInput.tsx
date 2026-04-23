'use client';

import { useCallback, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        const value = e.target.value.trim();
        if (value) {
          params.set('q', value);
        } else {
          params.delete('q');
        }
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
      }, 300);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        size={16}
      />
      <input
        type="search"
        defaultValue={searchParams.get('q') ?? ''}
        onChange={handleChange}
        placeholder={locale === 'tr' ? 'Urun ara...' : 'Search products...'}
        className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground transition"
      />
    </div>
  );
}
