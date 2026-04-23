import type { Metadata } from 'next';
import { MapPin, Mail, Phone } from 'lucide-react';
import InquiryForm from '@/components/forms/InquiryForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with The West Wing team. We\'re ready to help you find the perfect piece for your space.',
};

export default function ContactPage() {
  return (
    <div className="pt-16 min-h-screen">
      {/* Page header */}
      <div className="bg-[#F9F9F9] border-b border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-400 mb-2">
            Reach Out
          </p>
          <h1 className="text-4xl font-semibold text-[#1A1A1A] tracking-tight">
            Contact Us
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact info */}
          <div>
            <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-4">
              Let&apos;s talk about your space.
            </h2>
            <p className="text-slate-500 leading-relaxed mb-10">
              Whether you have a specific product in mind or need help curating a room, our team
              is here to guide you. Reach out and we&apos;ll respond within one business day.
            </p>

            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-[#1A1A1A]" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Email</p>
                  <a
                    href="mailto:hello@thewestwing.co"
                    className="text-sm font-medium text-[#1A1A1A] hover:text-slate-500 transition-colors"
                  >
                    hello@thewestwing.co
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-[#1A1A1A]" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Phone</p>
                  <a
                    href="tel:+902121234567"
                    className="text-sm font-medium text-[#1A1A1A] hover:text-slate-500 transition-colors"
                  >
                    +90 212 123 45 67
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-[#1A1A1A]" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Showroom</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">
                    Levent, Istanbul, Turkey
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Mon–Sat 10:00–18:00
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* General inquiry form */}
          <div className="bg-[#F9F9F9] rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Send a Message</h3>
            <p className="text-sm text-slate-500 mb-6">
              Have a general question or a bespoke project in mind? We&apos;d love to hear from you.
            </p>
            <InquiryForm
              productName="General Inquiry"
              productSku="N/A"
              productSlug="contact"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
