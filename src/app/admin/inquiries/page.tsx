import 'server-only';

import { desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { inquiries } from '@/db/schema';
import InquiryPipelineBoard, {
  type InquiryPipelineItem,
} from '@/components/admin/InquiryPipelineBoard';
import { normalizeInquiryStatus } from '@/lib/inquiry-status';
import { normalizeCurrency } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export default async function AdminInquiriesPage() {
  const rows = await db
    .select()
    .from(inquiries)
    .orderBy(desc(inquiries.createdAt));

  const pipelineItems = rows.map((row) => ({
    id: row.id,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    status: normalizeInquiryStatus(row.status),
    productDetails:
      row.productDetails && typeof row.productDetails === 'object'
        ? row.productDetails
        : null,
    quotedPrice: row.quotedPrice,
    quotedCurrency: normalizeCurrency(row.quotedCurrency),
    createdAt: row.createdAt?.toISOString() ?? null,
  })) satisfies InquiryPipelineItem[];

  const totalInquiries = pipelineItems.length;
  const pendingCount = pipelineItems.filter((row) => row.status === 'pending').length;
  const inProductionCount = pipelineItems.filter((row) => row.status === 'in_production').length;

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Page header */}
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

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden -mx-4 px-4 md:-mx-8 md:px-8">
        <InquiryPipelineBoard
          key={pipelineItems.map((item) => `${item.id}:${item.status}`).join('|')}
          inquiries={pipelineItems}
        />
      </div>
    </div>
  );
}
