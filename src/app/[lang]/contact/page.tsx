import type { Metadata } from "next";
import { MapPin, Mail, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import InquiryForm from "@/components/forms/InquiryForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with The West Wing team.",
};

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="border-b border-border bg-muted py-12 px-6">
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            {lang === "tr" ? "Iletisim" : "Reach Out"}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            {lang === "tr" ? "Bize Ulasin" : "Contact Us"}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {lang === "tr" ? "Mekaniniz icin birlikte dusunelim." : "Let's talk about your space."}
            </h2>
            <p className="mb-10 leading-relaxed text-muted-foreground">
              {lang === "tr"
                ? "Belirli bir urun ariyor ya da proje destegi istiyorsaniz ekibimiz yardimci olmak icin hazir."
                : "Whether you have a specific product in mind or need help curating a room, our team is here to guide you."}
            </p>

            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Mail size={16} className="text-foreground" />
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                  <a href="mailto:hello@thewestwing.co" className="text-sm font-medium text-foreground">
                    hello@thewestwing.co
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Phone size={16} className="text-foreground" />
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Phone</p>
                  <a href="tel:+902121234567" className="text-sm font-medium text-foreground">
                    +90 212 123 45 67
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <MapPin size={16} className="text-foreground" />
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                    {lang === "tr" ? "Showroom" : "Showroom"}
                  </p>
                  <p className="text-sm font-medium text-foreground">Levent, Istanbul, Turkey</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card p-8">
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {lang === "tr" ? "Mesaj Gonder" : "Send a Message"}
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              {lang === "tr"
                ? "Genel bir sorunuz veya ozel projeniz varsa bize ulasin."
                : "Have a general question or a bespoke project in mind? We'd love to hear from you."}
            </p>
            <InquiryForm productName={lang === "tr" ? "Genel Talep" : "General Inquiry"} productSku="N/A" productSlug="contact" />
          </div>
        </div>
      </div>
    </div>
  );
}
