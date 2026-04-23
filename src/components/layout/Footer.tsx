import Link from 'next/link';

const footerLinks = [
  { label: 'Catalog', href: '/catalog' },
  { label: 'Contact', href: '/contact' },
];

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          {/* Brand */}
          <div className="max-w-sm">
            <h2 className="text-xl font-semibold tracking-tight mb-3">The West Wing</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Modern furniture crafted from 12mm compact laminate — built for lasting beauty and
              everyday durability.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-3">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-400 text-sm hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} The West Wing. All rights reserved.</p>
          <p>Handcrafted in Turkey</p>
        </div>
      </div>
    </footer>
  );
}
