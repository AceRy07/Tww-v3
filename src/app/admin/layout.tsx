import type { ReactNode } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="h-[100dvh] overflow-hidden bg-[#131313] text-[#e5e2e1]">
      <AdminSidebar />

      <div className="h-full md:ml-64">
        <main className="h-full overflow-y-auto px-4 pt-20 pb-8 md:px-8 md:pt-8 md:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
