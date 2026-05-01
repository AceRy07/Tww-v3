import 'server-only';

import Image from 'next/image';
import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { inquiries } from '@/db/schema';
import { Button } from '@/components/ui/button';
import { updateInquiryStatus } from '@/lib/actions/inquiry-actions';

type PageProps = {
  params: Promise<{ id: string }>;
};

interface InquiryProductDetails {
  productName?: string;
  productSlug?: string;
  productImage?: string;
  dimensions?: string;
  productId?: string;
  notes?: string;
  product?: string;
}

export const dynamic = 'force-dynamic';

function formatDate(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateWithZone(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function asText(value: unknown, fallback = '—'): string {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
}

function getStatusMeta(status: string | null) {
  switch (status) {
    case 'quoted':
      return {
        label: 'Quoted',
        badgeClass: 'border-[#1f4f2f] bg-[#102117] text-[#86efac]',
        dotClass: 'bg-[#22c55e]',
      };
    case 'in_production':
      return {
        label: 'In Production',
        badgeClass: 'border-[#3f3a1d] bg-[#1f1a0f] text-[#facc15]',
        dotClass: 'bg-[#eab308]',
      };
    case 'shipped':
      return {
        label: 'Shipped',
        badgeClass: 'border-[#153a5a] bg-[#0d1a26] text-[#7dd3fc]',
        dotClass: 'bg-[#0ea5e9]',
      };
    case 'completed':
      return {
        label: 'Completed',
        badgeClass: 'border-[#2e2e2e] bg-[#161616] text-[#e5e7eb]',
        dotClass: 'bg-[#e5e7eb]',
      };
    default:
      return {
        label: 'Pending',
        badgeClass: 'border-[#5a2626] bg-[#261414] text-[#fca5a5]',
        dotClass: 'bg-[#ef4444]',
      };
  }
}

export default async function AdminInquiryDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [inquiry] = await db
    .select()
    .from(inquiries)
    .where(eq(inquiries.id, id))
    .limit(1);

  if (!inquiry) {
    notFound();
  }

  const productDetails =
    inquiry.productDetails && typeof inquiry.productDetails === 'object'
      ? (inquiry.productDetails as InquiryProductDetails)
      : null;

  const productName = asText(productDetails?.productName ?? productDetails?.product, 'Unspecified product');
  const productId = asText(productDetails?.productId, 'Not provided');
  const productSlug = asText(productDetails?.productSlug, '');
  const productImage = asText(productDetails?.productImage, '');
  const productUrl = `/products/${productSlug}`;
  const hasProductLink = productSlug.length > 0;
  const productDimensions = asText(productDetails?.dimensions, 'Not provided');
  const specialNotes = asText(productDetails?.notes, 'No special notes');
  const messageContent = asText(productDetails?.notes, 'No message content');
  const statusMeta = getStatusMeta(inquiry.status ?? 'pending');

  async function markAsQuoted() {
    'use server';

    const result = await updateInquiryStatus({ id: inquiry.id, status: 'quoted' });
    if ('error' in result) {
      console.error('[markAsQuoted] Failed to set inquiry as quoted:', result.error);
      return;
    }

    revalidatePath('/admin/inquiries');
    revalidatePath(`/admin/inquiries/${inquiry.id}`);
  }

  return (
    <section className="mx-auto w-full max-w-[1440px] bg-[#131313]">
      <div className="mb-8 flex flex-col gap-6">
        <Link
          href="/admin/inquiries"
          className="inline-flex min-h-12 w-fit items-center gap-2 border border-[#2a2a2a] px-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192] transition-colors hover:border-white hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Board
        </Link>

        <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-[Inter,sans-serif] text-[42px] font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-[56px]">
              INQ-{inquiry.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="mt-2 text-[18px] text-[#c4c7c8]">{productName}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`flex h-12 items-center border px-4 ${statusMeta.badgeClass}`}
              aria-label={`Status: ${statusMeta.label}`}
            >
              <span className={`mr-3 h-2 w-2 ${statusMeta.dotClass}`} />
              <span className="text-[12px] font-semibold uppercase tracking-[0.1em]">
                {statusMeta.label}
              </span>
            </div>

            <form action={markAsQuoted}>
              <Button
                type="submit"
                variant="outline"
                className="h-12 rounded-none border-[#2a2a2a] bg-[#0e0e0e] px-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#d3d3d3] hover:border-white hover:bg-[#0e0e0e] hover:text-white"
                disabled={inquiry.status === 'quoted'}
              >
                {inquiry.status === 'quoted' ? 'Teklif Verildi' : 'Teklif Verildi Olarak Isaretle'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <section className="flex flex-col gap-8 lg:col-span-8">
          <article className="border border-[#2a2a2a] bg-[#0e0e0e] p-6 md:p-8">
            <header className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-[24px] font-medium text-white">{inquiry.customerName}</h2>
                <p className="text-[16px] text-[#8e9192]">{inquiry.customerEmail}</p>
              </div>
              <span className="text-right text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
                {formatDateWithZone(inquiry.createdAt)}
              </span>
            </header>

            <div className="mt-6 space-y-4 text-[18px] leading-[1.6] text-[#e5e2e1]">
              <p>To the West Wing Design Team,</p>
              <p className="whitespace-pre-wrap break-words">{messageContent}</p>

              <div className="mt-8 border border-[#2a2a2a] bg-[#121212] p-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
                  Product Main Image
                </p>

                {productImage ? (
                  <div className="space-y-4">
                    <div className="relative w-full overflow-hidden border border-[#2a2a2a] bg-[#0d0d0d]" style={{ aspectRatio: '16 / 10' }}>
                      <Image
                        src={productImage}
                        alt={`${productName} main image`}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 60vw"
                      />
                    </div>

                    {hasProductLink ? (
                      <Link
                        href={productUrl}
                        className="inline-flex min-h-10 items-center justify-center border border-[#2a2a2a] px-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#d3d3d3] transition-colors hover:border-white hover:text-white"
                      >
                        Urunu Sitede Goruntule
                      </Link>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex min-h-52 items-center justify-center border border-dashed border-[#3a3a3a] bg-[#0f0f0f]">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
                      Gorsel Bulunamadi
                    </span>
                  </div>
                )}
              </div>

              <p>Regards,</p>
              <p>{inquiry.customerName}</p>
            </div>
          </article>

          <article className="border border-[#2a2a2a] bg-[#0e0e0e] p-6 md:p-8">
            <h3 className="border-b border-[#2a2a2a] pb-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
              Raw Payload
            </h3>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words text-sm text-[#c4c7c8]">
              {productDetails ? JSON.stringify(productDetails, null, 2) : 'No product details'}
            </pre>
          </article>
        </section>

        <aside className="flex flex-col gap-8 lg:col-span-4">
          <article className="border border-[#2a2a2a] bg-[#0e0e0e] p-6 md:p-8">
            <h3 className="border-b border-[#2a2a2a] pb-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
              Requested Specifications
            </h3>

            <div className="mt-6 grid grid-cols-1 gap-px border border-[#2a2a2a] bg-[#2a2a2a] sm:grid-cols-2">
              <div className="min-h-20 bg-[#0e0e0e] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">Product</p>
                <p className="mt-2 text-[20px] font-medium text-white">{productName}</p>
                {productSlug ? (
                  <Link
                    href={productUrl}
                    className="mt-3 inline-flex items-center border border-[#2a2a2a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#d3d3d3] transition-colors hover:border-white hover:text-white"
                  >
                    Urun Detayina Git
                  </Link>
                ) : null}
              </div>
              <div className="min-h-20 bg-[#0e0e0e] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">Dimensions</p>
                <p className="mt-2 text-[20px] font-medium text-white">{productDimensions}</p>
              </div>
              <div className="min-h-20 bg-[#0e0e0e] p-4 sm:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">Special Notes</p>
                <p className="mt-2 whitespace-pre-wrap break-words text-[16px] text-white">{specialNotes}</p>
              </div>
            </div>
          </article>

          <article className="border border-[#2a2a2a] bg-[#0e0e0e] p-6 md:p-8">
            <h3 className="border-b border-[#2a2a2a] pb-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
              Client Dossier
            </h3>

            <ul className="mt-2 flex flex-col">
              <li className="min-h-16 border-b border-[#2a2a2a] py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">Sender Name</p>
                <p className="mt-1 text-[16px] text-white">{inquiry.customerName}</p>
              </li>
              <li className="min-h-16 border-b border-[#2a2a2a] py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">Sender Email</p>
                <p className="mt-1 break-all text-[16px] text-white">{inquiry.customerEmail}</p>
              </li>
              <li className="min-h-16 border-b border-[#2a2a2a] py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">Sent At</p>
                <p className="mt-1 text-[16px] text-white">{formatDate(inquiry.createdAt)}</p>
              </li>
              <li className="min-h-16 border-b border-[#2a2a2a] py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">Product ID</p>
                <p className="mt-1 break-all text-[13px] text-white">{productId}</p>
              </li>
              <li className="min-h-16 border-b border-[#2a2a2a] py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">Product Slug</p>
                <p className="mt-1 break-all text-[13px] text-white">{productSlug || 'Not provided'}</p>
              </li>
              <li className="min-h-16 border-b border-[#2a2a2a] py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">Product Image</p>
                {productImage ? (
                  <Link
                    href={productImage}
                    className="mt-1 inline-flex break-all text-[13px] text-white underline underline-offset-4"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {productImage}
                  </Link>
                ) : (
                  <p className="mt-1 text-[13px] text-white">Not provided</p>
                )}
              </li>
              <li className="min-h-16 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">Inquiry ID</p>
                <p className="mt-1 break-all text-[13px] text-white">{inquiry.id}</p>
              </li>
            </ul>
          </article>
        </aside>
      </div>
    </section>
  );
}
