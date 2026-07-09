import type { Metadata } from "next";
import { WorkshopPageClient } from "./WorkshopPageClient";

const title = "סדנת AI לעסקים - הפכו את העסק שלכם ליעיל עם AI | BizMap";
const description =
  "סדנת AI מעשית לבעלי עסקים: 4 מפגשי Zoom, ליווי בין המפגשים, ומסלול ברור מהיסודות לאוטומציות, סוכנים ומערכת AI שעובדת בשבילכם.";
const canonicalUrl = "https://www.bizmapai.com/workshop";
const ogImageUrl = "https://www.bizmapai.com/og-workshop.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bizmapai.com"),
  title,
  description,
  keywords: [
    "סדנת AI לעסקים",
    "AI לעסקים",
    "אוטומציה לעסק",
    "סוכני AI",
    "הטמעת AI",
    "ייעול עסק",
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title,
    description,
    url: canonicalUrl,
    siteName: "BizMap",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "סדנת AI לעסקים של BizMap",
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

export default function WorkshopPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "סדנת AI לעסקים",
    description,
    url: canonicalUrl,
    inLanguage: "he-IL",
    provider: {
      "@type": "Organization",
      name: "BizMap",
      url: "https://www.bizmapai.com",
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/LimitedAvailability",
      priceCurrency: "ILS",
      category: "Waitlist",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <WorkshopPageClient />
    </>
  );
}
