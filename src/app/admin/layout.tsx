import type { ReactNode } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';

/**
 * Admin Layout — Her admin sayfasından önce çalışır.
 *
 * Kontrol sırası:
 * 1. Middleware zaten Clerk oturumunu doğrular; buraya kimliği doğrulanmamış
 *    kullanıcı normalde ulaşamaz (dev bypass aktifse ulaşabilir).
 * 2. `currentUser()` null dönerse → /sign-in'e yönlendir.
 * 3. `privateMetadata.role !== 'admin'` ise → /sign-in'e yönlendir.
 *    (Clerk Dashboard → Users → kullanıcı → Metadata → privateMetadata: { "role": "admin" })
 *
 * ⚠️  DEV BYPASS: NODE_ENV === 'development' ise role kontrolü atlanır.
 *     Production'a geçmeden önce Clerk anahtarlarını tanımla ve gerçek bir
 *     admin kullanıcısı oluşturmayı unutma.
 */
export default async function AdminRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Dev bypass — geliştirme ortamında auth kontrolü yapılmaz.
  if (process.env.NODE_ENV !== 'development') {
    const user = await currentUser();

    // Oturum yoksa sign-in'e yönlendir.
    if (!user) {
      redirect('/sign-in');
    }

    // Role kontrolü — Clerk Dashboard'da privateMetadata.role = "admin" olmalı.
    const role = user.privateMetadata?.role as string | undefined;
    if (role !== 'admin') {
      // Admin yetkisi olmayan kullanıcıyı /sign-in'e gönder.
      // İsterseniz özel bir /unauthorized sayfası da oluşturabilirsiniz.
      redirect('/sign-in');
    }
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
