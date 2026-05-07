"use client";

import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, ChevronRight, Zap, Network,
  Brain, CheckCircle, Check, Activity, BarChart3, Globe,
} from "lucide-react";
import { CosmicParallaxBg } from "@/components/ui/parallax-cosmic-background";
import { useLanguage } from "@/lib/i18n";

/* ─── Framer Motion variants ────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/* ─── Typewriter hook ───────────────────────────────────────────────── */
function useTypewriter(text: string, speed = 22, startDelay = 700) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

/* ─── Count-up hook ─────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800, trigger: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, trigger]);
  return value;
}

/* ─── Design tokens ─────────────────────────────────────────────────── */
const C = {
  bg:     "#07090f",
  s0:     "#050710",
  s1:     "#0b0e1a",
  s2:     "#101422",
  s3:     "#171c2e",
  s4:     "#1f2438",
  outline:"#303858",
  muted:  "#5a6480",
  sub:    "#8e9ab8",
  text:   "#dde4f8",
  blue:   "#4f8bff",
  glow:   "#93c5fd",
  green:  "#10b981",
  amber:  "#f59e0b",
  red:    "#ef4444",
  purple: "#8b5cf6",
} as const;

const MF: React.CSSProperties = { fontFamily: "var(--font-manrope, system-ui)" };
const IF: React.CSSProperties = { fontFamily: "var(--font-inter, system-ui)" };

/* ─── Glass surface helper ──────────────────────────────────────────── */
const glassCard: React.CSSProperties = {
  backgroundColor: "rgba(11,14,26,0.82)",
  backdropFilter: "blur(20px) saturate(1.6)",
  WebkitBackdropFilter: "blur(20px) saturate(1.6)",
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 40px rgba(0,0,0,0.4)",
};

