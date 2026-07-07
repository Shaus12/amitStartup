import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

const title = "BizMap — ייעול עסק עם AI | פחות עבודה, יותר רווח";
const description =
  "BizMap עוזרת לבעלי עסקים למצוא איפה הזמן והכסף נשרפים, לבנות ייעול עסק חכם עם AI לעסקים ובינה מלאכותית, ולהתחיל מהצעד הנכון.";
const ogImageUrl = "https://www.bizmapai.com/og-home.png";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "AI לעסקים",
    "ייעול עסק",
    "בינה מלאכותית לעסקים",
    "אוטומציה לעסק",
    "חיסכון בזמן",
  ],
  alternates: {
    canonical: "https://www.bizmapai.com/",
  },
  openGraph: {
    title,
    description,
    url: "https://www.bizmapai.com/",
    siteName: "BizMap",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "BizMap — ייעול העסק עם AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImageUrl],
  },
};

export default async function Home() {
  return <LandingPage />;
}
