import 'server-only';

import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { inquiries } from '@/db/schema';
import type { InquiryRow } from '@/db/schema';

export const dynamic = 'force-dynamic';

// ── Status column definitions ────────────────────────────────────────────────

type StatusKey = 'pending' | 'quoted' | 'in_production' | 'shipped' | 'completed';

const COLUMNS: { key: StatusKey; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'quoted', label: 'Quote Sent' },
  { key: 'in_production', label: 'In Production' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'completed', label: 'Completed' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

// ── Sub-components ───────────────────────────────────────────────────────────

function InquiryCard({ inquiry }: { inquiry: InquiryRow }) {
  const product =
    typeof inquiry.productDetails === 'object' &&
    inquiry.productDetails !== null &&
    'product' in inquiry.productDetails
      ? String((inquiry.productDetails as Record<string, unknown>).product ?? '')
      : '—';

  const dimensions =
    typeof inquiry.productDetails === 'object' &&
    inquiry.productDetails !== null &&
    'dimensions' in inquiry.productDetails
      ? String((inquiry.productDetails as Record<string, unknown>).dimensions ?? '')
      : '';

  const isInProduction = inquiry.status === 'in_production';

  return (
    <article
      className={[
        'bg-[#0e0e0e] border border-[#2a2a2a] p-6 flex flex-col gap-5',
        'hover:border-[#8e9192] transition-colors group',
        isInProduction ? 'border-l-2 border-l-white' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-[Inter,sans-serif] text-[18px] font-medium leading-[1.3] text-white group-hover:text-white truncate">
          {inquiry.customerName}
        </h3>
        <span className="font-[Inter,sans-serif] text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192] shrink-0">
          #{shortId(inquiry.id)}
        </span>
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-2">
        <p className="font-[Inter,sans-serif] text-[14px] text-[#c4c7c8] leading-[1.6]">{product}</p>
        {dimensions && (
          <div className="flex gap-2 flex-wrap mt-1">
            <span className="border border-[#2a2a2a] px-3 py-1 font-[Inter,sans-serif] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
              {dimensions}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-5 border-t border-[#2a2a2a] flex justify-between items-center gap-3">
        <span className="font-[Inter,sans-serif] text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
          {formatDate(inquiry.createdAt)}
        </span>
        <Link
          href={`/admin/inquiries/${inquiry.id}`}
          className="h-9 px-4 flex items-center justify-center border border-[#2a2a2a] hover:border-white hover:text-white text-[#8e9192] font-[Inter,sans-serif] text-[12px] font-semibold uppercase tracking-[0.05em] transition-colors"
        >
          Detail View →
        </Link>
      </div>
    </article>
  );
}

function KanbanColumn({
  label,
  items,
}: {
  label: string;
  items: InquiryRow[];
}) {
  return (
    <section className="w-[320px] flex flex-col h-full shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-5 border-b border-[#2a2a2a] pb-4">
        <h2 className="font-[Inter,sans-serif] text-[12px] font-semibold uppercase tracking-[0.1em] text-white">
          {label}
        </h2>
        <span className="font-[Inter,sans-serif] text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
          {String(items.length).padStart(2, '0')}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 pb-4">
        {items.length === 0 ? (
          <div className="border border-dashed border-[#2a2a2a] p-6 flex items-center justify-center">
            <span className="font-[Inter,sans-serif] text-[12px] uppercase tracking-[0.1em] text-[#444748]">
              No inquiries
            </span>
          </div>
        ) : (
          items.map((inquiry) => <InquiryCard key={inquiry.id} inquiry={inquiry} />)
        )}
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminInquiriesPage() {
  const rows = await db
    .select()
    .from(inquiries)
    .orderBy(desc(inquiries.createdAt));

  // Group by status
  const grouped = Object.fromEntries(
    COLUMNS.map(({ key }) => [key, [] as InquiryRow[]])
  ) as Record<StatusKey, InquiryRow[]>;

  for (const row of rows) {
    const key = (row.status ?? 'pending') as StatusKey;
    if (key in grouped) {
      grouped[key].push(row);
    }
  }

  const totalInquiries = rows.length;
  const pendingCount = grouped.pending.length;
  const inProductionCount = grouped.in_production.length;

  return (
    <div className="flex flex-col h-full gap-0">
      {/* ── Page header ── */}
      <div className="shrink-0 mb-6 flex flex-col gap-5 border-b border-[#2a2a2a] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-[Inter,sans-serif] text-[24px] font-medium leading-[1.3] text-white">
            Inquiry Pipeline
          </h1>
          <p className="font-[Inter,sans-serif] text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192] mt-1">
            Pipeline Overview
          </p>
        </div>

        {/* Summary stats */}
        <div className="flex gap-6">
          <div className="flex flex-col items-end">
            <span className="font-[Inter,sans-serif] text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
              Total
            </span>
            <span className="font-[Inter,sans-serif] text-[32px] font-medium leading-[1.2] text-white">
              {totalInquiries}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-[Inter,sans-serif] text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
              Pending
            </span>
            <span className="font-[Inter,sans-serif] text-[32px] font-medium leading-[1.2] text-white">
              {pendingCount}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-[Inter,sans-serif] text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
              In Production
            </span>
            <span className="font-[Inter,sans-serif] text-[32px] font-medium leading-[1.2] text-white">
              {inProductionCount}
            </span>
          </div>
        </div>
      </div>

      {/* ── Kanban board ── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden -mx-4 px-4 md:-mx-8 md:px-8">
        <div className="flex h-full gap-6 items-start min-w-max pb-8">
          {COLUMNS.map(({ key, label }) => (
            <KanbanColumn key={key} label={label} items={grouped[key]} />
          ))}
        </div>
      </div>
    </div>
  );
}
