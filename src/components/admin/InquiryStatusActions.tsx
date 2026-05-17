'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { updateInquiryStatus } from '@/lib/actions/inquiry-actions';
import {
  INQUIRY_STATUS_FLOW,
  INQUIRY_STATUS_LABELS,
  normalizeInquiryStatus,
  type InquiryStatus,
} from '@/lib/inquiry-status';

export default function InquiryStatusActions({
  inquiryId,
  currentStatus,
}: {
  inquiryId: string;
  currentStatus: InquiryStatus | null;
}) {
  const router = useRouter();
  const status = normalizeInquiryStatus(currentStatus);
  const actions = INQUIRY_STATUS_FLOW[status];
  const [pendingStatus, setPendingStatus] = useState<InquiryStatus | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStatusUpdate(nextStatus: InquiryStatus) {
    if (isPending) return;

    setPendingStatus(nextStatus);
    startTransition(async () => {
      const result = await updateInquiryStatus({ id: inquiryId, status: nextStatus });

      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success(`Inquiry moved to ${INQUIRY_STATUS_LABELS[nextStatus]}.`);
        router.refresh();
      }

      setPendingStatus(null);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map((action) => (
        <Button
          key={`${action.label}-${action.status}`}
          type="button"
          variant="outline"
          className="h-12 rounded-none border-[#2a2a2a] bg-[#0e0e0e] px-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#d3d3d3] hover:border-white hover:bg-[#0e0e0e] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          onClick={() => handleStatusUpdate(action.status)}
        >
          {pendingStatus === action.status ? 'Updating...' : action.label}
        </Button>
      ))}
    </div>
  );
}
