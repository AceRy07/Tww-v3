import type { ReactNode } from 'react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Server-side guard: admin layout render edilmeden once Clerk session ve rol kontrolu yapilir.
  const { userId, orgRole } = await auth();

  if (!userId) {
    // Signed-out kullanicilari dogrudan sign-in sayfasina yonlendir.
    redirect('/sign-in');
  }

  const user = await currentUser();
  const metadataRole = user?.privateMetadata?.role;
  const role = typeof metadataRole === 'string' ? metadataRole : undefined;
  const isOrgAdmin = orgRole === 'admin' || orgRole === 'org:admin';
  const isMetadataAdmin = role === 'admin';

  if (!isMetadataAdmin && !isOrgAdmin) {
    // Layout seviyesinde ikinci bir kontrol katmani ile admin disi erisimi engelle.
    redirect('/sign-in');
  }

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
