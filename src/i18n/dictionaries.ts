import type { Locale } from "@/i18n/config";
import type { DictionaryRecord } from "@/i18n/types";
import { en } from "@/i18n/messages/en";
import { tr } from "@/i18n/messages/tr";

export const dictionaries: DictionaryRecord = {
  en,
  tr,
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
