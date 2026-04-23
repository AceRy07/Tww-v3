'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  requestedDimensions: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

interface InquiryFormProps {
  productName: string;
  productSku: string;
  productSlug: string;
}

export default function InquiryForm({ productName, productSku, productSlug }: InquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, productName, productSku, productSlug }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? 'Failed to send inquiry');
      }

      setSubmitted(true);
      reset();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <CheckCircle className="text-green-500" size={40} />
        <h3 className="text-lg font-semibold text-[#1A1A1A]">Inquiry Sent!</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          We received your request for <strong>{productName}</strong>. Our team will get back to
          you shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 text-sm text-slate-400 hover:text-[#1A1A1A] underline transition-colors"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="productName" value={productName} />
      <input type="hidden" name="productSku" value={productSku} />

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
          Full Name
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder="Jane Smith"
          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/10 focus:border-[#1A1A1A] transition placeholder:text-slate-300"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
          Email Address
        </label>
        <input
          type="email"
          {...register('email')}
          placeholder="jane@example.com"
          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/10 focus:border-[#1A1A1A] transition placeholder:text-slate-300"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
          Requested Dimensions{' '}
          <span className="text-slate-300 normal-case font-normal">(optional)</span>
        </label>
        <input
          type="text"
          {...register('requestedDimensions')}
          placeholder="e.g. 180×80×75 cm"
          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/10 focus:border-[#1A1A1A] transition placeholder:text-slate-300"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
          Message
        </label>
        <textarea
          {...register('message')}
          rows={4}
          placeholder="Tell us about your project, space, or any customization you need…"
          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/10 focus:border-[#1A1A1A] transition placeholder:text-slate-300 resize-none"
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#1A1A1A] text-white text-sm font-medium rounded-xl hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        <Send size={15} />
        {isSubmitting ? 'Sending…' : 'Send Inquiry'}
      </button>
    </form>
  );
}
