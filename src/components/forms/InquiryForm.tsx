'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { submitInquiry } from '@/lib/actions/inquiry-actions';

const createSchema = (errors: {
  nameShort: string;
  invalidEmail: string;
  messageShort: string;
}) =>
  z.object({
    name: z.string().min(2, errors.nameShort),
    email: z.string().email(errors.invalidEmail),
    requestedDimensions: z.string().optional(),
    message: z.string().min(10, errors.messageShort),
  });

type FormData = {
  name: string;
  email: string;
  requestedDimensions?: string;
  message: string;
};

interface InquiryFormProps {
  productName: string;
  productSku: string;
  productSlug: string;
}

export default function InquiryForm({ productName, productSku, productSlug }: InquiryFormProps) {
  const { locale, dictionary } = useLanguage();
  const schema = createSchema(dictionary.inquiry.errors);
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
      const result = await submitInquiry({ ...data, productName, productSku, productSlug, locale });

      if ('error' in result) {
        throw new Error(result.error);
      }

      setSubmitted(true);
      reset();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : dictionary.inquiry.errors.unknown);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <CheckCircle className="text-green-500" size={40} />
        <h3 className="text-lg font-semibold text-foreground">{dictionary.inquiry.sentTitle}</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {dictionary.inquiry.sentBody} <strong>{productName}</strong>
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 text-sm text-muted-foreground hover:text-foreground underline transition-colors"
        >
          {dictionary.inquiry.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="productName" value={productName} />
      <input type="hidden" name="productSku" value={productSku} />

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
          {dictionary.inquiry.labels.name}
        </label>
        <input
          type="text"
          {...register('name')}
          placeholder={dictionary.inquiry.placeholders.name}
          className="w-full px-4 py-3 text-sm border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground transition placeholder:text-muted-foreground"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
          {dictionary.inquiry.labels.email}
        </label>
        <input
          type="email"
          {...register('email')}
          placeholder={dictionary.inquiry.placeholders.email}
          className="w-full px-4 py-3 text-sm border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground transition placeholder:text-muted-foreground"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
          {dictionary.inquiry.labels.dimensions}{' '}
          <span className="text-muted-foreground normal-case font-normal">({dictionary.inquiry.labels.optional})</span>
        </label>
        <input
          type="text"
          {...register('requestedDimensions')}
          placeholder={dictionary.inquiry.placeholders.dimensions}
          className="w-full px-4 py-3 text-sm border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground transition placeholder:text-muted-foreground"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
          {dictionary.inquiry.labels.message}
        </label>
        <textarea
          {...register('message')}
          rows={4}
          placeholder={dictionary.inquiry.placeholders.message}
          className="w-full px-4 py-3 text-sm border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground transition placeholder:text-muted-foreground resize-none"
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
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-foreground text-background text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        <Send size={15} />
        {isSubmitting ? dictionary.inquiry.actions.sending : dictionary.inquiry.actions.send}
      </button>
    </form>
  );
}