const glassCardHover = (color: string = C.blue): React.CSSProperties => ({
  border: `1px solid ${color}30`,
  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px ${color}15, 0 8px 40px rgba(0,0,0,0.5), 0 0 30px ${color}12`,
});

/* ─── Bilingual content ─────────────────────────────────────────────── */
type Lang = "he" | "en";

const CONTENT = {
  he: {
    dir: "rtl" as const,
    nav: {
      features: "תכונות", howItWorks: "איך זה עובד",
      pricing: "תמחור", signIn: "התחבר", cta: "התחל בחינם",
    },
    hero: {
      badge: "לבעלי עסקים שמרגישים מאחור במירוץ הבינה המלאכותית ורוצים לייצר יתרון ״לא חוקי״ במהפכה הזאת",
      h1: "איך בכמה דקות בודדות אפשר לדעת איפה העסק מדמם כסף ואיך AI יכול לחסוך עשרות אלפי שקלים בשנה הקרובה",
      sub: "בלי לשלם ליועץ יקר שלא מכיר את העסק שלך, בלי להיות מתכנת או לכתוב שורת קוד אחת, ובלי לשנות את מה שכבר עובד",
      cta: "קבל את המפה שלך בחינם",
      proof: ["15 דקות בלבד", "חוסך ~23 שעות/שבוע", "ללא כרטיס אשראי", "הנתונים שלך לא עוזבים את המחשב"],
    },
    socialProof: {
      title: "עסקים שכבר הצטרפו למהפכה",
      cards: [
        { name: "גלית כהן", role: "סטודיו לעיצוב גרפי, תל אביב", quote: "תוך 10 דקות הבנתי שאני מבזבזת 15 שעות בשבוע על דברים שAI יכול לעשות. השבוע כבר יישמתי את הצעד הראשון." },
        { name: "רון לוי", role: "חברת ייעוץ פיננסי, הרצליה", quote: "המפה הראתה לי בדיוק איפה הכסף נבלע. לא האמנתי שזה כל כך פשוט לראות את התמונה המלאה." },
        { name: "מיכל אברהם", role: "קליניקת פיזיותרפיה, רמת גן", quote: "סוף סוף יש לי יועץ שמכיר את העסק שלי ולא גובה 500 שקל לשעה. ARIA עונה לי בדיוק על מה שאני צריכה." },
      ]
    },
    problemPain: {
      title: "לכולם כבר נפל האסימון",
      body: "אחד כבר הקים אתר עם AI.\nהשני כבר החליף את מערכת ה-CRM שלו.\nועוד אחד כבר פיטר עובד, ושלא נדבר על החברות הגדולות שמפטרות עשרות אלפי אנשים.\n\nלדבר עם הצ'אט ולשלם 20 דולר על מנוי ולא למצות אותו,\nזה עדיין לא להיות חלק מהמהפכה.\n\nכי המהפכה האמיתית לא תלויה בכלים.\nהיא מתחילה כשמבינים בדיוק מה לשנות בעסק שלך ספציפית.\n\nלא בעסק כללי. לא בעסק של מישהו אחר.\nבעסק הזה, עם העובדים האלה, עם התהליכים האלה.\n\nוזה בדיוק מה שרוב בעלי העסקים עדיין לא עשו.\nהסיבה שזה לא קרה עדיין היא לא עצלות.\nזה לא פחד מטכנולוגיה.\nוזה בטח לא חוסר רצון.\nמי שמנהל עסק עם כמה עובדים או ספקים יודע טוב מאוד שמשהו צריך להשתנות.\n\nהבעיה היא שבמירוץ היום יום, אין את היכולת לקבל תמונה מלמעלה של העסק.\n\nכי מי שבתוך העסק לא יכול לראות איפה הכסף בורח.\nלא יכול לראות איזה עובד עושה עבודה שAI יכול לעשות פי עשר יותר טוב ומהר.\nלא יכול לראות איזה תהליך אחד קטן, אם ישתנה — יחסוך עשרות אלפי שקלים בשנה הקרובה.",
      failSubsections: [
        { title: "יועץ יכול לעזור בזה?", body: "יועץ מגיע, שואל שאלות, כותב מצגת. ובסוף נותן המלצות שמתאימות לכל עסק, בלי התאמה למי שמאחורי העסק, בלי התאמה לחדשנות ולכלים החדשים שיוצאים כל יום." },
        { title: "עובדים חדשים?", body: "עוד עובד אמור לפתור את הבעיה. אבל כדי לגייס עובד נדרשת הכשרה, ניהול שלו, בקרה שלו. ולקחת בחשבון שבחודשים הראשונים 20%-50% מהעבודה שלו נעשתה על ידך. כמובן שזה דורש גם עוד ניהול, עוד עלויות, עוד שריפות לכבות." },
        { title: "מערכות ואוטומציות?", body: "כלי אחרי כלי. אנשי אוטומציות שלוקח להם ימים ולילות לבצע שינויים קטנים. ובסוף אותו בלבול, רק עם יותר סיסמאות לזכור." }
      ],
      transition: "הבעיה לא הייתה הפתרונות.\nהבעיה הייתה שאף אחד לא התחיל מהעסק עצמו.\nכי לפני שיודעים מה לשנות — צריך לראות את העסק מלמעלה.\n\nלראות איפה הזמן הולך. איפה הכסף בורח. איפה עובד אחד עם AI יכול לעשות עבודה של שלושה.\nוזה בדיוק מה שיועצים וכלים לא עושים.\nהם מגיעים עם תשובה לפני שהבינו את השאלה.\nוזאת הסיבה שיצרנו את BizMap.\n\nכל עסק עם כמה עובדים או ספקים מכיל בתוכו לפחות 2-3 תהליכים שאפשר להפוך אותם לכפול עשר עם AI.\nלא בעזרת תקציב ענק.\nלא בעזרת ידע טכנולוגי.\nרק בעזרת הבנה מדויקת של איפה להתחיל."
    },
    clarity: {
      title: "יש הבדל אחד בין עסק שמרוויח יותר עם פחות עובדים לבין עסק שנשאר תקוע עם אותן בעיות.",
      body: "לא התקציב. לא הענף. ולא הניסיון.\nהבהירות.\n\nלדעת בדיוק איזה תהליך אחד — אם ישתנה עכשיו — יחסוך 20, 30, 50 אלף שקל בשנה הקרובה.\nולדעת איך לעשות את זה בלי לשבור את מה שכבר עובד.\n\nרוב בעלי העסקים לא מחפשים עוד כלי AI.\nהם מחפשים מישהו שיסתכל על העסק שלהם מלמעלה ויגיד: זה. זה המקום. מכאן מתחילים.\nאז הגיע הזמן להכיר את..."
    },
    hiw: {
      title: "תכירו את BizMap",
      subtitle: "המפה המלאה של העסק שלך — איפה הכסף בורח, איפה הזמן נבלע, ואיזה צעד אחד ישנה את התמונה ויראה לך בדיוק איך להפוך כל עובד לכפול עשר של עצמו.",
      btn: "התחל עכשיו",
      steps: [
        { title: "מיפוי ושאלות", body: "זה מתחיל בכמה שאלות פשוטות על העסק שלך. שאלות שעוזרות לנו להבין את העסק שלך, לאיפה הזמן הולך היום, מה כל אחד מהעובדים והספקים עושים, ואיפה מרגישים שמשהו תקוע. 5 דקות. ו-BizMap כבר מתחילה לעבוד." },
        { title: "רואים את העסק מלמעלה בפעם הראשונה", body: "זה הרגע שרוב בעלי העסקים אומרים ״וואו״. BizMap בונה מפה ויזואלית מלאה של העסק שלך — כל מחלקה, כל תהליך, כל מקום שכסף נכנס ויוצא. פעם ראשונה שרואים את כל התמונה במקום אחד. לא מתוך העסק — מעליו." },
        { title: "מוצאים את הדליפה הגדולה ביותר", body: "מכל מה שנמפה — BizMap מצביעה על הדליפה הגדולה ביותר בעסק. המקום שכסף יוצא ממנו כל יום — בלי שיודעים. סוגרים את החור הזה בלבד — וכבר חוסכים עשרות אלפי שקלים בשנה הקרובה. עם מספרים. עם הערכת חיסכון. עם צעד ראשון ברור." },
        { title: "בונים את מפת ה-AI של העסק שלך", body: "אחרי הצעד הראשון — BizMap לא עוצרת. היא בונה רשימה מלאה של כל ההזדמנויות בעסק שלך — כל מקום שבו AI יכול להיכנס, לחסוך זמן, ולהחזיר כסף. כל הזדמנות עם שם ברור, שעות חיסכון בשבוע, וכמה זה שווה בחודש. מפת פעולה. לא תיאוריה." },
        { title: "מחליפים את היועץ העסקי שלך (בלי לשלם 50,000₪)", body: "ואז מקבלים משהו שאף יועץ לא יכול לתת — צ'אט שכבר יודע הכל על העסק שלך. לא ChatGPT שמתחיל מאפס בכל שיחה. לא יועץ שצריך לשלם לו 500 שקל לשעה כדי להסביר לו מי אתה. יועץ שמכיר את התהליכים שלך, את האנשים שלך, את הצעדים שלך — ומאומן על ידע עסקי אמיתי של מאות עסקים. שואלים ומקבלים תשובה שמתאימה לעסק הזה בלבד." },
      ]
    },
    pricing: {
      title: "איפה תוכלו להיות בעוד כמה דקות?",
      boxes: [
        { title: "יועץ עסקי", price: "3,000–8,000₪ לחודש", note: "(עם התחייבות לחצי שנה קדימה)", points: ["ועדיין לא מובטח שהתשובות יהיו מספיק מדויקות לעסק הספציפי שלך"], red: true },
        { title: "BizMap", price: "חינם לחלוטין", note: "", points: ["בלי כרטיס אשראי. בלי התחייבות. בלי סיבה לא לנסות.", "5 דקות של שאלות — ותדע בדיוק איפה העסק שלך מדמם כסף."], primary: true, cta: "קבל את המפה שלך בחינם" }
      ]
    },
    whyBizMapWorks: {
      title: "למה BizMap עובדת כשכל השאר נכשל",
      body: "רוב הכלים והיועצים עושים את אותה טעות — הם מגיעים עם תשובה לפני שהבינו את השאלה.\n\nBizMap עובדת הפוך. קודם מבינים את העסק — ורק אחר כך נותנים המלצה.",
      comparison: [
        "כלי רגיל — מדבר לכולם. BizMap — מדברת רק לעסק הזה.",
        "יועץ רגיל — מתחיל מהמתודולוגיה שלו. BizMap — מתחילה מהנתונים שלך.",
        "ChatGPT רגיל — לא זוכר מי אתה מפגישה לפגישה. BizMap — מכירה את העסק שלך לעומק מהרגע הראשון."
      ]
    },
    noConsultant: {
      title: "מה שאף יועץ לא יגיד לך",
      body: "רוב הכלים והיועצים בשוק מרוויחים כשלא יודעים מה לעשות. ככל שמבולבלים יותר — הם עובדים יותר. ומרוויחים יותר.\n\nאנחנו בנינו את BizMap כי ראינו את זה קורה שוב ושוב. בעלי עסקים מוכשרים, עם עסקים טובים, שמשלמים אלפי שקלים על ייעוץ — ויוצאים עם תהליך יקר שלא מחזיר את ההשקעה.\n\nולכן BizMap מתחילה ממקום אחר לגמרי.\nלא מהמתודולוגיה שלנו — מהעסק שלך.\nלא ממה שעבד לאחרים — ממה שנכון לך ספציפית.\n\nכי עסק שלוקח את צוואר הבקבוק הכי גדול שלו ופותר ומייעל אותו — לא צריך עוד ייעוץ. הוא צריך להתחיל לבנות.\nוזה בדיוק מה שאנחנו רוצים לעזור לעשות.",
      cta: "התחל את המיפוי עכשיו — בחינם"
    },
    faq: {
      title: "הספקות שלך — והאמת מאחוריהם",
      items: [
        { q: "זה לא בדיוק כמו ChatGPT? למה שלא פשוט אשאל אותו?", a: "ChatGPT לא יודע כלום על העסק שלך. כל שיחה מתחילה מאפס, והתשובות מתאימות לעסק כללי — לא לעסק שלך ספציפית. BizMap מתחילה מהנתונים האמיתיים של העסק שלך — התהליכים, העובדים, הזמן, הכסף. ורק אז נותנת המלצה שמדויקת לך בלבד." },
        { q: "אין לי זמן למלא עוד שאלון.", a: "זה לוקח 5 דקות. לא יותר. והתשובה שמקבלים בסוף שווה עשרות אלפי שקלים בשנה. אם אין זמן ל-5 דקות שיכולות לשנות את העסק — זה בדיוק הסימן שצריך את BizMap." },
        { q: "כבר ניסיתי ייעוצים ומערכות — למה זה יהיה שונה?", a: "כי BizMap לא מתחילה מהמתודולוגיה שלה — היא מתחילה מהעסק שלך. יועצים מגיעים עם תשובה מוכנה לפני שהבינו את השאלה. BizMap קודם מבינה את העסק שלך — ורק אחר כך נותנת המלצה. זה ההבדל בין אבחנה אמיתית לבין ניחוש מושכל." },
        { q: "האם זה מתאים לתחום שלי ספציפית?", a: "BizMap למדה דאטה של אלפי עסקים ממאות תחומים שונים. לא משנה אם מדובר בשירותים, מסחר, בריאות, טכנולוגיה או כל תחום אחר — המערכת מזהה את הדפוסים הספציפיים לעסק שלך ונותנת המלצות שמתאימות לתחום שלך בלבד." },
        { q: "אני לא טכנולוגי — האם אני יכול להשתמש בזה?", a: "BizMap בנויה בדיוק בשביל מי שלא טכנולוגי. לא צריך לדעת לכתוב קוד, לא צריך להבין בAI, ולא צריך שום ידע מוקדם. רק עונים על שאלות על העסק — והמערכת עושה את כל השאר." },
        { q: "מה קורה עם המידע שאני מכניס?", a: "המידע שמוכנס ל-BizMap משמש אך ורק לבניית המפה של העסק שלך. הוא לא משותף לאף גורם חיצוני ולא נמכר לאף אחד. הפרטים האישיים לא נשארים אצלנו מעבר למה שנדרש לתפעול המערכת." },
        { q: "כמה זמן לוקח לראות תוצאות?", a: "המפה נבנית תוך דקות מרגע שמסיימים את השאלון. הצעד הראשון שBizMap מזהה — אפשר להתחיל ליישם עוד באותו יום. החיסכון בפועל תלוי בעסק ובמהירות היישום — אבל בעלי עסקים שמיישמים את הצעד הראשון מדווחים על שינוי שמורגש כבר בחודש הראשון." },
        { q: "האם זה באמת חינם? מה התפיסה?", a: "תהליך המיפוי חינמי לחלוטין. בלי כרטיס אשראי, בלי התחייבות, בלי הפתעות. המטרה שלנו היא שכל בעל עסק יראה את התמונה המלאה של העסק שלו — ויחליט בעצמו מה הצעד הבא." },
        { q: "מה אם המערכת לא תמצא כלום לשפר בעסק שלי?", a: "בעשרות שנות ניסיון עם מאות עסקים — לא נתקלנו בעסק אחד שאין בו לפחות 2-3 תהליכים שאפשר לייעל עם AI. אם BizMap לא מוצאת הזדמנות משמעותית — זה יהיה הפעם הראשונה. ובכל מקרה — לא עלה כלום לבדוק." },
        { q: "מה ההבדל בין BizMap ליועץ עסקי רגיל?", a: "יועץ מגיע עם מתודולוגיה קבועה ומחיר של 3,000-8,000₪ לחודש. BizMap מתחילה מהנתונים שלך, מכירה את העסק שלך לעומק — וחינמית לחלוטין. ההבדל הוא לא רק בכסף. זה ההבדל בין המלצה גנרית לבין הבנה מדויקת של העסק שלך ספציפית." },
      ]
    },
    finalCta: {
      title: "עסק שיודע איפה הכסף בורח — יכול לעצור את זה.",
      subtitle: "עסק שלא יודע — ממשיך לשלם על זה כל חודש.",
      body: "5 דקות של שאלות. מפה מלאה של העסק שלך. וצעד ראשון ברור שמתחיל לחסוך עשרות אלפי שקלים בשנה הקרובה.",
      btn: "התחל את המיפוי החינמי שלך",
      subtext: "בחינם. בלי התחייבות. בלי כרטיס אשראי.",
    },
    footer: {
      tag: "מרחב ה-AI שמבין את כל הפעילות העסקית שלך.",
      status: "כל המערכות פועלות",
      copy: "© 2026 BizMap. נבנה עם Claude AI. הנתונים שלך לא עוזבים את המחשב שלך.",
      cols: [
        { h: "מוצר",   links: ["מפת עסקים", "הזדמנויות AI", "ביקורת תהליכים", "ניתוח זמן"] },
        { h: "חברה",   links: ["אודות", "בלוג", "קריירה", "עיתונות"] },
        { h: "משאבים", links: ["תיעוד", "API", "שינויים", "סטטוס"] },
        { h: "משפטי",  links: ["פרטיות", "תנאים", "אבטחה", "עוגיות"] },
      ],
      privacy: "פרטיות", terms: "תנאים",
    },
    calc: {
      tag: "מחשבון הפסד",
      h2: "כמה העסק שלך מפסיד כל חודש?",
      sub: "הזז את הסליידרים כדי לגלות את העלות האמיתית של עבודה ידנית בעסק שלך",
      lossLabel: "ההפסד החודשי שלך",
      saveLabel: "BizMap יכולה לחסוך לך",
      yearLabel: "חיסכון שנתי",
      hrsLabel: "שעות שנחסכו בשבוע",
      s1Label: "שעות ידניות בשבוע",
      s2Label: "עלות שעה ממוצעת",
      s3Label: "מספר עובדים",
      cta: "הראה לי איך לחסוך את זה",
      disclaimer: "מבוסס על חיסכון ממוצע של 70% בעבודה ידנית לאחר יישום AI",
    },
    marquee: "נבנה עבור בעלי עסקים ב:",
    companies: [
      "מסעדות וקייטרינג", "קליניקות ושירותים", "קמעונאות ואי-קומרס",
      "משרדי עורכי דין", "חשבונאות ופיננסים", "סוכנויות דיגיטל",
      "לוגיסטיקה ושילוח", "נדל״ן", "בנייה וקבלנות",
      "חינוך והדרכה", "מרפאות ובריאות", "ניהול נכסים",
    ],
  },
  en: {
    dir: "ltr" as const,
    nav: {
      features: "Features", howItWorks: "How it works",
      pricing: "Pricing", signIn: "Sign in", cta: "Get BizMap free",
    },
    hero: {
      badge: "Join 500+ businesses already saving 23h/week",
      h1: "You started a business to be free.",
      sub: "BizMap maps your entire operation in 15 minutes and shows you exactly which AI agents will recover your time — and your money. No consultants. No guesswork.",
      cta: "Show me where my time is going",
      proof: ["Takes just 15 minutes", "Saves ~23 hours/week on average", "No credit card required", "Your data never leaves your device"],
    },
    socialProof: {
      title: "Businesses that joined the revolution",
      cards: [
        { name: "Galit Cohen", role: "Graphic Design Studio, Tel Aviv", quote: "Within 10 minutes I realized I was wasting 15 hours a week on things AI can do. This week I already implemented the first step." },
        { name: "Ron Levi", role: "Financial Consulting Firm, Herzliya", quote: "The map showed me exactly where the money was being swallowed. I couldn't believe it was so simple to see the full picture." },
        { name: "Michal Avraham", role: "Physiotherapy Clinic, Ramat Gan", quote: "Finally I have a consultant who knows my business and doesn't charge 500 NIS per hour. ARIA answers exactly what I need." },
      ]
    },
    problemPain: {
      title: "Everyone finally got it",
      body: "One already built a site with AI. Another already replaced his CRM system. And another one already fired an employee.\n\nTalking to the chat and paying $20 for a subscription and not exhausting it — that's still not being part of the revolution.\n\nBecause the real revolution doesn't depend on tools. It starts when you understand exactly what to change in your business specifically.\n\nNot in a general business. Not in someone else's business. In this business, with these employees, with these processes.",
      failSubsections: [],
      transition: ""
    },
    clarity: {
      title: "There is one difference...",
      body: "Not budget. Not industry..."
    },
    hiw: {
      title: "Meet BizMap",
      subtitle: "The full map of your business...",
      btn: "Start now",
      steps: []
    },
    pricing: {
      title: "Where could you be?",
      boxes: []
    },
    whyBizMapWorks: {
      title: "Why BizMap works",
      body: "Most tools and consultants...",
      comparison: []
    },
    noConsultant: {
      title: "What no consultant will tell you",
      body: "Most tools and consultants...",
      cta: "Start now"
    },
    faq: {
      title: "Your doubts",
      items: []
    },
    finalCta: {
      title: "A business that knows...",
      subtitle: "5 minutes...",
      body: "...",
      btn: "Start",
      subtext: "Free"
    },
    footer: {
      tag: "The AI workspace that understands your entire business operation.",
      status: "All systems operational",
      copy: "© 2026 BizMap. Built with Claude AI. Local-first — your data never leaves your machine.",
      cols: [
        { h: "Product",   links: ["Business Map", "AI Opportunities", "Process Audit", "Time Analysis"] },
        { h: "Company",   links: ["About", "Blog", "Careers", "Press"] },
        { h: "Resources", links: ["Documentation", "API", "Changelog", "Status"] },
        { h: "Legal",     links: ["Privacy", "Terms", "Security", "Cookies"] },
      ],
      privacy: "Privacy", terms: "Terms",
    },
    marquee: "Built for business owners in:",
    companies: [
      "Restaurants & Catering", "Service Clinics", "Retail & E-commerce",
      "Law Firms", "Accounting & Finance", "Digital Agencies",
      "Logistics & Delivery", "Real Estate", "Construction & Contracting",
      "Education & Training", "Healthcare Practices", "Property Management",
    ],
  },
} as const;


type Content = typeof CONTENT.he;

/* ─── Language context ───────────────────────────────────────────────── */
const LangCtx = createContext<{ t: Content; lang: Lang; setLang: (l: Lang) => void }>({
  t: CONTENT.he, lang: "he", setLang: () => {},
});
function useLang() { return useContext(LangCtx); }

/* ─── Scroll reveal ─────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("bv-visible"); io.unobserve(e.target); }
      }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".bv-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─── Shared logo ───────────────────────────────────────────────────── */
function BizLogo({ size = 14 }: { size?: number }) {
  return (
    <img src="/logo.png" alt="BizMap" style={{ width: size * 1.5, height: size * 1.5, objectFit: "contain" }} />
  );
}

/* ─── Mockup Placeholder ───────────────────────────────────────────── */
function MockupPlaceholder() {
  return (
    <div
      className="rounded-2xl border-2 border-dashed flex items-center justify-center p-12 text-sm font-medium text-center"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        borderColor: "rgba(255,255,255,0.1)",
        color: C.muted,
        ...IF,
        minHeight: 240,
      }}
    >
      תמונת מוקאפ — יש להוסיף בהמשך
    </div>
  );
}

/* ─── Ambient orb ───────────────────────────────────────────────────── */
function Orb({ color, x, y, size = 600, opacity = 0.12 }: {
  color: string; x: string; y: string; size?: number; opacity?: number;
}) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: x, top: y,
        width: size, height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity,
        transform: "translate(-50%, -50%)",
        filter: "blur(1px)",
      }}
    />
  );
}

/* ─── Nav ───────────────────────────────────────────────────────────── */
function Nav() {
  const { t, lang, setLang } = useLang();
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "rgba(7,9,15,0.80)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 1px 0 rgba(79,139,255,0.06)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-14 flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${C.blue}cc, ${C.purple}80)`, boxShadow: `0 0 12px ${C.blue}30` }}
          >
            <BizLogo size={10} />
          </div>
          <span className="text-sm font-bold tracking-tight" style={{ ...MF, color: C.text }}>BizMap</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {[t.nav.features, t.nav.howItWorks, t.nav.pricing].map((l) => (
            <span
              key={l}
              className="text-xs font-medium cursor-pointer transition-colors duration-200"
              style={{ ...IF, color: C.muted }}
              onMouseEnter={e => (e.currentTarget.style.color = C.sub)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >{l}</span>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "he" ? "en" : "he")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
            style={{ ...IF, color: C.sub, backgroundColor: `${C.blue}0f`, border: `1px solid ${C.blue}22` }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${C.blue}1a`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${C.blue}0f`; }}
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5" style={{ color: C.blue }} />
            {lang === "he" ? "EN" : "עב"}
          </button>

          <Link
            href="/login"
            className="hidden sm:block text-xs font-medium transition-colors duration-200"
            style={{ ...IF, color: C.muted }}
            onMouseEnter={e => (e.currentTarget.style.color = C.sub)}
            onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
          >{t.nav.signIn}</Link>

          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-[0.97]"
            style={{
              ...IF,
              background: `linear-gradient(135deg, ${C.blue}, ${C.purple}80)`,
              color: "#fff",
              boxShadow: `0 0 0 1px ${C.blue}30, 0 4px 16px ${C.blue}20`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${C.blue}50, 0 4px 24px ${C.blue}40, 0 0 40px ${C.blue}20`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${C.blue}30, 0 4px 16px ${C.blue}20`;
            }}
          >
            {t.nav.cta}
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────────── */
function Hero() {
  const { t } = useLang();
  return (
    <section
      className="min-h-[100dvh] flex flex-col items-center justify-center pt-24 pb-0 px-6 relative overflow-hidden"
      style={{ backgroundColor: C.bg }}
    >
      <CosmicParallaxBg loop={true} />

      {/* Ambient glows */}
      <Orb color={C.blue} x="20%" y="30%" size={700} opacity={0.09} />
      <Orb color={C.purple} x="80%" y="20%" size={500} opacity={0.07} />
      <Orb color={C.blue} x="50%" y="70%" size={600} opacity={0.05} />

      <motion.div
        className="relative z-10 text-center max-w-[900px] mx-auto"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="mb-8 flex justify-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold text-center"
            style={{
              ...IF,
              backgroundColor: `rgba(79,139,255,0.08)`,
              border: `1px solid rgba(79,139,255,0.2)`,
              color: C.glow,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: `0 0 20px rgba(79,139,255,0.1), inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              backgroundColor: C.blue,
              animation: "bv-pulse-dot 2s ease-in-out infinite",
              display: "inline-block",
              boxShadow: `0 0 6px ${C.blue}`,
            }} />
            {t.hero.badge}
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="text-[2.5rem] md:text-[4rem] lg:text-[4.5rem] font-extrabold leading-[1.1] tracking-[-0.04em] mb-6"
          style={{ ...MF, color: C.text }}
        >
          {t.hero.h1}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-base md:text-lg leading-relaxed mb-10 mx-auto"
          style={{ ...IF, color: C.muted, maxWidth: "52ch" }}
        >
          {t.hero.sub}
        </motion.p>

        {/* CTA */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-sm font-bold transition-all duration-250 active:scale-[0.97] w-full sm:w-auto justify-center"
            style={{
              ...IF,
              background: `linear-gradient(135deg, ${C.blue}, ${C.purple}90)`,
              color: "#fff",
              boxShadow: `0 0 0 1px ${C.blue}40, 0 6px 24px ${C.blue}30`,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.boxShadow = `0 0 0 1px ${C.blue}60, 0 8px 40px ${C.blue}50, 0 0 60px ${C.blue}20`;
              el.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.boxShadow = `0 0 0 1px ${C.blue}40, 0 6px 24px ${C.blue}30`;
              el.style.transform = "translateY(0)";
            }}
          >
            {t.hero.cta}
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 flex-wrap">
          {t.hero.proof.map((text) => (
            <div key={text} className="flex items-center gap-1.5 text-xs" style={{ ...IF, color: C.muted }}>
              <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: C.green }} strokeWidth={2.5} />
              {text}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Product mockup */}
      <motion.div
        className="relative z-10 mt-16 w-full max-w-[1180px] mx-auto hidden sm:block"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        <HeroBrowserMockup />
        <div
          className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent, ${C.bg})` }}
        />
      </motion.div>
    </section>
  );
}

/* ─── Browser mockup ─────────────────────────────────────────────────── */
function HeroBrowserMockup() {
  const DEPTS = [
    { id: "mkt", x: 60,  y: 60,  name: "Marketing",       color: C.blue,   status: "Healthy", hrs: 22, procs: 4 },
    { id: "sal", x: 420, y: 40,  name: "Sales",            color: C.green,  status: "At Risk", hrs: 30, procs: 5 },
    { id: "ops", x: 240, y: 200, name: "Operations",       color: C.amber,  status: "Review",  hrs: 38, procs: 7 },
    { id: "fin", x: 620, y: 170, name: "Finance",          color: C.purple, status: "Healthy", hrs: 14, procs: 3 },
    { id: "cs",  x: 80,  y: 240, name: "Customer Success", color: C.glow,   status: "Review",  hrs: 25, procs: 4 },
  ];
  const EDGES = [["mkt","sal"], ["mkt","ops"], ["sal","ops"], ["ops","fin"], ["sal","fin"], ["ops","cs"]];
  const center = (id: string) => {
    const d = DEPTS.find(d => d.id === id)!;
    return { cx: d.x + 130, cy: d.y + 50 };
  };

  return (
    <div
      className="rounded-2xl overflow-hidden select-none"
      style={{
        ...glassCard,
        boxShadow: `0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06), 0 0 80px rgba(79,139,255,0.08)`,
        transform: "perspective(1400px) rotateX(4deg)",
        transformOrigin: "50% 0%",
      }}
    >
      {/* Chrome bar */}
      <div
        className="flex items-center gap-3 px-4 h-10 shrink-0"
        style={{ backgroundColor: "rgba(16,20,34,0.9)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex gap-1.5">
          {[C.red, C.amber, C.green].map((col, i) => (
            <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: col, opacity: 0.7 }} />
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div
            className="flex items-center gap-2 rounded px-3 py-1 text-[11px] w-48"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", color: C.muted, ...IF, border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.green, boxShadow: `0 0 4px ${C.green}` }} />
            bizview.app/dashboard
          </div>
        </div>
      </div>

      {/* App shell */}
      <div className="flex" style={{ minHeight: 420 }}>
        {/* Sidebar */}
        <div
          className="w-40 shrink-0 flex flex-col py-3 px-2"
          style={{ backgroundColor: "rgba(8,10,18,0.95)", borderRight: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-2 px-2 mb-5">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${C.blue}cc, ${C.purple}80)` }}
            >
              <BizLogo size={7} />
            </div>
            <span className="text-[11px] font-bold" style={{ ...MF, color: C.text }}>BizMap</span>
          </div>
          <div className="text-[8px] font-bold tracking-widest uppercase px-2 mb-2" style={{ ...IF, color: C.s4 }}>Workspace</div>
          {[{ label: "Business Map", active: true }, { label: "AI Opportunities", active: false }].map(({ label, active }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-[10px] font-medium mb-0.5"
              style={{
                backgroundColor: active ? `${C.blue}15` : "transparent",
                color: active ? C.glow : C.muted,
                border: active ? `1px solid ${C.blue}20` : "1px solid transparent",
                ...IF,
              }}
            >
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: active ? C.blue : C.s4 }} />
              {label}
            </div>
          ))}
          <div className="flex-1" />
          <div className="mx-1 p-2 rounded-lg" style={{ backgroundColor: `rgba(79,139,255,0.06)`, border: `1px solid ${C.blue}15` }}>
            <div className="text-[9px] font-bold mb-1" style={{ ...IF, color: C.blue }}>AI Analysis</div>
            <div className="text-[8px] leading-snug" style={{ ...IF, color: C.muted }}>8 opportunities found</div>
            <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ backgroundColor: C.s3 }}>
              <div className="h-full rounded-full" style={{ width: "67%", background: `linear-gradient(90deg, ${C.blue}, ${C.glow})` }} />
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div
          className="flex-1 relative overflow-hidden"
          style={{
            backgroundColor: C.bg,
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 z-10"
            style={{ backgroundColor: "rgba(7,9,15,0.90)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold" style={{ ...MF, color: C.sub }}>Meridian Consulting Group</span>
              <span className="text-[8px]" style={{ color: C.outline }}>·</span>
              <span className="text-[9px]" style={{ ...IF, color: C.muted }}>5 departments · 23 processes</span>
            </div>
            <div
              className="flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: C.muted, ...IF }}
            >
              <Zap className="w-2.5 h-2.5" style={{ color: C.glow }} />
              Refresh AI Analysis
            </div>
          </div>
          <div className="absolute inset-0 pt-9">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
              {EDGES.map(([from, to]) => {
                const a = center(from), b = center(to);
                const mx = (a.cx + b.cx) / 2, my = (a.cy + b.cy) / 2;
                return (
                  <path
                    key={`${from}-${to}`}
                    d={`M${a.cx},${a.cy} Q${mx},${my - 20} ${b.cx},${b.cy}`}
                    fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="4 4"
                  />
                );
              })}
            </svg>
            {DEPTS.map((dept) => {
              const statusColor = dept.status === "Healthy" ? C.green : dept.status === "At Risk" ? C.red : C.amber;
              return (
                <div
                  key={dept.id}
                  className="absolute rounded-xl overflow-hidden"
                  style={{
                    left: dept.x, top: dept.y + 8, width: 180,
                    backgroundColor: "rgba(16,20,34,0.9)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  }}
                >
                  <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${dept.color}, ${dept.color}50)` }} />
                  <div className="px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dept.color, boxShadow: `0 0 4px ${dept.color}` }} />
                        <span className="text-[10px] font-bold" style={{ ...MF, color: C.text }}>{dept.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: statusColor }} />
                        <span className="text-[8px] font-semibold" style={{ color: statusColor, ...IF }}>{dept.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[8px]" style={{ color: C.muted, ...IF }}>
                      <span>{dept.hrs}h/wk</span>
                      <span>·</span>
                      <span>{dept.procs} processes</span>
                    </div>
                    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full" style={{
                        width: `${[55, 72, 40, 63, 48][DEPTS.indexOf(dept)]}%`,
                        background: `linear-gradient(90deg, ${dept.color}cc, ${dept.color}60)`,
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}



/* ─── Testimonials ──────────────────────────────────────────────────── */
/* ─── Social Proof Bar ──────────────────────────────────────────────── */
function SocialProofBar() {
  const { t } = useLang();
  const s = t.socialProof;
  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: C.bg }}>
      <Orb color={C.blue} x="80%" y="50%" size={500} opacity={0.06} />
      <div className="max-w-[1100px] mx-auto relative">
        <div className="text-center mb-14 bv-reveal">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ ...MF, color: C.text }}>{s.title}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {s.cards.map((card, i) => (
            <div
              key={card.name}
              className={`rounded-2xl p-7 bv-reveal bv-reveal-d${i + 1} transition-all duration-300`}
              style={{ ...glassCard }}
              onMouseEnter={e => {
                Object.assign((e.currentTarget as HTMLElement).style, glassCardHover(C.blue));
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                Object.assign((e.currentTarget as HTMLElement).style, glassCard);
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <span key={si} style={{ color: C.amber, fontSize: 13, filter: `drop-shadow(0 0 4px ${C.amber}60)` }}>★</span>
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{ ...IF, color: C.muted }}>"{card.quote}"</p>
              <div className="pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-sm font-bold" style={{ ...MF, color: C.text }}>{card.name}</p>
                <p className="text-xs mt-1" style={{ ...IF, color: C.muted }}>{card.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Problem/Pain Section ──────────────────────────────────────────── */
function ProblemPainSection() {
  const { t } = useLang();
  const p = t.problemPain;
  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: C.s0 }}>
      <Orb color={C.blue} x="50%" y="50%" size={700} opacity={0.05} />
      <div className="max-w-[800px] mx-auto relative">
        <div className="text-center mb-14 bv-reveal">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight" style={{ ...MF, color: C.text }}>{p.title}</h2>
        </div>
        <div className="rounded-3xl p-8 md:p-12 bv-reveal mb-16" style={{ ...glassCard }}>
          <p className="text-base md:text-lg leading-relaxed whitespace-pre-line" style={{ ...IF, color: C.muted }}>
            {p.body}
          </p>
        </div>

        {/* Why Existing Solutions Fail */}
        <div className="grid gap-6 mb-16">
          {p.failSubsections?.map((sub, i) => (
            <div
              key={i}
              className={`rounded-2xl p-8 bv-reveal bv-reveal-d${i + 1}`}
              style={{ ...glassCard, borderLeft: `4px solid ${C.red}80` }}
            >
              <h3 className="text-xl font-bold mb-3" style={{ ...MF, color: C.text }}>{sub.title}</h3>
              <p className="text-base leading-relaxed" style={{ ...IF, color: C.muted }}>{sub.body}</p>
            </div>
          ))}
        </div>

        {/* Transition Text */}
        <div className="rounded-3xl p-8 md:p-12 bv-reveal border-2 border-dashed" style={{ borderColor: `${C.blue}20`, backgroundColor: "rgba(79,139,255,0.02)" }}>
           <p className="text-base md:text-lg leading-relaxed whitespace-pre-line text-center" style={{ ...IF, color: C.sub }}>
            {p.transition}
          </p>
        </div>
      </div>
    </section>
  );
}

function ClaritySection() {
  const { t } = useLang();
  const c = t.clarity;
  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: C.bg }}>
      <Orb color={C.purple} x="100%" y="50%" size={500} opacity={0.05} />
      <div className="max-w-[800px] mx-auto relative text-center">
        <div className="bv-reveal mb-10">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-8 leading-tight" style={{ ...MF, color: C.text }}>{c.title}</h2>
          <p className="text-base md:text-lg leading-relaxed whitespace-pre-line" style={{ ...IF, color: C.muted }}>
            {c.body}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Comparison Section ───────────────────────────────────────────── */
function WhyBizMapWorks() {
  const { t } = useLang();
  const w = t.whyBizMapWorks;
  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: C.bg }}>
      <Orb color={C.blue} x="0%" y="50%" size={500} opacity={0.05} />
      <div className="max-w-[800px] mx-auto relative">
        <div className="text-center mb-14 bv-reveal">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight" style={{ ...MF, color: C.text }}>{w.title}</h2>
          <p className="text-base md:text-lg leading-relaxed whitespace-pre-line" style={{ ...IF, color: C.muted }}>{w.body}</p>
        </div>
        <div className="grid gap-4 bv-reveal">
          {w.comparison.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 flex items-center gap-4"
              style={{ ...glassCard }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${C.blue}15`, border: `1px solid ${C.blue}30` }}>
                <Check className="w-3.5 h-3.5" style={{ color: C.blue }} />
              </div>
              <p className="text-sm md:text-base font-medium" style={{ ...IF, color: C.text }}>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}




/* ─── Feature: How it works ─────────────────────────────────────────── */
/* ─── Feature: How it works ─────────────────────────────────────────── */
function FeatureHowItWorks() {
  const { t } = useLang();
  const f = t.hiw;
  return (
    <section className="py-28 relative overflow-hidden" style={{ backgroundColor: C.s0 }}>
      <Orb color={C.green} x="90%" y="50%" size={500} opacity={0.05} />
      <div className="max-w-[1200px] mx-auto px-6 relative">
        <div className="text-center mb-16 bv-reveal">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5" style={{ ...MF, color: C.text }}>{f.title}</h2>
          <p className="text-base text-center max-w-2xl mx-auto" style={{ ...IF, color: C.muted }}>{f.subtitle}</p>
        </div>

        <div className="space-y-24">
          {f.steps.map((step, i) => {
            const imgs = ["/onboarding.png", "/map.png", "/opportunity.png", "/analysis.png", "/chat.png"];
            return (
              <div
                key={i}
                className={`grid md:grid-cols-2 gap-12 items-center bv-reveal bv-reveal-d${i + 1}`}
              >
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl font-extrabold" style={{ ...MF, color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}>0{i+1}</span>
                    <h3 className="text-2xl font-bold" style={{ ...MF, color: C.text }}>{step.title}</h3>
                  </div>
                  <p className="text-base leading-relaxed" style={{ ...IF, color: C.muted }}>{step.body}</p>
                </div>
                <div className={i % 2 === 1 ? "md:order-1" : ""}>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <img 
                      src={imgs[i]} 
                      alt={step.title}
                      className="relative rounded-2xl border border-white/10 shadow-2xl w-full h-auto object-cover"
                      style={{ ...glassCard }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-20 text-center">
           <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold transition-all duration-200"
              style={{
                ...IF,
                background: `linear-gradient(135deg, ${C.blue}, ${C.purple}90)`,
                color: "#fff",
                boxShadow: `0 4px 20px ${C.blue}30`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 30px ${C.blue}50`;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${C.blue}30`;
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {f.btn} <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
      </div>
    </section>
  );
}


/* ─── Animated stat cell ─────────────────────────────────────────────── */
function StatCell({ val, lbl, sub, index }: { val: string; lbl: string; sub: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTriggered(true); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const match = val.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  const prefix = match?.[1] ?? "";
  const numStr = match?.[2] ?? "";
  const suffix = match?.[3] ?? "";
  const target = parseFloat(numStr) || 0;
  const isFloat = numStr.includes(".");
  const counted = useCountUp(target, 1600, triggered);
  const displayed = target > 0 ? `${prefix}${isFloat ? counted.toFixed(1) : counted}${suffix}` : val;

  return (
    <div
      ref={ref}
      className="px-6 py-10 transition-all duration-500 relative"
      style={{
        borderRight: index < 3 ? "1px solid rgba(255,255,255,0.05)" : "none",
        opacity: triggered ? 1 : 0,
        transform: triggered ? "translateY(0)" : "translateY(16px)",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <p
        className="text-4xl font-extrabold mb-2 tabular-nums"
        style={{
          ...MF,
          letterSpacing: "-0.04em",
          background: `linear-gradient(135deg, ${C.text} 0%, ${C.glow} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: `drop-shadow(0 0 20px ${C.blue}30)`,
        }}
      >
        {displayed}
      </p>
      <p className="text-xs font-semibold mb-1" style={{ ...IF, color: C.sub }}>{lbl}</p>
      <p className="text-[11px] leading-snug" style={{ ...IF, color: C.muted }}>{sub}</p>
    </div>
  );
}



/* ─── Price anchor ──────────────────────────────────────────────────── */
/* ─── Pricing Section ────────────────────────────────────────────────── */
function PricingSection() {
  const { t } = useLang();
  const p = t.pricing;
  return (
    <section className="py-28 px-6 relative overflow-hidden" style={{ backgroundColor: C.s0 }}>
      <div className="max-w-[900px] mx-auto relative">
        <div className="text-center mb-16 bv-reveal">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4" style={{ ...MF, color: C.text }}>{p.title}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {p.boxes.map((box, i) => (
            <div
              key={i}
              className="rounded-3xl p-10 flex flex-col h-full bv-reveal transition-all duration-300"
              style={{
                ...glassCard,
                ...(box.primary ? { border: `1px solid ${C.blue}40`, boxShadow: `0 20px 50px ${C.blue}15` } : {})
              }}
            >
              <h3 className="text-xl font-bold mb-2" style={{ ...MF, color: box.red ? C.red : C.text }}>{box.title}</h3>
              <div className="mb-4">
                <span className="text-3xl font-extrabold" style={{ ...MF, color: C.text, ...(box.red ? { textDecoration: "line-through", opacity: 0.5 } : {}) }}>{box.price}</span>
              </div>
              {box.note && (
                 <p className="text-xs mb-6" style={{ ...IF, color: C.muted }}>{box.note}</p>
              )}
              <ul className="space-y-4 mb-10 flex-1">
                {box.points.map((point, pi) => (
                  <li key={pi} className="flex items-start gap-3 text-sm" style={{ ...IF, color: C.muted }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: box.red ? C.red : C.green }} />
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                href="/onboarding"
                className="w-full py-4 rounded-xl text-center font-bold text-sm transition-all duration-200"
                style={{
                  background: box.primary ? `linear-gradient(135deg, ${C.blue}, ${C.purple}90)` : "rgba(255,255,255,0.05)",
                  color: "#fff",
                  border: box.primary ? "none" : "1px solid rgba(255,255,255,0.1)"
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = box.primary ? `0 4px 30px ${C.blue}40` : "none";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                {box.cta || t.nav.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NoConsultantSection() {
  const { t } = useLang();
  const n = t.noConsultant;
  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: C.s0 }}>
      <div className="max-w-[800px] mx-auto relative text-center">
        <div className="bv-reveal mb-14">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-8 leading-tight" style={{ ...MF, color: C.text }}>{n.title}</h2>
          <p className="text-base md:text-lg leading-relaxed whitespace-pre-line text-right" style={{ ...IF, color: C.muted }}>
            {n.body}
          </p>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl text-base font-bold transition-all duration-200"
          style={{
            background: `linear-gradient(135deg, ${C.blue}, ${C.purple}90)`,
            color: "#fff",
            boxShadow: `0 8px 30px ${C.blue}30`,
            ...MF
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 50px ${C.blue}50`;
            (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${C.blue}30`;
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          {n.cta} <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}


/* ─── FAQ ─────────────────────────────────────────────────────────────── */
/* ─── FAQ Section ────────────────────────────────────────────────────── */
function FAQSection() {
  const { t } = useLang();
  const [open, setOpen] = useState<number | null>(null);
  const items = t.faq.items;
  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: C.bg }}>
      <div className="max-w-[720px] mx-auto">
        <div className="text-center mb-14 bv-reveal">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ ...MF, color: C.text }}>{t.faq.title}</h2>
        </div>
        <div className="flex flex-col gap-2 bv-reveal">
          {items.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden transition-all duration-200"
              style={{
                border: open === i ? `1px solid ${C.blue}35` : "1px solid rgba(255,255,255,0.06)",
                boxShadow: open === i ? `0 0 20px ${C.blue}10` : "none",
              }}
            >
              <button
                className="w-full text-right px-6 py-4 flex items-center justify-between gap-4"
                style={{
                  backgroundColor: open === i ? "rgba(16,20,34,0.9)" : "rgba(11,14,26,0.8)",
                  cursor: "pointer",
                }}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-semibold" style={{ ...MF, color: C.text }}>{faq.q}</span>
                <ChevronRight
                  className="w-4 h-4 shrink-0 transition-transform duration-200"
                  style={{ color: C.blue, transform: open === i ? "rotate(90deg)" : "rotate(0deg)" }}
                  strokeWidth={2.5}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 pt-1" style={{ backgroundColor: "rgba(16,20,34,0.7)" }}>
                  <p className="text-sm leading-relaxed" style={{ ...IF, color: C.muted }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─────────────────────────────────────────────────────── */
function FinalCTA() {
  const { t } = useLang();
  const f = t.finalCta;
  return (
    <section className="py-28 relative overflow-hidden" style={{ backgroundColor: C.s0 }}>
      <div className="max-w-[1000px] mx-auto px-6">
        <div
          className="rounded-3xl px-10 py-20 text-center relative overflow-hidden bv-reveal"
          style={{
            ...glassCard,
            boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
          }}
        >
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6" style={{ ...MF, color: C.text }}>{f.title}</h2>
          <p className="text-lg leading-relaxed mb-10 max-w-2xl mx-auto" style={{ ...IF, color: C.muted }}>{f.subtitle}</p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-sm font-bold transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, ${C.blue}, ${C.purple}90)`,
              color: "#fff",
              boxShadow: `0 8px 30px ${C.blue}35`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 50px ${C.blue}60`;
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${C.blue}35`;
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            {f.btn}
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
          <p className="mt-6 text-xs" style={{ ...IF, color: C.muted }}>{f.subtext}</p>
        </div>
      </div>
    </section>
  );
}


/* ─── Footer ─────────────────────────────────────────────────────────── */
function Footer() {
  const { t, lang } = useLang();
  const f = t.footer;
  return (
    <footer style={{ backgroundColor: C.bg, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10 mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${C.blue}cc, ${C.purple}80)`, boxShadow: `0 0 12px ${C.blue}25` }}
              >
                <BizLogo size={10} />
              </div>
              <span className="text-sm font-bold" style={{ ...MF, color: C.text }}>BizMap</span>
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ ...IF, color: C.muted, maxWidth: "26ch" }}>{f.tag}</p>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: C.green, boxShadow: `0 0 6px ${C.green}`, animation: "bv-pulse-dot 2s ease-in-out infinite" }}
                />
                <span className="text-[10px]" style={{ ...IF, color: C.muted }}>{f.status}</span>
              </div>
              <a
                href="mailto:support@bizmapai.com"
                className="text-xs font-semibold transition-colors duration-200"
                style={{ ...IF, color: C.blue }}
                onMouseEnter={e => (e.currentTarget.style.color = C.glow)}
                onMouseLeave={e => (e.currentTarget.style.color = C.blue)}
              >
                support@bizmapai.com
              </a>
            </div>
          </div>
          {f.cols.map((col) => (
            <div key={col.h}>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ ...IF, color: C.outline }}>{col.h}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <span
                      className="text-xs cursor-pointer transition-colors duration-200"
                      style={{ ...IF, color: C.muted }}
                      onMouseEnter={e => (e.currentTarget.style.color = C.sub)}
                      onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                    >{link}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <p className="text-[11px]" style={{ ...IF, color: C.outline }}>{f.copy}</p>
          <div className="flex items-center gap-4">
            {[f.privacy, f.terms].map((l) => (
              <span
                key={l}
                className="text-[11px] cursor-pointer transition-colors duration-200"
                style={{ ...IF, color: C.outline }}
                onMouseEnter={e => (e.currentTarget.style.color = C.muted)}
                onMouseLeave={e => (e.currentTarget.style.color = C.outline)}
              >{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Sticky mobile CTA ──────────────────────────────────────────────── */
function StickyMobileCTA() {
  const { lang } = useLang();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden px-4 pb-4 pt-3 transition-transform duration-300"
      style={{
        backgroundColor: "rgba(7,9,15,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        transform: visible ? "translateY(0)" : "translateY(110%)",
      }}
    >
      <Link
        href="/onboarding"
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold"
        style={{
          background: `linear-gradient(135deg, ${C.blue}, ${C.purple}90)`,
          color: "#fff",
          boxShadow: `0 4px 20px ${C.blue}30`,
        }}
      >
        {lang === "he" ? "הראה לי לאן הזמן שלי הולך" : "Show me where my time is going"}
        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
      </Link>
    </div>
  );
}

/* ─── Root ──────────────────────────────────────────────────────────── */

/* ─── ROI Calculator Section ────────────────────────────────────────── */
function ROICalculator() {
  const { t, lang } = useLang();
  const c = t.calc;
  const isHe = lang === "he";

  const [hours, setHours] = useState(20);   // manual hours/week
  const [rate,  setRate]  = useState(80);   // hourly rate ₪ (or $)
  const [staff, setStaff] = useState(3);    // employees

  const monthlyWastedHours = hours * 4.3 * staff;
  const monthlyLoss        = Math.round(monthlyWastedHours * rate);
  const monthlySaving      = Math.round(monthlyLoss * 0.7);
  const annualSaving       = monthlySaving * 12;
  const weeklyHrsSaved     = Math.round(hours * staff * 0.7);

  const fmt = (n: number) =>
    n >= 10000
      ? isHe ? `₪${(n / 1000).toFixed(0)}K` : `₪${(n / 1000).toFixed(0)}K`
      : `₪${n.toLocaleString()}`;

  const sliders = [
    { label: c.s1Label, value: hours,  setter: setHours, min: 5,  max: 50,  step: 1,  unit: isHe ? "ש׳" : "h" },
    { label: c.s2Label, value: rate,   setter: setRate,  min: 30, max: 500, step: 10, unit: "₪" },
    { label: c.s3Label, value: staff,  setter: setStaff, min: 1,  max: 20,  step: 1,  unit: "" },
  ];

  return (
    <section className="py-28 px-6 relative overflow-hidden" style={{ backgroundColor: C.s0 }}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: `radial-gradient(ellipse, ${C.red}0a 0%, transparent 70%)` }} />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={stagger} className="text-center mb-14">
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: C.red }}>
            {c.tag}
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight" style={{ ...MF, color: C.text }}>
            {c.h2}
          </motion.h2>
          <motion.p variants={fadeUp} className="text-base max-w-xl mx-auto" style={{ color: C.sub }}>
            {c.sub}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          className="rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-10"
          style={{ ...glassCard }}
        >
          {/* Sliders */}
          <motion.div variants={fadeUp} className="space-y-8">
            {sliders.map(({ label, value, setter, min, max, step, unit }) => (
              <div key={label}>
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-sm font-semibold" style={{ color: C.sub }}>{label}</span>
                  <span className="text-xl font-extrabold" style={{ color: C.text, ...MF }}>
                    {unit === "₪" ? `₪${value}` : unit ? `${value} ${unit}` : value}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={min} max={max} step={step} value={value}
                    onChange={e => setter(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to ${lang === "he" ? "left" : "right"}, ${C.blue} 0%, ${C.blue} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.08) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.08) 100%)`,
                      accentColor: C.blue,
                    }}
                  />
                  <style>{`input[type=range]::-webkit-slider-thumb { width:20px; height:20px; border-radius:50%; background:${C.blue}; cursor:pointer; border:2px solid white; box-shadow:0 0 10px ${C.blue}66; -webkit-appearance:none; }`}</style>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px]" style={{ color: C.muted }}>{unit === "₪" ? `₪${min}` : min}</span>
                  <span className="text-[10px]" style={{ color: C.muted }}>{unit === "₪" ? `₪${max}` : max}{unit && unit !== "₪" ? ` ${unit}` : ""}</span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Results */}
          <motion.div variants={fadeUp} className="flex flex-col gap-5 justify-center">
            {/* Main loss */}
            <div className="rounded-2xl p-6 text-center" style={{ background: `${C.red}12`, border: `1px solid ${C.red}30` }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.red }}>{c.lossLabel}</p>
              <p className="text-4xl md:text-5xl font-extrabold" style={{ color: C.red, ...MF }}>
                {fmt(monthlyLoss)}
              </p>
            </div>

            {/* Savings */}
            <div className="rounded-2xl p-5 text-center" style={{ background: `${C.green}12`, border: `1px solid ${C.green}30` }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: C.green }}>{c.saveLabel}</p>
              <p className="text-3xl font-extrabold" style={{ color: C.green, ...MF }}>
                {fmt(monthlySaving)} / {isHe ? "חודש" : "mo"}
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: C.muted }}>{c.yearLabel}</p>
                <p className="text-xl font-extrabold" style={{ color: C.blue, ...MF }}>{fmt(annualSaving)}</p>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: C.muted }}>{c.hrsLabel}</p>
                <p className="text-xl font-extrabold" style={{ color: C.purple, ...MF }}>{weeklyHrsSaved}{isHe ? " ש׳" : "h"}</p>
              </div>
            </div>

            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`, color: "#fff", ...MF }}
              >
                {c.cta}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>

            <p className="text-center text-[11px]" style={{ color: C.muted }}>{c.disclaimer}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function LandingPage() {
  const { lang, setLang } = useLanguage();
  const landingLang = (lang === "en" ? "en" : "he") as Lang;
  useReveal();
  const t = CONTENT[landingLang];
  return (
    <LangCtx.Provider value={{ t: t as Content, lang: landingLang, setLang }}>
      <div dir={t.dir} style={{ backgroundColor: C.bg }}>
        <Nav />
        <Hero />
        <SocialProofBar />
        <ProblemPainSection />
        <ClaritySection />
        <FeatureHowItWorks />
        <PricingSection />
        <WhyBizMapWorks />
        <NoConsultantSection />
        <FAQSection />
        <FinalCTA />
        <Footer />
        <StickyMobileCTA />
      </div>
    </LangCtx.Provider>
  );
}
