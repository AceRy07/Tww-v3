import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

function hasLocale(pathname: string) {
  return locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const normalizedAdminPath = getLocalePrefixedAdminPath(pathname);
  if (normalizedAdminPath) {
    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = normalizedAdminPath;
    return NextResponse.redirect(nextUrl);
  }

  if (isAdminPath(pathname)) {
    return NextResponse.next();
  }

  if (hasLocale(pathname)) {
    return NextResponse.next();
  }

  const locale = defaultLocale;
  const nextUrl = request.nextUrl.clone();
  nextUrl.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(nextUrl);
}

export const config = {
  matcher: ["/((?!admin(?:/|$)|api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
