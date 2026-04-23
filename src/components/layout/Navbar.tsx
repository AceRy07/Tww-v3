'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Catalog', href: '/catalog' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isHome = pathname === '/';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled || !isHome
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className={cn(
            'font-semibold text-lg tracking-tight transition-colors',
            scrolled || !isHome ? 'text-[#1A1A1A]' : 'text-white'
          )}
        >
          The West Wing
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:opacity-70',
                pathname === link.href
                  ? scrolled || !isHome
                    ? 'text-[#1A1A1A]'
                    : 'text-white'
                  : scrolled || !isHome
                  ? 'text-slate-500'
                  : 'text-white/80'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/catalog"
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-full border transition-all',
              scrolled || !isHome
                ? 'border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'
                : 'border-white text-white hover:bg-white hover:text-[#1A1A1A]'
            )}
          >
            View Collection
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className={cn(
            'md:hidden p-2 transition-colors',
            scrolled || !isHome ? 'text-[#1A1A1A]' : 'text-white'
          )}
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[#1A1A1A] text-base font-medium hover:text-slate-500 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/catalog"
            className="mt-2 px-4 py-2.5 text-center text-sm font-medium rounded-full bg-[#1A1A1A] text-white hover:bg-slate-800 transition-colors"
          >
            View Collection
          </Link>
        </div>
      )}
    </header>
  );
}
