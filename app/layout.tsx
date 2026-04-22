import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { LanguageProvider } from "@/lib/i18n";
import { Toaster } from "sonner";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "BizMap — Your Business From Above",
  description: "Understand every process in your business and find where AI can save you time and money.",
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full text-[#e2e2eb]" style={{ backgroundColor: "#111319", fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <LanguageProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </LanguageProvider>
        <Toaster theme="dark" position="bottom-right" />
        <Script
          src="https://cdn.jsdelivr.net/npm/accessibility/dist/accessibility.min.js"
          strategy="lazyOnload"
        />
        <Script id="acc-init" strategy="lazyOnload">
          {`
            function initAcc() {
              if (typeof window !== "undefined" && typeof Accessibility === "function") {
                new Accessibility({
                  labels: {
                    resetTitle: 'איפוס',
                    closeTitle: 'סגירה',
                    menuTitle: 'נגישות',
                    increaseText: 'הגדל טקסט',
                    decreaseText: 'הקטן טקסט',
                    increaseTextSpacing: 'הגדל מרווח טקסט',
                    decreaseTextSpacing: 'הקטן מרווח טקסט',
                    invertColors: 'צבעים הפוכים',
                    grayHues: 'גווני אפור',
                    underlineLinks: 'קו תחתון קישורים',
                    bigCursor: 'סמן גדול',
                    readingGuide: 'קורא מסך',
                    textToSpeech: 'טקסט לדיבור',
                    speechToText: 'דיבור לטקסט'
                  }
                });
              } else {
                setTimeout(initAcc, 500);
              }
            }
            initAcc();
          `}
        </Script>
      </body>
    </html>
  );
}
