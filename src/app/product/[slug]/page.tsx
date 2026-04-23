import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Ruler, Layers, Tag } from 'lucide-react';
import { getProductBySlug, products } from '@/lib/data';
import InquiryForm from '@/components/forms/InquiryForm';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#1A1A1A] transition-colors mb-10"
        >
          <ArrowLeft size={15} /> Back to Catalog
        </Link>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Images */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50">
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
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-50">
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

          {/* Info */}
          <div>
            <div className="mb-8">
              <span className="text-xs font-medium tracking-[0.25em] uppercase text-slate-400 block mb-3">
                {product.category}
              </span>
              <h1 className="text-4xl font-semibold text-[#1A1A1A] tracking-tight mb-4">
                {product.title}
              </h1>
              <p className="text-2xl font-medium text-[#1A1A1A] mb-6">
                {product.price.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                  maximumFractionDigits: 0,
                })}
              </p>
              <p className="text-slate-500 leading-relaxed">{product.description}</p>
            </div>

            {/* Specs */}
            <div className="border-t border-slate-100 pt-6 mb-8 grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Ruler size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 mb-1">Dimensions</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    {product.dimensions.width} × {product.dimensions.depth} × {product.dimensions.height} cm
                  </p>
                  <p className="text-xs text-slate-400">W × D × H</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Layers size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 mb-1">Material</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{product.material}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div
                  className="w-4 h-4 rounded-full border border-slate-200 shrink-0 mt-0.5"
                  style={{ backgroundColor: product.colorHex }}
                />
                <div>
                  <p className="text-xs text-slate-400 mb-1">Finish / Color</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{product.color}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 mb-1">SKU</p>
                  <p className="text-sm font-medium text-[#1A1A1A] font-mono">{product.sku}</p>
                </div>
              </div>
            </div>

            {/* Inquiry form */}
            <div className="bg-[#F9F9F9] rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[#1A1A1A] mb-1">Request a Quote</h2>
              <p className="text-sm text-slate-500 mb-6">
                Interested in <strong>{product.title}</strong>? Send us an inquiry and we&apos;ll
                get back to you within 24 hours.
              </p>
              <InquiryForm
                productName={product.title}
                productSku={product.sku}
                productSlug={product.slug}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
