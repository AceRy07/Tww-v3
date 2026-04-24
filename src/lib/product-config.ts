import type { Locale } from '@/i18n/config';

export const CATEGORY_VALUES = [
  'dining-tables',
  'coffee-tables',
  'stools',
  'shelving',
  'side-tables',
  'desks',
] as const;

export const COLOR_VALUES = ['Anthracite', 'Natural Oak', 'Matte Black', 'White', 'Walnut'] as const;

export type CategoryKey = (typeof CATEGORY_VALUES)[number];
export type Color = (typeof COLOR_VALUES)[number];

type LocalizedText = Record<Locale, string>;

const categoryLabels: Record<CategoryKey, LocalizedText> = {
  'dining-tables': { en: 'Dining Tables', tr: 'Yemek Masalari' },
  'coffee-tables': { en: 'Coffee Tables', tr: 'Orta Sehpalar' },
  stools: { en: 'Stools', tr: 'Tabureler' },
  shelving: { en: 'Shelving', tr: 'Raf Sistemleri' },
  'side-tables': { en: 'Side Tables', tr: 'Yan Sehpalar' },
  desks: { en: 'Desks', tr: 'Calisma Masalari' },
};

export const COLORS: { name: Color; hex: string }[] = [
  { name: 'Anthracite', hex: '#383838' },
  { name: 'Natural Oak', hex: '#C8A97E' },
  { name: 'Matte Black', hex: '#1A1A1A' },
  { name: 'White', hex: '#F5F5F5' },
  { name: 'Walnut', hex: '#7B4F2E' },
];

export function isCategoryKey(value: string): value is CategoryKey {
  return CATEGORY_VALUES.includes(value as CategoryKey);
}

export function isColor(value: string): value is Color {
  return COLOR_VALUES.includes(value as Color);
}

export function getCategoryLabel(category: CategoryKey, locale: Locale): string {
  return categoryLabels[category][locale];
}

export function getCategoryOptions(locale: Locale) {
  return CATEGORY_VALUES.map((key) => ({
    key,
    label: categoryLabels[key][locale],
  }));
}
