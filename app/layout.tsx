import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
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
  title: "BizView — Your Business From Above",
  description: "Understand every process in your business and find where AI can save you time and money.",
};

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
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
