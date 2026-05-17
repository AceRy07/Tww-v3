'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Resend } from 'resend';
import { db } from '@/lib/db';
import { inquiries } from '@/db/schema';
import { hasLocale } from '@/i18n/config';
import { requireAdmin } from '@/lib/auth';
import { INQUIRY_STATUSES, type InquiryStatus } from '@/lib/inquiry-status';

const inquirySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  requestedDimensions: z.string().max(200).optional(),
  message: z.string().min(10).max(2000),
  productName: z.string().max(200),
  productSku: z.string().max(50),
  productSlug: z.string().max(100),
  primaryImageUrl: z.string().max(2000).optional(),
  locale: z.string().optional(),
});

export type InquiryActionInput = z.infer<typeof inquirySchema>;
export type InquiryActionResult = { success: true } | { error: string };

const inquiryStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(INQUIRY_STATUSES),
});

export async function submitInquiry(input: InquiryActionInput): Promise<InquiryActionResult> {
  const result = inquirySchema.safeParse(input);
  if (!result.success) {
    return { error: 'Invalid form data.' };
  }

  const { name, email, requestedDimensions, message, productName, productSku, productSlug, locale } =
    result.data;

  const resolvedLocale = locale && hasLocale(locale) ? locale : 'en';
  const isTr = resolvedLocale === 'tr';

  // ── 1. Persist to database ──────────────────────────────────────────────────
  try {
    await db.insert(inquiries).values({
      customerName: name,
      customerEmail: email,
      status: 'pending',
      productDetails: {
        product: `${productName} (${productSku})`,
        dimensions: requestedDimensions ?? '',
        notes: message,
      },
    });
  } catch (err) {
    console.error('[submitInquiry] DB insert failed:', err);
    return { error: 'Failed to save your inquiry. Please try again later.' };
  }

  // ── 2. Send emails ──────────────────────────────────────────────────────────
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.INQUIRY_TO_EMAIL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const productUrl = `${siteUrl}/${resolvedLocale}/product/${productSlug}`;

  if (!apiKey || !toEmail) {
    // DB record saved successfully; email config missing — log but don't fail the user
    console.error('[submitInquiry] Resend environment variables are not configured.');
    return { success: true };
  }

  const resend = new Resend(apiKey);

  const ownerHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1A1A1A;">
      <div style="margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.5px;">${
          isTr ? 'Yeni Ürün Talebi' : 'New Product Inquiry'
        }</h1>
        <p style="color: #666; font-size: 14px; margin: 0;">${
          isTr ? 'The West Wing web sitesinden alındı.' : 'Received from The West Wing website.'
        }</p>
      </div>

      <div style="background: #F9F9F9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 12px;">${
          isTr ? 'Ürün' : 'Product'
        }</h2>
        <p style="margin: 0; font-size: 16px; font-weight: 600;">${productName}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #999; font-family: monospace;">${productSku}</p>
        <a href="${productUrl}" style="display: inline-block; margin-top: 8px; font-size: 13px; color: #1A1A1A; text-decoration: underline;">${
          isTr ? 'Ürünü Görüntüle ->' : 'View Product ->'
        }</a>
      </div>

      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 12px;">${
          isTr ? 'Müşteri' : 'Customer'
        }</h2>
        <p style="margin: 0 0 4px; font-size: 15px;"><strong>${name}</strong></p>
        <p style="margin: 0; font-size: 14px; color: #555;"><a href="mailto:${email}" style="color: #1A1A1A;">${email}</a></p>
      </div>

      ${
        requestedDimensions
          ? `<div style="margin-bottom: 24px;">
        <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 12px;">${
          isTr ? 'İstenen Ölçüler' : 'Requested Dimensions'
        }</h2>
        <p style="margin: 0; font-size: 14px;">${requestedDimensions}</p>
      </div>`
          : ''
      }

      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 12px;">${
          isTr ? 'Mesaj' : 'Message'
        }</h2>
        <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #333; white-space: pre-wrap;">${message}</p>
      </div>

      <hr style="border: none; border-top: 1px solid #E5E5E5; margin-bottom: 24px;" />
      <p style="font-size: 12px; color: #999; margin: 0;">The West Wing · Levent, Istanbul, Turkey</p>
    </div>
  `;

  const customerHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1A1A1A;">
      <div style="margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.5px;">${
          isTr ? 'Talebiniz Alındı' : 'We Received Your Inquiry'
        }</h1>
        <p style="color: #666; font-size: 14px; margin: 0;">${
          isTr
            ? `Merhaba ${name}, talebiniz için teşekkür ederiz. En kısa sürede sizinle iletişime geçeceğiz.`
            : `Hi ${name}, thank you for reaching out. We'll get back to you as soon as possible.`
        }</p>
      </div>

      <div style="background: #F9F9F9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 12px;">${
          isTr ? 'Talep Detayları' : 'Inquiry Summary'
        }</h2>
        <p style="margin: 0 0 4px; font-size: 15px; font-weight: 600;">${productName}</p>
        <p style="margin: 0; font-size: 12px; color: #999; font-family: monospace;">${productSku}</p>
        ${
          requestedDimensions
            ? `<p style="margin: 8px 0 0; font-size: 14px; color: #555;">${isTr ? 'Ölçüler' : 'Dimensions'}: ${requestedDimensions}</p>`
            : ''
        }
      </div>

      <p style="font-size: 14px; line-height: 1.7; color: #333; margin-bottom: 32px; white-space: pre-wrap;">${message}</p>

      <hr style="border: none; border-top: 1px solid #E5E5E5; margin-bottom: 24px;" />
      <p style="font-size: 12px; color: #999; margin: 0;">The West Wing · Levent, Istanbul, Turkey</p>
    </div>
  `;

  try {
    await Promise.all([
      resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [toEmail],
        replyTo: email,
        subject: `${isTr ? 'Yeni Talep' : 'New Inquiry'}: ${productName} (${productSku})`,
        html: ownerHtml,
      }),
      resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [email],
        subject: isTr
          ? `Talebiniz Alındı – ${productName}`
          : `Inquiry Received – ${productName}`,
        html: customerHtml,
      }),
    ]);
  } catch (err) {
    console.error('[submitInquiry] Resend error:', err);
    // DB record already saved; treat email failure as non-fatal
    return { success: true };
  }

  return { success: true };
}

export async function updateInquiryStatus(input: {
  id: string;
  status: InquiryStatus;
}): Promise<InquiryActionResult> {
  await requireAdmin();

  const parsed = inquiryStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Invalid inquiry status payload.' };
  }

  try {
    const updated = await db
      .update(inquiries)
      .set({ status: parsed.data.status })
      .where(eq(inquiries.id, parsed.data.id))
      .returning({ id: inquiries.id });

    if (updated.length === 0) {
      return { error: 'Inquiry not found.' };
    }

    revalidatePath('/admin/inquiries');
    revalidatePath(`/admin/inquiries/${parsed.data.id}`);

    return { success: true };
  } catch (err) {
    console.error('[updateInquiryStatus] Failed to update inquiry status:', err);
    return { error: 'Failed to update inquiry status.' };
  }
}
