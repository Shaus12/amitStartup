import type { Metadata } from "next";
import { AiLevelQuiz } from "./AiLevelQuiz";

const title = "מבחן רמת AI לעסק — כמה מתקדם העסק שלך? | BizMap";
const description =
  "מבחן רמת AI חינם לעסק: ענה על 8 שאלות קצרות וגלה באיזו מ-6 הרמות אתה נמצא — ומה מפריד אותך מהרמה הבאה.";
const canonicalUrl = "https://www.bizmapai.com/ai-level";
const ogImageUrl = "https://www.bizmapai.com/og-ai-level.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bizmapai.com"),
  title,
  description,
  keywords: [
    "מבחן AI",
    "מבחן רמת AI",
    "רמת AI",
    "AI לעסקים",
    "אוטומציה לעסק",
    "בינה מלאכותית לעסק",
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
        alt: "מבחן רמת AI לעסק של BizMap",
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

export default function AiLevelPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "מבחן רמת AI לעסק",
    alternateName: "BizMap AI Level Quiz",
    url: canonicalUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "he-IL",
    isAccessibleForFree: true,
    description,
    provider: {
      "@type": "Organization",
      name: "BizMap",
      url: "https://www.bizmapai.com",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "ILS",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AiLevelQuiz />
    </>
  );
}
