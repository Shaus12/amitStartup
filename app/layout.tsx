import type { Metadata } from "next";
import { Manrope, Inter, Heebo } from "next/font/google";
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

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BizMap — Your Business From Above",
  description: "Understand every process in your business and find where AI can save you time and money.",
  verification: {
    google: "qZc6cHqeRzSf8Smk_Sg7ZJgNRcrI5DSnhGiGntojQq8",
  },
};

import { AccessibilityWidget } from "@/components/AccessibilityWidget";
import { CookieBanner } from "@/components/CookieBanner";
import { ThemeProvider } from "@/lib/theme";

const themeInitScript = `(function(){try{var t=localStorage.getItem('bv-theme')||'dark';if(t==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

const metaPixelCode = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1696266284855776');
fbq('track', 'PageView');
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} ${heebo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: metaPixelCode }} />
      </head>
      <body className="min-h-full" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1696266284855776&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <ThemeProvider>
          <LanguageProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Toaster position="bottom-right" />
        <AccessibilityWidget />
        <CookieBanner />
      </body>
    </html>
  );
}
