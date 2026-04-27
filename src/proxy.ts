// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, locales } from "@/i18n/config";

// Gerçek admin rotalarını koru (sadece src/app/admin)
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',           // /admin, /admin/anything
  '/:lang/admin(.*)',     // /tr/admin, /en/admin vb.
  '/api/admin(.*)',       // admin API'leri
]);

// Proxy fonksiyonu - Next.js 16 gerekliliği
export const proxy = clerkMiddleware(
  async (auth, req: NextRequest) => {
    // Admin rotalarını koru
    if (isProtectedRoute(req)) {
      await auth.protect();
    }

    // Basit ve güvenli i18n handling (redirect loop riskini minimuma indirdik)
    return handleI18nRouting(req);
  },
  {
    debug: process.env.NODE_ENV === 'development',
  }
);

function handleI18nRouting(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Zaten locale varsa veya admin yoluysa dokunma
  if (hasLocale(pathname) || pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Default locale ekle
  const nextUrl = req.nextUrl.clone();
  nextUrl.pathname = pathname === '/' 
    ? `/${defaultLocale}` 
    : `/${defaultLocale}${pathname}`;

  return NextResponse.redirect(nextUrl);
}

function hasLocale(pathname: string): boolean {
  return locales.some((locale) => 
    pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
}

export const config = {
  matcher: [
    // Statik dosyaları ve Next.js internal route'ları atla
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json)).*)',
    '/(api|trpc)(.*)',
  ],
};