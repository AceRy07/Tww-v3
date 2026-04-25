import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Korunan rotalar — sadece /admin ve /api/admin altındaki her şey auth gerektirir.
 * Public rotalar (/, /[lang]/catalog, /[lang]/product, vb.) açık kalır.
 */
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
]);

/**
 * ⚠️  DEV BYPASS UYARISI ─────────────────────────────────────────────────────
 * NODE_ENV === 'development' olduğunda admin rotaları auth olmadan erişilebilir.
 * Bu sadece local geliştirme kolaylığı için. Production'da KESİNLİKLE kapalıdır.
 * Production'a deploy etmeden önce bu bloğu kaldırmanıza gerek yok; NODE_ENV
 * otomatik olarak 'production' olur ve bypass hiçbir zaman çalışmaz.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const DEV_BYPASS = process.env.NODE_ENV === 'development';

export default clerkMiddleware(
  async (auth, req: NextRequest) => {
    if (isProtectedRoute(req)) {
      // ⚠️  Geliştirme ortamında auth atlanıyor — production'da bu satır çalışmaz.
      if (DEV_BYPASS) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[Clerk] DEV BYPASS aktif — /admin korumasız çalışıyor. ' +
            'Production deploy öncesi Clerk anahtarlarını .env.local\'a eklemeyi unutma.',
          );
        }
        return NextResponse.next();
      }

      // Production: Clerk koruması — yetkisiz kullanıcıları /sign-in'e yönlendir.
      await auth.protect();
    }
  },
  {
    // Debug logları sadece development'ta aktif olsun.
    debug: process.env.NODE_ENV === 'development',
  },
);

export const config = {
  matcher: [
    /*
     * Aşağıdaki ile BAŞLAYAN yollar HARİÇ tüm istekleri eşleştir:
     * - _next/static  (statik dosyalar)
     * - _next/image   (resim optimizasyonu)
     * - favicon.ico   (favicon)
     * - public klasörü dosyaları (.svg, .png, .jpg, .ico, .webp)
     *
     * API rotaları ve admin sayfaları dahil edilmiştir.
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
