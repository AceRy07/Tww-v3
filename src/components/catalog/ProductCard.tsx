import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/data';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-xl"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#1A1A1A]/0 group-hover:bg-[#1A1A1A]/40 transition-all duration-300 flex items-center justify-center">
          <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-wide px-5 py-2.5 rounded-full border border-white">
            View Details
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-medium text-[#1A1A1A] text-base group-hover:text-slate-700 transition-colors line-clamp-1">
            {product.title}
          </h3>
          <span
            className="shrink-0 w-4 h-4 rounded-full border border-slate-200 mt-0.5"
            style={{ backgroundColor: product.colorHex }}
            title={product.color}
          />
        </div>
        <p className="text-xs text-slate-400 mb-3">
          {product.category} · {product.material.split(',')[0]}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#1A1A1A]">
            {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-slate-400">
            {product.dimensions.width}×{product.dimensions.depth} cm
          </p>
        </div>
      </div>
    </Link>
  );
}
