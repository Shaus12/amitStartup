import type { Metadata } from "next";
import { AiLevelQuiz } from "./AiLevelQuiz";

const description =
  "מבחן רמת AI לעסק: ענה על 8 שאלות קצרות וגלה באיזו רמת AI העסק שלך נמצא, מה הרמה הבאה, ואיך לעלות אליה.";

export const metadata: Metadata = {
  metadataBase: new URL("https://bizmapai.com"),
  title: "מבחן רמת AI לעסק | כמה מתקדם העסק שלך?",
  description,
  openGraph: {
    title: "מבחן רמת AI לעסק | כמה מתקדם העסק שלך?",
    description,
    type: "website",
    images: [
      {
        url: "/onboarding.png",
        width: 2162,
        height: 1230,
        alt: "BizMap AI Level",
      },
    ],
  },
};

export default function AiLevelPage() {
  return <AiLevelQuiz />;
}
