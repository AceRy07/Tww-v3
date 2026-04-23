"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import { defaultLocale, getLocaleFromPathname, type Locale } from "@/i18n/config";

type LanguageContextValue = {
  locale: Locale;
  dictionary: ReturnType<typeof getDictionary>;
};

const LanguageContext = createContext<LanguageContextValue>({
  locale: defaultLocale,
  dictionary: getDictionary(defaultLocale),
});

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const value = useMemo(() => {
    const locale = getLocaleFromPathname(pathname);
    return {
      locale,
      dictionary: getDictionary(locale),
    };
  }, [pathname]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
