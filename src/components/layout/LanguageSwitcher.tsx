"use client";

import { useRouter, usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { stripLocaleFromPathname, withLocale, type Locale } from "@/i18n/config";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, dictionary } = useLanguage();

  const switchLanguage = (nextLocale: Locale) => {
    const strippedPath = stripLocaleFromPathname(pathname);
    const nextPath = withLocale(strippedPath, nextLocale);
    const query = typeof window !== "undefined" ? window.location.search : "";
    router.replace(query ? `${nextPath}?${query}` : nextPath);
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/80 p-1">
      <Languages size={14} className="mx-1 text-muted-foreground" aria-hidden="true" />
      <button
        type="button"
        onClick={() => switchLanguage("en")}
        aria-label={dictionary.nav.languageToggle}
        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
          locale === "en" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchLanguage("tr")}
        aria-label={dictionary.nav.languageToggle}
        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
          locale === "tr" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        TR
      </button>
    </div>
  );
}
