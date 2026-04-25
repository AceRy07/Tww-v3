/**
 * src/lib/auth.ts
 * ──────────────────────────────────────────────────────────────
 * Auth yardımcı fonksiyonları — Server Actions ve Route Handlers için.
 *
 * Kullanım (Server Action örneği):
 *   import { requireAdmin } from '@/lib/auth';
 *
 *   export async function myAdminAction(formData: FormData) {
 *     'use server';
 *     await requireAdmin(); // yetkisiz ise fırlatır
 *     // ... işlem
 *   }
 * ──────────────────────────────────────────────────────────────
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

/**
 * Mevcut isteğin admin yetkisine sahip olduğunu doğrular.
 *
 * ⚠️  DEV BYPASS: NODE_ENV === 'development' ise kontrol atlanır.
 *     Production'da bu fonksiyon Clerk oturumu + role kontrolü yapar.
 *
 * @throws Oturum yoksa veya role 'admin' değilse /sign-in'e redirect atar.
 */
export async function requireAdmin(): Promise<void> {
  // Geliştirme ortamında auth atlanır — production'da bu blok çalışmaz.
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  // 1. Oturum kontrolü — auth().protect() çağrısı oturum yoksa redirect atar.
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // 2. Role kontrolü — Clerk Dashboard'da privateMetadata.role = "admin" olmalı.
  const user = await currentUser();
  const role = user?.privateMetadata?.role as string | undefined;

  if (role !== 'admin') {
    redirect('/sign-in');
  }
}

/**
 * Sadece oturum kontrolü yapar (role gerekmez).
 * Genel korunan sayfalar veya user-facing API route'lar için kullanın.
 *
 * @throws Oturum yoksa /sign-in'e redirect atar.
 */
export async function requireAuth(): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    // Dev'de sahte bir userId döndür
    return 'dev-user';
  }

  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  return userId;
}
