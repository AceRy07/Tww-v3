export const INQUIRY_STATUSES = [
  'pending',
  'quoted',
  'approved',
  'in_production',
  'qc_packaging',
  'completed',
  'cancelled',
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  pending: 'Pending',
  quoted: 'Quoted',
  approved: 'Approved',
  in_production: 'In Production',
  qc_packaging: 'QC / Packaging',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const INQUIRY_STATUS_META: Record<
  InquiryStatus,
  { badgeClass: string; dotClass: string }
> = {
  pending: {
    badgeClass: 'border-[#5a2626] bg-[#261414] text-[#fca5a5]',
    dotClass: 'bg-[#ef4444]',
  },
  quoted: {
    badgeClass: 'border-[#1f4f2f] bg-[#102117] text-[#86efac]',
    dotClass: 'bg-[#22c55e]',
  },
  approved: {
    badgeClass: 'border-[#244f46] bg-[#10211e] text-[#5eead4]',
    dotClass: 'bg-[#14b8a6]',
  },
  in_production: {
    badgeClass: 'border-[#3f3a1d] bg-[#1f1a0f] text-[#facc15]',
    dotClass: 'bg-[#eab308]',
  },
  qc_packaging: {
    badgeClass: 'border-[#153a5a] bg-[#0d1a26] text-[#7dd3fc]',
    dotClass: 'bg-[#0ea5e9]',
  },
  completed: {
    badgeClass: 'border-[#2e2e2e] bg-[#161616] text-[#e5e7eb]',
    dotClass: 'bg-[#e5e7eb]',
  },
  cancelled: {
    badgeClass: 'border-[#4a2424] bg-[#201111] text-[#f87171]',
    dotClass: 'bg-[#dc2626]',
  },
};

export const INQUIRY_STATUS_FLOW: Record<
  InquiryStatus,
  { label: string; status: InquiryStatus }[]
> = {
  pending: [
    { label: 'Mark as Quoted', status: 'quoted' },
    { label: 'Cancel Inquiry', status: 'cancelled' },
  ],
  quoted: [
    { label: 'Mark as Approved', status: 'approved' },
    { label: 'Back to Pending', status: 'pending' },
    { label: 'Cancel Inquiry', status: 'cancelled' },
  ],
  approved: [
    { label: 'Start Production', status: 'in_production' },
    { label: 'Cancel Inquiry', status: 'cancelled' },
  ],
  in_production: [
    { label: 'Move to QC / Packaging', status: 'qc_packaging' },
    { label: 'Cancel Inquiry', status: 'cancelled' },
  ],
  qc_packaging: [{ label: 'Mark as Completed', status: 'completed' }],
  completed: [{ label: 'Reopen Inquiry', status: 'pending' }],
  cancelled: [{ label: 'Reopen Inquiry', status: 'pending' }],
};

export function isInquiryStatus(value: unknown): value is InquiryStatus {
  return typeof value === 'string' && INQUIRY_STATUSES.includes(value as InquiryStatus);
}

export function normalizeInquiryStatus(value: unknown): InquiryStatus {
  return isInquiryStatus(value) ? value : 'pending';
}
