import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getFeaturedProducts } from "@/lib/data";
import { hasLocale } from "@/i18n/config";
import ScrollReveal from "@/components/layout/ScrollReveal";
import ProductCard from "@/components/catalog/ProductCard";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  const featured = getFeaturedProducts(lang);

  return (
    <>
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=1600&q=80"
          alt="The West Wing Furniture"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white">
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-white/70">
            {lang === "tr" ? "Modern · Dayanikli · Minimal" : "Modern · Durable · Minimal"}
          </p>
          <h1 className="mb-8 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            {lang === "tr" ? (
              <>
                Uzun Omurlu
                <br />
                Mobilya
              </>
            ) : (
              <>
                Furniture Built
                <br />
                to Last
              </>
            )}
          </h1>
          <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-white/80">
            {lang === "tr"
              ? "12mm kompakt laminattan uretildi. Modern yasam icin tasarlandi, yillarca gunluk kullanim icin uretildi."
              : "Handcrafted from 12mm compact laminate. Designed for modern living, built for decades of everyday use."}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${lang}/catalog`}
              className="flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-[#1A1A1A] transition-colors hover:bg-slate-100"
            >
              {lang === "tr" ? "Koleksiyonu Incele" : "Browse Collection"}
              <ArrowRight size={16} />
            </Link>
            <Link
              href={`/${lang}/contact`}
              className="flex items-center gap-2 rounded-full border border-white px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {lang === "tr" ? "Iletisime Gec" : "Get in Touch"}
            </Link>
          </div>
        </div>
      </section>

      <ScrollReveal>
        <section className="bg-muted py-20 px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-5 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {lang === "tr" ? "Niyetle tasarlandi." : "Designed with intention."}
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {lang === "tr"
                ? "The West Wing koleksiyonundaki her parca modern hayatin ihtiyaclari icin muhendislikle uretildi."
                : "Every piece in The West Wing collection is engineered for the demands of modern life."}
            </p>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                  {lang === "tr" ? "Secki" : "Handpicked"}
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  {lang === "tr" ? "One Cikan Urunler" : "Featured Pieces"}
                </h2>
              </div>
              <Link
                href={`/${lang}/catalog`}
                className="hidden items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground md:flex"
              >
                {lang === "tr" ? "Tumunu gor" : "View all"} <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featured.map((product, idx) => (
                <ScrollReveal key={product.id} delay={idx * 0.1}>
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
