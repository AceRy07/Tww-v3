import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getFeaturedProducts } from '@/lib/data';
import ProductCard from '@/components/catalog/ProductCard';
import ScrollReveal from '@/components/layout/ScrollReveal';

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1618220179428-22790b461013?w=1600&q=80"
          alt="The West Wing Furniture"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

        <div className="relative z-10 text-center text-white px-6 max-w-3xl mx-auto">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-white/70 mb-6">
            Modern · Durable · Minimal
          </p>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] mb-8">
            Furniture Built
            <br />
            to Last
          </h1>
          <p className="text-lg text-white/80 mb-10 max-w-lg mx-auto leading-relaxed">
            Handcrafted from 12mm compact laminate. Designed for modern living, built for
            decades of everyday use.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/catalog"
              className="flex items-center gap-2 px-7 py-3.5 bg-white text-[#1A1A1A] text-sm font-medium rounded-full hover:bg-slate-100 transition-colors"
            >
              Browse Collection
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 px-7 py-3.5 border border-white text-white text-sm font-medium rounded-full hover:bg-white/10 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <div className="w-px h-10 bg-white/20 animate-pulse" />
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* Intro strip */}
      <ScrollReveal>
        <section className="py-20 px-6 bg-[#F9F9F9]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#1A1A1A] tracking-tight mb-5">
              Designed with intention.
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed max-w-2xl mx-auto">
              Every piece in The West Wing collection is engineered for the demands of modern
              life — heat resistant, scratch resistant, and finished to exacting standards.
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* Featured Products */}
      <ScrollReveal>
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-400 mb-2">
                  Handpicked
                </p>
                <h2 className="text-3xl font-semibold text-[#1A1A1A] tracking-tight">
                  Featured Pieces
                </h2>
              </div>
              <Link
                href="/catalog"
                className="hidden md:flex items-center gap-2 text-sm font-medium text-[#1A1A1A] hover:text-slate-500 transition-colors"
              >
                View all <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featured.map((product, idx) => (
                <ScrollReveal key={product.id} delay={idx * 0.1}>
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
            </div>

            <div className="mt-10 flex justify-center md:hidden">
              <Link
                href="/catalog"
                className="flex items-center gap-2 px-7 py-3.5 bg-[#1A1A1A] text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-colors"
              >
                View Full Collection <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Materials CTA */}
      <ScrollReveal>
        <section className="py-20 px-6 bg-[#1A1A1A] text-white">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-medium tracking-[0.3em] uppercase text-white/40 mb-4">
                Our Craft
              </p>
              <h2 className="text-4xl font-semibold tracking-tight mb-5 leading-[1.1]">
                12mm Compact
                <br />
                Laminate
              </h2>
              <p className="text-white/60 leading-relaxed mb-8">
                Unlike conventional furniture materials, compact laminate offers superior resistance
                to moisture, heat, and impact. Each panel is manufactured to exacting tolerances,
                ensuring every piece ages beautifully.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white text-white text-sm font-medium rounded-full hover:bg-white hover:text-[#1A1A1A] transition-all"
              >
                Request a Quote <ArrowRight size={15} />
              </Link>
            </div>
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=800&q=80"
                alt="Material detail"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
