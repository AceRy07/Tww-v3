import type { Locale } from "@/i18n/config";

export type Dictionary = {
  nav: {
    brand: string;
    catalog: string;
    contact: string;
    viewCollection: string;
    themeToggle: string;
    languageToggle: string;
    english: string;
    turkish: string;
    openMenu: string;
  };
  footer: {
    description: string;
    rights: string;
    crafted: string;
  };
  inquiry: {
    sentTitle: string;
    sentBody: string;
    sendAnother: string;
    labels: {
      name: string;
      email: string;
      dimensions: string;
      optional: string;
      message: string;
    };
    placeholders: {
      name: string;
      email: string;
      dimensions: string;
      message: string;
    };
    actions: {
      sending: string;
      send: string;
    };
    errors: {
      nameShort: string;
      invalidEmail: string;
      messageShort: string;
      failed: string;
      unknown: string;
    };
  };
};

export type DictionaryRecord = Record<Locale, Dictionary>;
