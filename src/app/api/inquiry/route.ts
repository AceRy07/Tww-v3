import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { hasLocale } from '@/i18n/config';

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  requestedDimensions: z.string().max(200).optional(),
  message: z.string().min(10).max(2000),
  productName: z.string().max(200),
  productSku: z.string().max(50),
  productSlug: z.string().max(100),
  locale: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.INQUIRY_TO_EMAIL;

  if (!apiKey || !toEmail) {
    return NextResponse.json(
      { error: 'Server configuration error. Please contact us directly.' },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 422 });
  }

  const { name, email, requestedDimensions, message, productName, productSku, productSlug, locale } =
    result.data;

  const resolvedLocale = locale && hasLocale(locale) ? locale : 'en';
  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/${resolvedLocale}/product/${productSlug}`;

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [toEmail],
      replyTo: email,
      subject: `${resolvedLocale === 'tr' ? 'Yeni Talep' : 'New Inquiry'}: ${productName} (${productSku})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #1A1A1A;">
          <div style="margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.5px;">${
              resolvedLocale === 'tr' ? 'Yeni Urun Talebi' : 'New Product Inquiry'
            }</h1>
            <p style="color: #666; font-size: 14px; margin: 0;">${
              resolvedLocale === 'tr'
                ? 'The West Wing web sitesinden alindi'
                : 'Received from The West Wing website'
            }</p>
          </div>

          <div style="background: #F9F9F9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 12px;">${
              resolvedLocale === 'tr' ? 'Urun' : 'Product'
            }</h2>
            <p style="margin: 0; font-size: 16px; font-weight: 600;">${productName}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #999; font-family: monospace;">${productSku}</p>
            <a href="${productUrl}" style="display: inline-block; margin-top: 8px; font-size: 13px; color: #1A1A1A; text-decoration: underline;">${
              resolvedLocale === 'tr' ? 'Urunu Goruntule ->' : 'View Product ->'
            }</a>
          </div>

          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 12px;">${
              resolvedLocale === 'tr' ? 'Musteri' : 'Customer'
            }</h2>
            <p style="margin: 0 0 4px; font-size: 15px;"><strong>${name}</strong></p>
            <p style="margin: 0; font-size: 14px; color: #555;"><a href="mailto:${email}" style="color: #1A1A1A;">${email}</a></p>
          </div>

          ${
            requestedDimensions
              ? `<div style="margin-bottom: 24px;">
            <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 12px;">${
              resolvedLocale === 'tr' ? 'Istenen Olculer' : 'Requested Dimensions'
            }</h2>
            <p style="margin: 0; font-size: 14px;">${requestedDimensions}</p>
          </div>`
              : ''
          }

          <div style="margin-bottom: 32px;">
            <h2 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 12px;">${
              resolvedLocale === 'tr' ? 'Mesaj' : 'Message'
            }</h2>
            <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #333; white-space: pre-wrap;">${message}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #E5E5E5; margin-bottom: 24px;" />
          <p style="font-size: 12px; color: #999; margin: 0;">The West Wing · Levent, Istanbul, Turkey</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[inquiry/route] Resend error:', err);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}
