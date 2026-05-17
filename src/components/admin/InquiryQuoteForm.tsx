'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { saveInquiryQuote } from '@/lib/actions/inquiry-actions';
import type { ProductCurrency } from '@/lib/pricing';

type InquiryQuoteFormProps = {
  inquiryId: string;
  quotedPrice: string | null;
  quotedCurrency: ProductCurrency;
  estimatedDeliveryDays: number | null;
  quoteNote: string | null;
};

export default function InquiryQuoteForm({
  inquiryId,
  quotedPrice,
  quotedCurrency,
  estimatedDeliveryDays,
  quoteNote,
}: InquiryQuoteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingMode, setPendingMode] = useState<'save' | 'quote' | null>(null);

  function submitQuote(formData: FormData, markAsQuoted: boolean) {
    if (isPending) return;

    setPendingMode(markAsQuoted ? 'quote' : 'save');
    startTransition(async () => {
      const rawPrice = String(formData.get('quotedPrice') ?? '').trim();
      const rawDeliveryDays = String(formData.get('estimatedDeliveryDays') ?? '').trim();
      const result = await saveInquiryQuote({
        id: inquiryId,
        quotedPrice: rawPrice ? Number(rawPrice) : null,
        quotedCurrency: String(formData.get('quotedCurrency') ?? 'TRY') as ProductCurrency,
        estimatedDeliveryDays: rawDeliveryDays ? Number(rawDeliveryDays) : null,
        quoteNote: String(formData.get('quoteNote') ?? ''),
        markAsQuoted,
      });

      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success(markAsQuoted ? 'Quote saved and inquiry marked as quoted.' : 'Quote saved.');
        router.refresh();
      }

      setPendingMode(null);
    });
  }

  return (
    <form className="mt-6 grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">Quoted Price</span>
          <input
            name="quotedPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={quotedPrice ?? ''}
            className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white focus:border-[#4a4a4a] focus:outline-none"
            placeholder="0.00"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">Quoted Currency</span>
          <select
            name="quotedCurrency"
            defaultValue={quotedCurrency}
            className="min-h-10 border border-[#2a2a2a] bg-[#131313] px-3 text-sm text-white focus:border-[#4a4a4a] focus:outline-none"
          >
            <option value="TRY">TRY</option>
            <option value="USD">USD</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">
          Estimated Delivery Days
        </span>
        <input
          name="estimatedDeliveryDays"
          type="number"
          min="1"
          defaultValue={estimatedDeliveryDays ?? ''}
          className="min-h-10 border border-[#2a2a2a] bg-transparent px-3 text-sm text-white focus:border-[#4a4a4a] focus:outline-none"
          placeholder="30"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8e9192]">Quote Note</span>
        <textarea
          name="quoteNote"
          defaultValue={quoteNote ?? ''}
          rows={4}
          className="min-h-24 border border-[#2a2a2a] bg-transparent px-3 py-2 text-sm text-white focus:border-[#4a4a4a] focus:outline-none"
          placeholder="Optional quote note"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={(event) => {
            if (event.currentTarget.form) submitQuote(new FormData(event.currentTarget.form), false);
          }}
          className="inline-flex min-h-10 items-center justify-center border border-[#2a2a2a] px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#d3d3d3] transition-colors hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingMode === 'save' ? 'Saving...' : 'Save Quote'}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={(event) => {
            if (event.currentTarget.form) submitQuote(new FormData(event.currentTarget.form), true);
          }}
          className="inline-flex min-h-10 items-center justify-center border border-white bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingMode === 'quote' ? 'Saving...' : 'Save Quote and Mark as Quoted'}
        </button>
      </div>
    </form>
  );
}
