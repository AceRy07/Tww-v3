import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers, Ruler, Tag } from "lucide-react";
import InquiryForm from "@/components/forms/InquiryForm";
import { getAllProductSlugs, getProductBySlug } from "@/lib/data";
import { hasLocale, locales } from "@/i18n/config";

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;

  if (!hasLocale(lang)) {
    return {};
  }

  const product = await getProductBySlug(slug, lang);
  if (!product) return {};

  return {
    title: product.title,
    description: product.description,
  };
}

export default async function ProductRedirectPage({ params }: Props) {
  const { lang, slug } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const product = await getProductBySlug(slug, lang);
  if (!product) notFound();

  return (
    <div className="min-h-screen pt-16">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Link
          href={`/${lang}/catalog`}
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} /> {lang === "tr" ? "Kataloga Don" : "Back to Catalog"}
        </Link>

        <div className="grid gap-16 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {product.images[1] && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={product.images[1]}
                  alt={`${product.title} detail`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            )}
          </div>

          <div>
            <div className="mb-8">
              <span className="mb-3 block text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                {product.categoryLabel}
              </span>
              <h1 className="mb-4 text-4xl font-semibold tracking-tight text-foreground">{product.title}</h1>
              <p className="mb-6 text-2xl font-medium text-foreground">
                {product.price.toLocaleString(lang === "tr" ? "tr-TR" : "en-US", {
                  style: "currency",
                  currency: "TRY",
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="leading-relaxed text-muted-foreground">{product.description}</p>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-4 border-t border-border pt-6">
              <div className="flex items-start gap-3">
                <Ruler size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">{lang === "tr" ? "Olculer" : "Dimensions"}</p>
                  <p className="text-sm font-medium text-foreground">
                    {product.dimensions.width} x {product.dimensions.depth} x {product.dimensions.height} cm
                  </p>
                  <p className="text-xs text-muted-foreground">W x D x H</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Layers size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">{lang === "tr" ? "Malzeme" : "Material"}</p>
                  <p className="text-sm font-medium text-foreground">{product.material}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-border" style={{ backgroundColor: product.colorHex }} />
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">{lang === "tr" ? "Renk" : "Finish / Color"}</p>
                  <p className="text-sm font-medium text-foreground">{product.color}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">SKU</p>
                  <p className="font-mono text-sm font-medium text-foreground">{product.sku}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-card p-6">
              <h2 className="mb-1 text-lg font-semibold text-foreground">
                {lang === "tr" ? "Teklif Isteyin" : "Request a Quote"}
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                {lang === "tr"
                  ? "Bu urunle ilgileniyorsaniz talebinizi iletin, 24 saat icinde size donelim."
                  : "Interested in this product? Send us an inquiry and we'll get back to you within 24 hours."}
              </p>
              <InquiryForm productName={product.title} productSku={product.sku} productSlug={product.slug} primaryImageUrl={product.images?.[0]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
