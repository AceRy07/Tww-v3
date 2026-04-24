import type { CategoryKey, Color } from '@/lib/product-config';
import type { Locale } from '@/i18n/config';

type LocalizedText = Record<Locale, string>;

export type SeedProduct = {
  slug: string;
  sku: string;
  title: string;
  category: CategoryKey;
  price: number;
  material: LocalizedText;
  color: Color;
  colorHex: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  images: string[];
  description: LocalizedText;
  featured: boolean;
};

export const rawProducts: SeedProduct[] = [
  {
    slug: 'arc-dining-table',
    sku: 'TWW-DT-001',
    title: 'Arc Dining Table',
    category: 'dining-tables',
    price: 2400,
    material: {
      en: '12mm Compact Laminate, Powder-Coated Steel',
      tr: '12mm Kompakt Laminat, Toz Boyali Celik',
    },
    color: 'Anthracite',
    colorHex: '#383838',
    dimensions: { width: 200, height: 75, depth: 90 },
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80',
    ],
    description: {
      en: 'A refined dining table with a sculptural powder-coated steel base.',
      tr: 'Heykelsi toz boyali celik ayaklara sahip rafine bir yemek masasi.',
    },
    featured: true,
  },
  {
    slug: 'slab-coffee-table',
    sku: 'TWW-CT-001',
    title: 'Slab Coffee Table',
    category: 'coffee-tables',
    price: 1150,
    material: {
      en: '12mm Compact Laminate, Solid Oak Legs',
      tr: '12mm Kompakt Laminat, Masif Mese Ayak',
    },
    color: 'Natural Oak',
    colorHex: '#C8A97E',
    dimensions: { width: 120, height: 38, depth: 60 },
    images: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
    ],
    description: {
      en: 'A low-profile coffee table that grounds any living room.',
      tr: 'Her oturma odasina denge katan alcak profilli bir orta sehpa.',
    },
    featured: true,
  },
  {
    slug: 'grid-shelving-unit',
    sku: 'TWW-SH-001',
    title: 'Grid Shelving Unit',
    category: 'shelving',
    price: 1800,
    material: {
      en: '18mm MFC Board, Powder-Coated Steel Frame',
      tr: '18mm MFC Panel, Toz Boyali Celik Cerceve',
    },
    color: 'White',
    colorHex: '#F5F5F5',
    dimensions: { width: 160, height: 180, depth: 35 },
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80',
      'https://images.unsplash.com/photo-1589884629038-b631346a23c0?w=800&q=80',
    ],
    description: {
      en: 'An open shelving system that turns storage into a display.',
      tr: 'Depolamayi sergilemeye donusturen acik raf sistemi.',
    },
    featured: true,
  },
  {
    slug: 'beam-dining-table',
    sku: 'TWW-DT-002',
    title: 'Beam Dining Table',
    category: 'dining-tables',
    price: 3200,
    material: {
      en: 'Solid Oak Top, Powder-Coated Steel',
      tr: 'Masif Mese Tabla, Toz Boyali Celik',
    },
    color: 'Natural Oak',
    colorHex: '#C8A97E',
    dimensions: { width: 240, height: 76, depth: 95 },
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    ],
    description: {
      en: 'Designed for gatherings with an expressive grain and bold base.',
      tr: 'Paylasim anlari icin tasarlanan etkileyici bir yemek masasi.',
    },
    featured: true,
  },
];
