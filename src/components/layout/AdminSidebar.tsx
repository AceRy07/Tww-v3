'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ComponentType, useState } from 'react';
import {
  Boxes,
  Calculator,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  SquareKanban,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Kanban', href: '/admin/kanban', icon: SquareKanban },
  { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
  { label: 'Calculator', href: '/admin/calculator', icon: Calculator },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen((prev) => !prev)}
        className="fixed top-5 left-4 z-50 inline-flex h-10 w-10 items-center justify-center border border-[#2a2a2a] bg-[#0e0e0e]/85 text-[#e5e2e1] backdrop-blur-xl md:hidden"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
      </button>

      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 transition-opacity md:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 border-r border-[#2a2a2a] bg-[#0e0e0e]/88 text-[#e5e2e1] backdrop-blur-xl transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="border-b border-[#2a2a2a] px-6 py-7">
          <p className="text-[1.15rem] font-bold tracking-[-0.02em] text-white">WEST WING</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8e9192]">ADMIN ATELIER</p>
        </div>

        <nav className="flex h-[calc(100%-89px)] flex-col py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'mx-3 mb-2 flex min-h-12 items-center gap-3 border px-4 text-xs font-semibold uppercase tracking-[0.14em] transition-colors',
                  isActive
                    ? 'border-white bg-white text-black'
                    : 'border-transparent text-[#8e9192] hover:border-[#2a2a2a] hover:bg-[#1a1a1a] hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
