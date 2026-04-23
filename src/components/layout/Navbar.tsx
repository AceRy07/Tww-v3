'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { withLocale } from '@/i18n/config';
import ThemeToggle from '@/components/layout/ThemeToggle';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

export default function Navbar() {
  const pathname = usePathname();
  const { locale, dictionary } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: dictionary.nav.catalog, href: '/catalog' },
    { label: dictionary.nav.contact, href: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = pathname === `/${locale}`;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled || !isHome
          ? 'bg-background/90 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className={cn(
            'font-semibold text-lg tracking-tight transition-colors',
            scrolled || !isHome ? 'text-foreground' : 'text-white'
          )}
        >
          {dictionary.nav.brand}
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={withLocale(link.href, locale)}
              className={cn(
                'text-sm font-medium transition-colors hover:opacity-70',
                pathname === withLocale(link.href, locale)
                  ? scrolled || !isHome
                    ? 'text-foreground'
                    : 'text-white'
                  : scrolled || !isHome
                  ? 'text-muted-foreground'
                  : 'text-white/80'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={withLocale('/catalog', locale)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-full border transition-all',
              scrolled || !isHome
                ? 'border-foreground text-foreground hover:bg-foreground hover:text-background'
                : 'border-white text-white hover:bg-white hover:text-[#1A1A1A]'
            )}
          >
            {dictionary.nav.viewCollection}
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className={cn(
              'p-2 transition-colors',
              scrolled || !isHome ? 'text-foreground' : 'text-white'
            )}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={dictionary.nav.openMenu}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border px-6 py-6 flex flex-col gap-4">
          <LanguageSwitcher />
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={withLocale(link.href, locale)}
              onClick={() => setMobileOpen(false)}
              className="text-foreground text-base font-medium hover:text-muted-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={withLocale('/catalog', locale)}
            onClick={() => setMobileOpen(false)}
            className="mt-2 px-4 py-2.5 text-center text-sm font-medium rounded-full bg-foreground text-background hover:opacity-90 transition-colors"
          >
            {dictionary.nav.viewCollection}
          </Link>
        </div>
      )}
    </header>
  );
}
