import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

function hasLocale(pathname: string) {
  return locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (hasLocale(pathname)) {
    return NextResponse.next();
  }

  const locale = defaultLocale;
  const nextUrl = request.nextUrl.clone();
  nextUrl.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(nextUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
