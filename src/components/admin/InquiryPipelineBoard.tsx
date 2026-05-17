'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import {
  DndContext,
  PointerSensor,
  type DragEndEvent,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { updateInquiryStatus } from '@/lib/actions/inquiry-actions';
import {
  INQUIRY_STATUSES,
  INQUIRY_STATUS_LABELS,
  normalizeInquiryStatus,
  type InquiryStatus,
} from '@/lib/inquiry-status';
import { formatProductPrice, type ProductCurrency } from '@/lib/pricing';

type ProductDetails = {
  product?: string;
  productName?: string;
  dimensions?: string;
  notes?: string;
  displayedPriceText?: string;
};

export type InquiryPipelineItem = {
  id: string;
  customerName: string;
  customerEmail: string;
  status: InquiryStatus | null;
  productDetails: ProductDetails | null;
  quotedPrice: string | null;
  quotedCurrency: ProductCurrency;
  createdAt: string | null;
};

function formatDate(date: string | null): string {
  if (!date) return 'TBD';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function getProductText(productDetails: ProductDetails | null): string {
  const product = productDetails?.productName ?? productDetails?.product;
  return product && product.trim().length > 0 ? product : 'No product details';
}

function getDimensionsText(productDetails: ProductDetails | null): string {
  const dimensions = productDetails?.dimensions;
  return dimensions && dimensions.trim().length > 0 ? dimensions : '';
}

function getPriceText(inquiry: InquiryPipelineItem): string {
  if (inquiry.quotedPrice) {
    return `${formatProductPrice(Number(inquiry.quotedPrice), inquiry.quotedCurrency, 'tr')} quoted`;
  }

  const snapshotText = inquiry.productDetails?.displayedPriceText;
  return snapshotText && snapshotText.trim().length > 0 ? snapshotText : 'TBD';
}

function InquiryCard({
  inquiry,
  isUpdating,
}: {
  inquiry: InquiryPipelineItem;
  isUpdating: boolean;
}) {
  const status = normalizeInquiryStatus(inquiry.status);
  const product = getProductText(inquiry.productDetails);
  const dimensions = getDimensionsText(inquiry.productDetails);
  const priceText = getPriceText(inquiry);
  const isInProduction = status === 'in_production';
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: inquiry.id,
    data: { status },
    disabled: isUpdating,
  });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging || isUpdating ? 0.65 : undefined,
        zIndex: isDragging ? 20 : undefined,
      }}
      {...listeners}
      {...attributes}
      className={[
        'bg-[#0e0e0e] border border-[#2a2a2a] p-6 flex flex-col gap-5',
        'hover:border-[#8e9192] transition-colors group',
        isInProduction ? 'border-l-2 border-l-white' : '',
        isUpdating ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-[Inter,sans-serif] text-[18px] font-medium leading-[1.3] text-white group-hover:text-white truncate">
          {inquiry.customerName || 'TBD'}
        </h3>
        <span className="font-[Inter,sans-serif] text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192] shrink-0">
          #{shortId(inquiry.id)}
        </span>
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-2">
        <p className="font-[Inter,sans-serif] text-[14px] text-[#c4c7c8] leading-[1.6]">{product}</p>
        <p className="font-[Inter,sans-serif] text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
          {priceText}
        </p>
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
          Detail View -&gt;
        </Link>
      </div>
    </article>
  );
}

function KanbanColumn({
  status,
  items,
  updatingId,
}: {
  status: InquiryStatus;
  items: InquiryPipelineItem[];
  updatingId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section className="w-[320px] flex flex-col h-full shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-5 border-b border-[#2a2a2a] pb-4">
        <h2 className="font-[Inter,sans-serif] text-[12px] font-semibold uppercase tracking-[0.1em] text-white">
          {INQUIRY_STATUS_LABELS[status]}
        </h2>
        <span className="font-[Inter,sans-serif] text-[12px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
          {String(items.length).padStart(2, '0')}
        </span>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={[
          'flex-1 overflow-y-auto flex flex-col gap-4 pr-1 pb-4',
          isOver ? 'outline outline-1 outline-[#8e9192] outline-offset-4' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {items.length === 0 ? (
          <div className="border border-dashed border-[#2a2a2a] p-6 flex items-center justify-center">
            <span className="font-[Inter,sans-serif] text-[12px] uppercase tracking-[0.1em] text-[#444748]">
              No inquiries
            </span>
          </div>
        ) : (
          items.map((inquiry) => (
            <InquiryCard key={inquiry.id} inquiry={inquiry} isUpdating={updatingId === inquiry.id} />
          ))
        )}
      </div>
    </section>
  );
}

export default function InquiryPipelineBoard({ inquiries }: { inquiries: InquiryPipelineItem[] }) {
  const [items, setItems] = useState(inquiries);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const grouped = useMemo(() => {
    const next = Object.fromEntries(
      INQUIRY_STATUSES.map((status) => [status, [] as InquiryPipelineItem[]])
    ) as Record<InquiryStatus, InquiryPipelineItem[]>;

    for (const item of items) {
      next[normalizeInquiryStatus(item.status)].push(item);
    }

    return next;
  }, [items]);

  function handleDragEnd(event: DragEndEvent) {
    const inquiryId = String(event.active.id);
    const nextStatus = event.over?.id;

    if (!nextStatus || !INQUIRY_STATUSES.includes(nextStatus as InquiryStatus)) {
      return;
    }

    const targetStatus = nextStatus as InquiryStatus;
    const current = items.find((item) => item.id === inquiryId);

    if (!current || normalizeInquiryStatus(current.status) === targetStatus) {
      return;
    }

    const previousItems = items;
    setUpdatingId(inquiryId);
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === inquiryId ? { ...item, status: targetStatus } : item))
    );

    startTransition(async () => {
      const result = await updateInquiryStatus({ id: inquiryId, status: targetStatus });

      if ('error' in result) {
        setItems(previousItems);
        toast.error(result.error);
      } else {
        toast.success(`Inquiry moved to ${INQUIRY_STATUS_LABELS[targetStatus]}.`);
      }

      setUpdatingId(null);
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-6 items-start min-w-max pb-8">
        {INQUIRY_STATUSES.map((status) => (
          <KanbanColumn key={status} status={status} items={grouped[status]} updatingId={updatingId} />
        ))}
      </div>
    </DndContext>
  );
}
