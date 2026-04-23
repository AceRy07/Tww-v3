export type Product = {
  id: string;
  slug: string;
  sku: string;
  title: string;
  category: Category;
  price: number;
  material: string;
  color: Color;
  colorHex: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  images: string[];
  description: string;
  featured: boolean;
};

export type Category =
  | "Dining Tables"
  | "Coffee Tables"
  | "Stools"
  | "Shelving"
  | "Side Tables"
  | "Desks";

export type Color = "Anthracite" | "Natural Oak" | "Matte Black" | "White" | "Walnut";

export const CATEGORIES: Category[] = [
  "Dining Tables",
  "Coffee Tables",
  "Stools",
  "Shelving",
  "Side Tables",
  "Desks",
];

export const COLORS: { name: Color; hex: string }[] = [
  { name: "Anthracite", hex: "#383838" },
  { name: "Natural Oak", hex: "#C8A97E" },
  { name: "Matte Black", hex: "#1A1A1A" },
  { name: "White", hex: "#F5F5F5" },
  { name: "Walnut", hex: "#7B4F2E" },
];

export const products: Product[] = [
  {
    id: "1",
    slug: "arc-dining-table",
    sku: "TWW-DT-001",
    title: "Arc Dining Table",
    category: "Dining Tables",
    price: 2400,
    material: "12mm Compact Laminate, Powder-Coated Steel",
    color: "Anthracite",
    colorHex: "#383838",
    dimensions: { width: 200, height: 75, depth: 90 },
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
      "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80",
    ],
    description:
      "A refined dining table with a sculptural powder-coated steel base. The 12mm compact laminate top offers unmatched durability and a premium matte surface that resists scratches and heat. Perfect for modern dining spaces.",
    featured: true,
  },
  {
    id: "2",
    slug: "slab-coffee-table",
    sku: "TWW-CT-001",
    title: "Slab Coffee Table",
    category: "Coffee Tables",
    price: 1150,
    material: "12mm Compact Laminate, Solid Oak Legs",
    color: "Natural Oak",
    colorHex: "#C8A97E",
    dimensions: { width: 120, height: 38, depth: 60 },
    images: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
    ],
    description:
      "A low-profile coffee table that grounds any living room. Solid oak legs support the generous laminate top, creating a harmonious blend of warmth and modernity.",
    featured: true,
  },
  {
    id: "3",
    slug: "mono-stool",
    sku: "TWW-ST-001",
    title: "Mono Stool",
    category: "Stools",
    price: 420,
    material: "12mm Compact Laminate, Steel",
    color: "Matte Black",
    colorHex: "#1A1A1A",
    dimensions: { width: 35, height: 75, depth: 35 },
    images: [
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80",
      "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=800&q=80",
    ],
    description:
      "Stripped back to essentials. The Mono Stool pairs a compact laminate seat with a minimal welded steel frame. Stackable and ideal for kitchen islands or counter seating.",
    featured: false,
  },
  {
    id: "4",
    slug: "grid-shelving-unit",
    sku: "TWW-SH-001",
    title: "Grid Shelving Unit",
    category: "Shelving",
    price: 1800,
    material: "18mm MFC Board, Powder-Coated Steel Frame",
    color: "White",
    colorHex: "#F5F5F5",
    dimensions: { width: 160, height: 180, depth: 35 },
    images: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80",
      "https://images.unsplash.com/photo-1589884629038-b631346a23c0?w=800&q=80",
    ],
    description:
      "An open shelving system that turns storage into a display. The powder-coated steel grid frame pairs with white MFC shelves to create a modular wall-worthy backdrop.",
    featured: true,
  },
  {
    id: "5",
    slug: "rift-side-table",
    sku: "TWW-SIT-001",
    title: "Rift Side Table",
    category: "Side Tables",
    price: 560,
    material: "Solid Walnut, Hairpin Steel Legs",
    color: "Walnut",
    colorHex: "#7B4F2E",
    dimensions: { width: 45, height: 55, depth: 45 },
    images: [
      "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    ],
    description:
      "A versatile side table featuring a solid walnut top with natural grain expression, elevated on slender hairpin legs. An elegant companion for sofas or bedside use.",
    featured: false,
  },
  {
    id: "6",
    slug: "plane-desk",
    sku: "TWW-DK-001",
    title: "Plane Desk",
    category: "Desks",
    price: 1650,
    material: "12mm Compact Laminate, Powder-Coated Steel",
    color: "Anthracite",
    colorHex: "#383838",
    dimensions: { width: 160, height: 73, depth: 70 },
    images: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80",
      "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&q=80",
    ],
    description:
      "A work desk built for focus. The clean laminate surface sits on a rigid powder-coated steel frame with cable management provisions, creating a distraction-free workspace.",
    featured: false,
  },
  {
    id: "7",
    slug: "float-coffee-table",
    sku: "TWW-CT-002",
    title: "Float Coffee Table",
    category: "Coffee Tables",
    price: 980,
    material: "12mm Compact Laminate, Chrome Steel",
    color: "White",
    colorHex: "#F5F5F5",
    dimensions: { width: 100, height: 35, depth: 55 },
    images: [
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80",
    ],
    description:
      "A levitating aesthetic achieved through a chrome-steel base that creates the illusion of a floating top. Ideal for minimalist interiors where less is always more.",
    featured: false,
  },
  {
    id: "8",
    slug: "beam-dining-table",
    sku: "TWW-DT-002",
    title: "Beam Dining Table",
    category: "Dining Tables",
    price: 3200,
    material: "Solid Oak Top, Powder-Coated Steel",
    color: "Natural Oak",
    colorHex: "#C8A97E",
    dimensions: { width: 240, height: 76, depth: 95 },
    images: [
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    ],
    description:
      "Designed for gatherings. The Beam Dining Table features a solid oak top with an expressive grain over a bold structural steel base — commanding presence without compromise.",
    featured: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}
