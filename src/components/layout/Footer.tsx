"use client";

import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { withLocale } from '@/i18n/config';

export default function Footer() {
  const { locale, dictionary } = useLanguage();

  const footerLinks = [
    { label: dictionary.nav.catalog, href: '/catalog' },
    { label: dictionary.nav.contact, href: '/contact' },
  ];

  return (
    <footer className="bg-[#1A1A1A] dark:bg-[#16181d] text-white py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div className="max-w-sm">
            <h2 className="text-xl font-semibold tracking-tight mb-3">The West Wing</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              {dictionary.footer.description}
            </p>
          </div>

          <nav className="flex flex-col gap-3">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={withLocale(link.href, locale)}
                className="text-slate-400 text-sm hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} The West Wing. {dictionary.footer.rights}</p>
          <p>{dictionary.footer.crafted}</p>
        </div>
      </div>
    </footer>
  );
}
