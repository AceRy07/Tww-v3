import type { Locale } from "@/i18n/config";

export type CategoryKey =
  | "dining-tables"
  | "coffee-tables"
  | "stools"
  | "shelving"
  | "side-tables"
  | "desks";

export type Color = "Anthracite" | "Natural Oak" | "Matte Black" | "White" | "Walnut";

type LocalizedText = Record<Locale, string>;

type ProductRecord = {
  id: string;
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

export type Product = Omit<ProductRecord, "material" | "description"> & {
  categoryLabel: string;
  material: string;
  description: string;
};

const categoryLabels: Record<CategoryKey, LocalizedText> = {
  "dining-tables": { en: "Dining Tables", tr: "Yemek Masalari" },
  "coffee-tables": { en: "Coffee Tables", tr: "Orta Sehpalar" },
  stools: { en: "Stools", tr: "Tabureler" },
  shelving: { en: "Shelving", tr: "Raf Sistemleri" },
  "side-tables": { en: "Side Tables", tr: "Yan Sehpalar" },
  desks: { en: "Desks", tr: "Calisma Masalari" },
};

const rawProducts: ProductRecord[] = [
  {
    id: "1",
    slug: "arc-dining-table",
    sku: "TWW-DT-001",
    title: "Arc Dining Table",
    category: "dining-tables",
    price: 2400,
    material: {
      en: "12mm Compact Laminate, Powder-Coated Steel",
      tr: "12mm Kompakt Laminat, Toz Boyalı Celik",
    },
    color: "Anthracite",
    colorHex: "#383838",
    dimensions: { width: 200, height: 75, depth: 90 },
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
      "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80",
    ],
    description: {
      en: "A refined dining table with a sculptural powder-coated steel base. The 12mm compact laminate top offers unmatched durability and a premium matte surface that resists scratches and heat. Perfect for modern dining spaces.",
      tr: "Heykelsi toz boyali celik ayaklara sahip rafine bir yemek masasi. 12mm kompakt laminat tabla cizik ve isiya dayanikli, premium bir mat yuzey sunar. Modern yemek alanlari icin idealdir.",
    },
    featured: true,
  },
  {
    id: "2",
    slug: "slab-coffee-table",
    sku: "TWW-CT-001",
    title: "Slab Coffee Table",
    category: "coffee-tables",
    price: 1150,
    material: {
      en: "12mm Compact Laminate, Solid Oak Legs",
      tr: "12mm Kompakt Laminat, Masif Meşe Ayak",
    },
    color: "Natural Oak",
    colorHex: "#C8A97E",
    dimensions: { width: 120, height: 38, depth: 60 },
    images: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
    ],
    description: {
      en: "A low-profile coffee table that grounds any living room. Solid oak legs support the generous laminate top, creating a harmonious blend of warmth and modernity.",
      tr: "Her oturma odasina denge katan alcak profilli bir orta sehpa. Masif meşe ayaklar genis laminat tablaya destek olur ve sicaklik ile modernligi dengeler.",
    },
    featured: true,
  },
  {
    id: "3",
    slug: "mono-stool",
    sku: "TWW-ST-001",
    title: "Mono Stool",
    category: "stools",
    price: 420,
    material: {
      en: "12mm Compact Laminate, Steel",
      tr: "12mm Kompakt Laminat, Celik",
    },
    color: "Matte Black",
    colorHex: "#1A1A1A",
    dimensions: { width: 35, height: 75, depth: 35 },
    images: [
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80",
      "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=800&q=80",
    ],
    description: {
      en: "Stripped back to essentials. The Mono Stool pairs a compact laminate seat with a minimal welded steel frame. Stackable and ideal for kitchen islands or counter seating.",
      tr: "Ozune indirgenmis tasarim. Mono Tabure, kompakt laminat oturagi minimal kaynakli celik iskeletle birlestirir. Ust uste konabilir ve mutfak adasi kullanimi icin idealdir.",
    },
    featured: false,
  },
  {
    id: "4",
    slug: "grid-shelving-unit",
    sku: "TWW-SH-001",
    title: "Grid Shelving Unit",
    category: "shelving",
    price: 1800,
    material: {
      en: "18mm MFC Board, Powder-Coated Steel Frame",
      tr: "18mm MFC Panel, Toz Boyalı Celik Cerceve",
    },
    color: "White",
    colorHex: "#F5F5F5",
    dimensions: { width: 160, height: 180, depth: 35 },
    images: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80",
      "https://images.unsplash.com/photo-1589884629038-b631346a23c0?w=800&q=80",
    ],
    description: {
      en: "An open shelving system that turns storage into a display. The powder-coated steel grid frame pairs with white MFC shelves to create a modular wall-worthy backdrop.",
      tr: "Depolamayi sergilemeye donusturen acik raf sistemi. Toz boyali celik izgara cerceve, beyaz MFC raflarla esleserek moduler ve guclu bir duvar kompozisyonu olusturur.",
    },
    featured: true,
  },
  {
    id: "5",
    slug: "rift-side-table",
    sku: "TWW-SIT-001",
    title: "Rift Side Table",
    category: "side-tables",
    price: 560,
    material: {
      en: "Solid Walnut, Hairpin Steel Legs",
      tr: "Masif Ceviz, Sac Tokali Celik Ayak",
    },
    color: "Walnut",
    colorHex: "#7B4F2E",
    dimensions: { width: 45, height: 55, depth: 45 },
    images: [
      "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    ],
    description: {
      en: "A versatile side table featuring a solid walnut top with natural grain expression, elevated on slender hairpin legs. An elegant companion for sofas or bedside use.",
      tr: "Dogal damar dokusunu ortaya cikaran masif ceviz tabla, ince celik ayaklarla tamamlanir. Koltuk yani ya da komodin olarak zarif bir tamamlayicidir.",
    },
    featured: false,
  },
  {
    id: "6",
    slug: "plane-desk",
    sku: "TWW-DK-001",
    title: "Plane Desk",
    category: "desks",
    price: 1650,
    material: {
      en: "12mm Compact Laminate, Powder-Coated Steel",
      tr: "12mm Kompakt Laminat, Toz Boyalı Celik",
    },
    color: "Anthracite",
    colorHex: "#383838",
    dimensions: { width: 160, height: 73, depth: 70 },
    images: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80",
      "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&q=80",
    ],
    description: {
      en: "A work desk built for focus. The clean laminate surface sits on a rigid powder-coated steel frame with cable management provisions, creating a distraction-free workspace.",
      tr: "Odaklanma icin tasarlanmis calisma masasi. Temiz laminat yuzey, kablo yonetimi sunan rijit toz boyali celik iskeletle birleserek dikkat dagitmayan bir calisma alani sunar.",
    },
    featured: false,
  },
  {
    id: "7",
    slug: "float-coffee-table",
    sku: "TWW-CT-002",
    title: "Float Coffee Table",
    category: "coffee-tables",
    price: 980,
    material: {
      en: "12mm Compact Laminate, Chrome Steel",
      tr: "12mm Kompakt Laminat, Krom Celik",
    },
    color: "White",
    colorHex: "#F5F5F5",
    dimensions: { width: 100, height: 35, depth: 55 },
    images: [
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
    ],
    description: {
      en: "A levitating aesthetic achieved through a chrome-steel base that creates the illusion of a floating top. Ideal for minimalist interiors where less is always more.",
      tr: "Krom celik ayak yapisi, yuzeeyen bir tabla algisi olusturur. Azin cok oldugu minimalist mekanlar icin idealdir.",
    },
    featured: false,
  },
  {
    id: "8",
    slug: "beam-dining-table",
    sku: "TWW-DT-002",
    title: "Beam Dining Table",
    category: "dining-tables",
    price: 3200,
    material: {
      en: "Solid Oak Top, Powder-Coated Steel",
      tr: "Masif Meşe Tabla, Toz Boyalı Celik",
    },
    color: "Natural Oak",
    colorHex: "#C8A97E",
    dimensions: { width: 240, height: 76, depth: 95 },
    images: [
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    ],
    description: {
      en: "Designed for gatherings. The Beam Dining Table features a solid oak top with an expressive grain over a bold structural steel base, commanding presence without compromise.",
      tr: "Paylasim anlari icin tasarlandi. Beam Yemek Masasi, belirgin damar yapisina sahip masif meşe tablayi guclu celik tasiyici ile birlestirerek etkileyici bir durus sunar.",
    },
    featured: true,
  },
];

export const COLORS: { name: Color; hex: string }[] = [
  { name: "Anthracite", hex: "#383838" },
  { name: "Natural Oak", hex: "#C8A97E" },
  { name: "Matte Black", hex: "#1A1A1A" },
  { name: "White", hex: "#F5F5F5" },
  { name: "Walnut", hex: "#7B4F2E" },
];

export const products = rawProducts;

function localizeProduct(product: ProductRecord, locale: Locale): Product {
  return {
    ...product,
    categoryLabel: categoryLabels[product.category][locale],
    material: product.material[locale],
    description: product.description[locale],
  };
}

export function getCategoryOptions(locale: Locale) {
  return (Object.keys(categoryLabels) as CategoryKey[]).map((key) => ({
    key,
    label: categoryLabels[key][locale],
  }));
}

export function getProducts(locale: Locale): Product[] {
  return rawProducts.map((product) => localizeProduct(product, locale));
}

export function getProductBySlug(slug: string, locale: Locale): Product | undefined {
  const product = rawProducts.find((p) => p.slug === slug);
  return product ? localizeProduct(product, locale) : undefined;
}

export function getFeaturedProducts(locale: Locale): Product[] {
  return rawProducts.filter((p) => p.featured).map((product) => localizeProduct(product, locale));
}
