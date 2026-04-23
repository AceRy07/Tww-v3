export const locales = ["en", "tr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function hasLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return segment && hasLocale(segment) ? segment : defaultLocale;
}

export function stripLocaleFromPathname(pathname: string): string {
  const parts = pathname.split("/");
  const first = parts[1];

  if (first && hasLocale(first)) {
    const rest = parts.slice(2).join("/");
    return rest ? `/${rest}` : "/";
  }

  return pathname || "/";
}

export function withLocale(pathname: string, locale: Locale): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const withoutLocale = stripLocaleFromPathname(normalized);
  return withoutLocale === "/" ? `/${locale}` : `/${locale}${withoutLocale}`;
}
