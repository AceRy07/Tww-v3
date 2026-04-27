import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";
import ThemeProvider from "@/components/providers/ThemeProvider";
import LanguageProvider from "@/components/providers/LanguageProvider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: {
    default: "The West Wing — Modern Furniture",
    template: "%s | The West Wing",
  },
  description:
    "Minimalist, high-end furniture crafted from 12mm compact laminate. Browse our modern catalog and request a quote.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground font-[var(--font-geist),sans-serif]">
        <ThemeProvider>
          <LanguageProvider>
            {children}
            {/* Global toaster: admin/server action sonucunda uretilen toast mesajlarini uygular. */}
            <Toaster position="top-right" richColors />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
