import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "הדרכה בשידור חי: איך להפוך את העסק למכונה",
  description: "בתוך שעה תבינו מה הסיבה שהעסק שלכם תקוע, איפה בורח לכם הכסף, ואיך הופכים את העסק למכונה. שריינו את המקום שלכם עכשיו.",
  openGraph: {
    title: "הדרכה בשידור חי: איך להפוך את העסק למכונה",
    description: "בתוך שעה תבינו מה הסיבה שהעסק שלכם תקוע, איפה בורח לכם הכסף, ואיך הופכים את העסק למכונה. שריינו את המקום שלכם עכשיו.",
    type: "website",
    locale: "he_IL",
  },
  twitter: {
    card: "summary_large_image",
    title: "הדרכה בשידור חי: איך להפוך את העסק למכונה",
    description: "בתוך שעה תבינו מה הסיבה שהעסק שלכם תקוע, איפה בורח לכם הכסף, ואיך הופכים את העסק למכונה. שריינו את המקום שלכם עכשיו.",
  },
};

export default function WebinarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
