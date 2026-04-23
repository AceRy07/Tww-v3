import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/layout/SmoothScroll";
import { hasLocale, locales } from "@/i18n/config";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  return (
    <SmoothScroll>
      <Navbar />
      <main className="flex min-h-screen flex-1 flex-col">{children}</main>
      <Footer />
    </SmoothScroll>
  );
}
