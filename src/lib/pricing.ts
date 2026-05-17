import type { Locale } from '@/i18n/config';

export const PRODUCT_PRICE_TYPES = ['fixed', 'starting_from', 'request_quote'] as const;

export type ProductPriceType = (typeof PRODUCT_PRICE_TYPES)[number];

export type ProductCurrency = 'TRY' | 'USD';

export const DEFAULT_PRODUCT_CURRENCY: ProductCurrency = 'TRY';

export const PRICE_TYPE_LABELS: Record<ProductPriceType, Record<Locale, string>> = {
  fixed: {
    en: 'Fixed Price',
    tr: 'Sabit Fiyat',
  },
  starting_from: {
    en: 'Starting From',
    tr: 'Baslangic Fiyati',
  },
  request_quote: {
    en: 'Price on Request',
    tr: 'Teklif Iste',
  },
};

export const PRICE_COPY = {
  startingFrom: {
    en: 'Starting from',
    tr: 'Baslangic fiyati',
  },
  requestQuote: {
    en: 'Price on request',
    tr: 'Teklif isteyin',
  },
  contactForPrice: {
    en: 'Contact for price',
    tr: 'Fiyat icin iletisime gecin',
  },
  startingFromHelper: {
    en: 'Final price may vary depending on dimensions, material and customization.',
    tr: 'Nihai fiyat olcu, malzeme ve ozel isteklere gore degisebilir.',
  },
  customPricingTitle: {
    en: 'Custom pricing',
    tr: 'Ozel fiyatlandirma',
  },
  customPricingBody: {
    en: 'This product is priced based on dimensions, material and project details. Please request a quote.',
    tr: 'Bu urun olcu, malzeme ve proje detaylarina gore fiyatlandirilir. Teklif almak icin formu doldurun.',
  },
  showRequestQuoteProducts: {
    en: 'Show price on request products',
    tr: 'Teklif ile fiyatlandirilan urunleri goster',
  },
} as const;

export function isProductPriceType(value: unknown): value is ProductPriceType {
  return typeof value === 'string' && PRODUCT_PRICE_TYPES.includes(value as ProductPriceType);
}

export function normalizeProductPriceType(value: unknown): ProductPriceType {
  return isProductPriceType(value) ? value : 'fixed';
}

export function normalizeCurrency(value: unknown): ProductCurrency {
  return value === 'USD' ? 'USD' : DEFAULT_PRODUCT_CURRENCY;
}

export function formatProductPrice(
  price: number | null | undefined,
  currency: string | null | undefined = DEFAULT_PRODUCT_CURRENCY,
  locale: Locale = 'tr'
): string {
  if (price === null || price === undefined || !Number.isFinite(price) || price <= 0) {
    return PRICE_COPY.contactForPrice[locale];
  }

  const normalizedCurrency = normalizeCurrency(currency);
  return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
    style: 'currency',
    currency: normalizedCurrency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getProductPriceDisplay(input: {
  priceType: ProductPriceType | string | null | undefined;
  price: number | null | undefined;
  currency?: string | null;
  locale?: Locale;
}): string {
  const locale = input.locale ?? 'tr';
  const priceType = normalizeProductPriceType(input.priceType);

  if (priceType === 'request_quote') {
    return PRICE_COPY.requestQuote[locale];
  }

  const formattedPrice = formatProductPrice(input.price, input.currency, locale);

  if (formattedPrice === PRICE_COPY.contactForPrice[locale]) {
    return formattedPrice;
  }

  if (priceType === 'starting_from') {
    return locale === 'tr'
      ? `${formattedPrice}'den baslayan fiyatlarla`
      : `Starting from ${formattedPrice}`;
  }

  return formattedPrice;
}

export function getInventoryPriceDisplay(input: {
  priceType: ProductPriceType | string | null | undefined;
  price: number | null | undefined;
  currency?: string | null;
}): string {
  const priceType = normalizeProductPriceType(input.priceType);

  if (priceType === 'request_quote') {
    return 'Price on request';
  }

  const formattedPrice = formatProductPrice(input.price, input.currency, 'tr');

  if (priceType === 'starting_from' && formattedPrice !== PRICE_COPY.contactForPrice.tr) {
    return `From ${formattedPrice}`;
  }

  return formattedPrice;
}
