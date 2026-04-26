import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, locales } from "@/i18n/config";

// Not: Bu projede middleware.ts yerine Next proxy kullaniliyor; /admin* korumasi Clerk ile bu dosyada uygulanir.

/**
 * Korunan rotalar
 * - /admin ve /api/admin (dil öneki olsa bile)
 * - /en/admin, /tr/admin vb. hepsini kapsar
 */
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
  '/:lang/admin(.*)',     // [[lang]] desteği için
]);

/**
 * i18n routing + Clerk auth bir arada çalışan proxy
 */
export default clerkMiddleware(
  async (auth, req: NextRequest) => {
    const { pathname } = req.nextUrl;

    // === DEV BYPASS (sadece localhost'ta) ===
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔧 [Clerk] DEV BYPASS aktif — /admin korumasız çalışıyor.');
      // i18n routing'i devam ettir
      return handleI18nRouting(req);
    }

    // Production: Korunan yollar için Clerk koruması
    if (isProtectedRoute(req)) {
      await auth.protect();
    }

    // i18n routing mantığını koru
    return handleI18nRouting(req);
  },
  {
    // debug: process.env.NODE_ENV === 'development',
    // Debug'ı kapat veya çok kısıtla
    debug: false,   // ← bunu false yaparak gereksiz logları engelle
  }
);

function handleI18nRouting(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin yollarını normalize et ( /tr/admin → /admin )
  const normalizedAdminPath = getLocalePrefixedAdminPath(pathname);
  if (normalizedAdminPath) {
    const nextUrl = req.nextUrl.clone();
    nextUrl.pathname = normalizedAdminPath;
    return NextResponse.redirect(nextUrl);
  }

  // Locale kontrolü
  if (hasLocale(pathname) || isAdminPath(pathname)) {
    return NextResponse.next();
  }

  // Default locale ekle
  const locale = defaultLocale;
  const nextUrl = req.nextUrl.clone();
  nextUrl.pathname = pathname === "/" 
    ? `/${locale}` 
    : `/${locale}${pathname}`;

  return NextResponse.redirect(nextUrl);
}

function hasLocale(pathname: string) {
  return locales.some((locale) => 
    pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function getLocalePrefixedAdminPath(pathname: string) {
  for (const locale of locales) {
    if (pathname === `/${locale}/admin`) {
      return "/admin";
    }
    if (pathname.startsWith(`/${locale}/admin/`)) {
      return pathname.slice(locale.length + 1);
    }
  }
  return null;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
    '/(api|trpc)(.*)',
  ],
};