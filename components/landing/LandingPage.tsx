"use client";

import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, ChevronRight, Zap, Network,
  Brain, CheckCircle, Activity, BarChart3, Globe,
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
      badge: "מרבית בעלי עסקים מבזבזים 20+ שעות בשבוע בלי לדעת על מה",
      h1: "פתחת עסק כדי להיות חופשי.",
      h2: "אז למה אתה טובע בוואטסאפ, אקסל ושריפות?",
      sub: "BizMap ממפה את כל הפעילות שלך תוך 15 דקות ומראה לך בדיוק אילו סוכני AI יחזירו לך את הזמן — ואת הכסף. ללא יועצים. ללא ניחושים.",
      cta1: "הראה לי לאן הזמן שלי הולך",
      cta2: "ראה דוגמה אמיתית",
      proof: ["15 דקות בלבד", "חוסך ~23 שעות/שבוע", "ללא כרטיס אשראי", "הנתונים שלך לא עוזבים את המחשב"],
    },
    pain: {
      tag: "למה זה קורה",
      h2: "אתה לא לבד. זה קורה לכל בעל עסק.",
      avatars: [
        { icon: "🍕", type: "מסעדה / קייטרינג", problem: "מבזבז 3 שעות ביום על הזמנות ידניות, ניהול משמרות ומלאי שמתקלקל" },
        { icon: "💈", type: "שירות / קליניקה", problem: "45% מהזמן הולך על תיאומים, תזכורות ודוחות במקום על הלקוחות עצמם" },
        { icon: "🛒", type: "קמעונאות / מכירות", problem: "עוקב אחר מלאי, הזמנות וספקים ב-4 כלים שלא מדברים אחד עם השני" },
      ],
    },
    anchor: {
      tag: "השוואת ערך",
      h2: "יועץ עסקי גובה ₪3,000–₪8,000 לחודש.",
      sub: "מיפינו את כל העסק שלך. בחינם.",
      items: [
        { label: "יועץ עסקי", cost: "₪3,000–8,000/חודש", note: "לפגישות שבועיות ודוח", bad: true },
        { label: "BizMap", cost: "חינם", note: "מפה מלאה + תוכנית AI + המלצות ספציפיות", bad: false },
      ],
    },
    insight: {
      tag: "מה הנתונים מראים",
      stat: "23",
      statUnit: "שעות/שבוע",
      statLabel: "ממוצע הזמן שעסקי שירות מבזבזים על עבודה ידנית",
      body: "ניתחנו מאות עסקים. עסק שירות ממוצע מוציא 23 שעות בשבוע על משימות שסוכן AI יכול לבצע תוך דקות. זה 2.5 ימי עבודה שבועיים שנגנבים ממך.",
    },
    marquee: "בנוי לבעלי עסקים ב:",
    companies: [
      "מסעדות וקייטרינג", "קליניקות ורפואה", "קמעונאות ואיקומרס",
      "משרדי עורכי דין", "חשבונאות ופיננסים", "סוכנויות דיגיטל",
      "לוגיסטיקה ומשלוחים", "נדל\"ן", "בנייה וקבלנות",
      "חינוך והדרכה", "מרפאות ובריאות", "ניהול נכסים",
    ],
    featMap: {
      tag: "מפת עסקים",
      h2: "ראה כל פינה של\nהפעילות שלך.",
      body: "כל מחלקה. כל תהליך. כל זרימת עבודה — מוצגים כקנבס אינטראקטיבי, צבוע לפי בריאות, ניתן לסינון לפי עומס, ותמיד עדכני.",
      bullets: [
        "קנבס אינטראקטיבי עם גרירה ושחרור",
        "סטטוס בריאות לכל מחלקה",
        "פירוט שעות ועומס עבודה",
      ],
    },
    featAI: {
      tag: "הזדמנויות AI",
      h2: "לא עצות עמומות. בדיוק אילו סוכנים\nיחסכו לך ₪15,800 בחודש.",
      body: "סוכנים בשמם, שעות חסכה מוערכות, השפעה כספית חודשית ורמת מורכבות — מותאמים במיוחד לפעילות הספציפית שלך.",
      tHead: { title: "הזדמנויות AI", badge: "8 נמצאו", savLbl: "חיסכון חודשי משוער", sav: "₪15,800" },
      rows: [
        { agent: "סוכן מיון מיילים", dept: "שירות לקוחות", hrs: 8.5, sav: "₪4,640", cx: "נמוך",  color: C.green  },
        { agent: "מחולל דוחות",      dept: "כספים",        hrs: 5.0, sav: "₪2,730", cx: "בינוני", color: C.blue   },
        { agent: "AI דירוג לידים",   dept: "מכירות",       hrs: 7.0, sav: "₪3,820", cx: "בינוני", color: C.blue   },
        { agent: "בוט הזמנת מלאי",  dept: "תפעול",        hrs: 6.5, sav: "₪3,550", cx: "נמוך",  color: C.green  },
      ],
      foot: { show: "מציג 4 מתוך 8 הזדמנויות", all: "צפה בכולם" },
    },
    hiw: {
      tag: "איך זה עובד",
      h2: "מגיליון ריק\nלתוכנית פעולה AI.",
      body: "פחות מ-15 דקות מהשאלה הראשונה ועד למפת העסק המלאה והמלצות הסוכן שלך.",
      btn: "התחל עכשיו",
      steps: [
        { n: "01", title: "ענה על 18 שאלות מובנות", desc: "עבור דרך מחלקות, תהליכים, כלים, הקצאת זמן, נקודות כאב ויעדים. כמו ייעוץ עסקי ראשון — אבל מיידי." },
        { n: "02", title: "קבל את מפת העסק האינטראקטיבית שלך", desc: "קנבס ה-AI של כל הפעילות. כל מחלקה היא צומת. כל תהליך יושב בתוכה. סטטוס בריאות, זמן ועומס ידני — הכל גלוי." },
        { n: "03", title: "פרוס סוכני AI ספציפיים", desc: "סוכנים בשמם עם מדריכי יישום, שעות חסכה מוערכות, השפעה כספית ודירוגי מורכבות. מפת הדרכים שלך לפעילות מונעת AI." },
      ],
    },
    stats: [
      { val: "18",     lbl: "שאלות הכנסה",        sub: "מכסות כל היבט של העסק שלך" },
      { val: "~23ש'",  lbl: "שעות חסכה ממוצעות", sub: "לשבוע לאחר פריסת סוכן AI" },
      { val: "₪15.8K", lbl: "חיסכון חודשי נמצא", sub: "בממוצע לכל עסק שנותח" },
      { val: "< 15ד'", lbl: "זמן למפה שלך",       sub: "מהתשובה הראשונה לתוכנית AI מלאה" },
    ],
    cta: {
      tag: "מוכן?",
      h2a: "מפת העסק שלך",
      h2b: "מרחק 15 דקות.",
      body: "ללא חשבון. ללא הגדרה. ללא כרטיס אשראי.\nפשוט ענה על השאלות וצא עם תוכנית פעולה AI מלאה.",
      btn: "מפה את העסק שלי עכשיו",
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
      h2: "So why are you drowning in WhatsApp, spreadsheets, and fires?",
      sub: "BizMap maps your entire operation in 15 minutes and shows you exactly which AI agents will recover your time — and your money. No consultants. No guesswork.",
      cta1: "Show me where my time is going",
      cta2: "See a live example",
      proof: ["Takes just 15 minutes", "Saves ~23 hours/week on average", "No credit card required", "Your data never leaves your device"],
    },
    pain: {
      tag: "Why this happens",
      h2: "You're not alone. Every business owner faces this.",
      avatars: [
        { icon: "🍕", type: "Restaurant / Catering", problem: "Spends 3 hours a day on manual orders, shift management, and inventory that keeps spoiling" },
        { icon: "💈", type: "Service / Clinic", problem: "45% of working time goes to scheduling, reminders, and reports instead of serving clients" },
        { icon: "🛒", type: "Retail / Sales", problem: "Tracking inventory, orders, and suppliers across 4 tools that don't talk to each other" },
      ],
    },
    anchor: {
      tag: "Value comparison",
      h2: "Business consultants charge $800–$3,000/month.",
      sub: "We mapped your entire business. Free.",
      items: [
        { label: "Business consultant", cost: "$800–3,000/mo", note: "For weekly meetings and a report", bad: true },
        { label: "BizMap", cost: "Free", note: "Full map + AI plan + specific recommendations", bad: false },
      ],
    },
    insight: {
      tag: "What the data shows",
      stat: "23",
      statUnit: "hrs/week",
      statLabel: "Average time service businesses waste on manual work",
      body: "We've analyzed hundreds of businesses. The average service business spends 23 hours a week on tasks an AI agent can do in minutes. That's 2.5 workdays every week stolen from you.",
    },
    marquee: "Built for business owners in:",
    companies: [
      "Restaurants & Catering", "Service Clinics", "Retail & E-commerce",
      "Law Firms", "Accounting & Finance", "Digital Agencies",
      "Logistics & Delivery", "Real Estate", "Construction & Contracting",
      "Education & Training", "Healthcare Practices", "Property Management",
    ],
    featMap: {
      tag: "Business Map",
      h2: "See every corner of\nyour operation.",
      body: "Every department. Every process. Every workflow rendered as an interactive canvas — colour-coded by health, filterable by load, and always up to date.",
      bullets: [
        "Interactive drag-and-drop canvas",
        "Colour-coded health status per department",
        "Hours-per-week and workload breakdown",
      ],
    },
    featAI: {
      tag: "AI Opportunities",
      h2: "Not 'try AI.' Exactly which agents\nwill save you $4,230/month.",
      body: "Every recommendation is named, scoped, and scored — with hours saved, implementation difficulty, and exact monthly savings tailored to your specific operation.",
      tHead: { title: "AI Opportunities", badge: "8 found", savLbl: "Est. monthly savings", sav: "$4,230" },
      rows: [
        { agent: "Email Triage Agent",    dept: "Customer Success", hrs: 8.5, sav: "$1,240", cx: "Low",    color: C.green  },
        { agent: "Report Generator",      dept: "Finance",          hrs: 5.0, sav: "$730",   cx: "Medium", color: C.blue   },
        { agent: "Lead Scoring AI",       dept: "Sales",            hrs: 7.0, sav: "$1,020", cx: "Medium", color: C.blue   },
        { agent: "Inventory Reorder Bot", dept: "Operations",       hrs: 6.5, sav: "$950",   cx: "Low",    color: C.green  },
      ],
      foot: { show: "Showing 4 of 8 opportunities", all: "View all" },
    },
    hiw: {
      tag: "How it works",
      h2: "From blank slate to\nAI action plan.",
      body: "Under 15 minutes from first question to your full business map and AI agent recommendations.",
      btn: "Start now",
      steps: [
        { n: "01", title: "Answer 18 structured questions", desc: "Walk through departments, processes, tools, time allocation, pain points, and goals. Structured like a business consultant's first engagement — but instant." },
        { n: "02", title: "Get your interactive Business Map", desc: "An AI-rendered canvas of your entire operation. Every department is a node. Every process sits inside it. Health status, time spent, and manual load — all visible." },
        { n: "03", title: "Deploy specific AI agents", desc: "Named agents with implementation guides, estimated hours saved, cost impact, and complexity scores. Your custom roadmap to an AI-powered operation." },
      ],
    },
    stats: [
      { val: "18",    lbl: "Onboarding questions",  sub: "covering every facet of your business" },
      { val: "~23h",  lbl: "Average hours saved",   sub: "per week after AI agent deployment" },
      { val: "$4.2k", lbl: "Monthly savings found", sub: "on average per business analysed" },
      { val: "< 15m", lbl: "Time to your map",      sub: "from first answer to full AI plan" },
    ],
    cta: {
      tag: "Start today —",
      h2a: "See where you're losing $1,000s",
      h2b: "before your competitor does.",
      body: "500+ businesses have mapped their operations and deployed AI agents that actually work.\nTakes 15 minutes. No account required. Results guaranteed.",
      btn: "Get my free analysis",
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
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold"
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
          className="text-[3rem] md:text-[4.5rem] lg:text-[5.25rem] font-extrabold leading-[1.03] tracking-[-0.04em] mb-6"
          style={{ ...MF, color: C.text }}
        >
          {t.hero.h1}<br />
          <span style={{
            background: `linear-gradient(110deg, ${C.blue} 0%, ${C.glow} 40%, #e8f4ff 55%, ${C.glow} 70%, ${C.blue} 100%)`,
            backgroundSize: "250% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "bv-shimmer-sweep 4s linear infinite",
          }}>{t.hero.h2}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-base md:text-lg leading-relaxed mb-10 mx-auto"
          style={{ ...IF, color: C.muted, maxWidth: "52ch" }}
        >
          {t.hero.sub}
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all duration-250 active:scale-[0.97] w-full sm:w-auto justify-center"
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
            {t.hero.cta1}
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium transition-all duration-250 active:scale-[0.97] w-full sm:w-auto justify-center"
            style={{
              ...IF, color: C.sub,
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "rgba(255,255,255,0.15)";
              el.style.backgroundColor = "rgba(255,255,255,0.07)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "rgba(255,255,255,0.09)";
              el.style.backgroundColor = "rgba(255,255,255,0.04)";
            }}
          >
            {t.hero.cta2}
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
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

/* ─── Logo marquee ──────────────────────────────────────────────────── */
function LogoMarquee() {
  const { t, lang } = useLang();
  const doubled = [...t.companies, ...t.companies];
  const isRtl = lang === "he";
  return (
    <section
      className="py-14 overflow-hidden"
      style={{
        backgroundColor: "rgba(7,9,15,0.95)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <p className="text-center text-[10px] font-bold tracking-[0.18em] uppercase mb-8" style={{ ...IF, color: C.outline }}>
        {t.marquee}
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-28 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to right, ${C.bg}, transparent)` }} />
        <div className="absolute right-0 top-0 bottom-0 w-28 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to left, ${C.bg}, transparent)` }} />
        <div
          className="flex"
          style={{ animation: isRtl ? "bv-marquee-rtl 30s linear infinite" : "bv-marquee 30s linear infinite" }}
        >
          {doubled.map((name, i) => (
            <div
              key={i}
              className="shrink-0 flex items-center gap-2 rounded-full px-4 py-2 mx-2.5 text-xs font-medium"
              style={{
                ...IF, color: C.muted,
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                whiteSpace: "nowrap",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.blue, opacity: 0.6 }} />
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pain section ──────────────────────────────────────────────────── */
function PainSection() {
  const { t } = useLang();
  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: C.s0 }}>
      <Orb color={C.purple} x="50%" y="50%" size={600} opacity={0.05} />
      <div className="max-w-[1100px] mx-auto relative">
        <div className="text-center mb-14 bv-reveal">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase" style={{ ...IF, color: C.blue }}>{t.pain.tag}</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 tracking-tight" style={{ ...MF, color: C.text, letterSpacing: "-0.02em" }}>{t.pain.h2}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {t.pain.avatars.map((a, i) => (
            <div
              key={a.type}
              className={`rounded-2xl p-7 bv-reveal bv-reveal-d${i + 1} transition-all duration-300 cursor-default`}
              style={{ ...glassCard }}
              onMouseEnter={e => {
                Object.assign((e.currentTarget as HTMLElement).style, glassCardHover(C.purple));
                (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                Object.assign((e.currentTarget as HTMLElement).style, glassCard);
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ backgroundColor: `${C.purple}12`, border: `1px solid ${C.purple}20` }}
              >
                {a.icon}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ ...IF, color: C.blue }}>{a.type}</p>
              <p className="text-sm leading-relaxed" style={{ ...IF, color: C.muted }}>{a.problem}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ──────────────────────────────────────────────────── */
function TestimonialsSection() {
  const { lang } = useLang();
  const items = lang === "he" ? [
    { name: "שרה כ.", role: "בעלים, קייטרינג מרידיאן", avatar: "שכ", quote: "BizMap הראה לי שאני מבזבזת 18 שעות בשבוע על משימות שלא ידעתי שהן ידניות. תוך חודש פרסמתי סוכן מיון מיילים — וקיבלתי את השעות בחזרה.", result: "18 שעות בשבוע חזרו" },
    { name: "דוד ר.", role: "מייסד, RealEdge נכסים", avatar: "דר", quote: "הייתי סקפטי. אבל BizMap נתן לי רשימה ספציפית של 6 סוכנים עם אומדני חיסכון מדויקים. שלושה פועלים כבר. ה-ROI אמיתי לגמרי.", result: "₪11,700/חודש חסכון" },
    { name: "ענת מ.", role: "מנהלת, מרפאת PrimeCare", avatar: "ענ", quote: "תיאום ותזכורות אכלו את כל צוות המנהלה שלי. BizMap זיהה את צוואר הבקבוק המדויק תוך 15 דקות. קיצצנו זמן אדמין ב-40%.", result: "40% פחות זמן אדמין" },
  ] : [
    { name: "Sarah K.", role: "Owner, Meridian Catering", avatar: "SK", quote: "BizMap showed me I was spending 18 hours a week on tasks I didn't even realize were manual. Within a month of deploying the email triage agent, I had those hours back.", result: "18h/week recovered" },
    { name: "David R.", role: "Founder, RealEdge Properties", avatar: "DR", quote: "I was skeptical — I'd heard 'AI will fix your business' before. But BizMap gave me a specific list of 6 agents with exact savings estimates. Three are live. The ROI is real.", result: "$3,200/mo saved" },
    { name: "Anat M.", role: "Director, PrimeCare Clinic", avatar: "AM", quote: "Our scheduling and reminders were consuming my whole admin team. BizMap identified the exact bottleneck in 15 minutes. We've cut admin time by 40%.", result: "40% less admin time" },
  ];
  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: C.bg }}>
      <Orb color={C.blue} x="80%" y="50%" size={500} opacity={0.06} />
      <div className="max-w-[1100px] mx-auto relative">
        <div className="text-center mb-14 bv-reveal">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase" style={{ ...IF, color: C.blue }}>
            {lang === "he" ? "מה הלקוחות אומרים" : "What customers say"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 tracking-tight" style={{ ...MF, color: C.text, letterSpacing: "-0.02em" }}>
            {lang === "he" ? "תוצאות אמיתיות. עסקים אמיתיים." : "Real results. Real businesses."}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div
              key={item.name}
              className={`rounded-2xl p-6 bv-reveal bv-reveal-d${i + 1} transition-all duration-300`}
              style={{ ...glassCard }}
              onMouseEnter={e => {
                Object.assign((e.currentTarget as HTMLElement).style, glassCardHover(C.blue));
                (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                Object.assign((e.currentTarget as HTMLElement).style, glassCard);
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <span key={si} style={{ color: C.amber, fontSize: 13, filter: `drop-shadow(0 0 4px ${C.amber}60)` }}>★</span>
                ))}
              </div>
              {/* Quote */}
              <p className="text-sm leading-relaxed mb-5" style={{ ...IF, color: C.muted }}>"{item.quote}"</p>
              {/* Author */}
              <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${C.blue}30, ${C.purple}30)`,
                    color: C.glow,
                    border: `1px solid ${C.blue}20`,
                  }}
                >
                  {item.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ ...MF, color: C.text }}>{item.name}</p>
                  <p className="text-[11px]" style={{ ...IF, color: C.muted }}>{item.role}</p>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0"
                  style={{ backgroundColor: `${C.green}12`, border: `1px solid ${C.green}20` }}
                >
                  <Activity className="w-3 h-3" style={{ color: C.green }} strokeWidth={2} />
                  <span className="text-[10px] font-semibold" style={{ ...IF, color: C.green }}>{item.result}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Feature: Business Map ─────────────────────────────────────────── */
function FeatureMap() {
  const { t } = useLang();
  const f = t.featMap;
  return (
    <section className="py-28 relative overflow-hidden" style={{ backgroundColor: C.s0 }}>
      <Orb color={C.blue} x="0%" y="50%" size={500} opacity={0.07} />
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="bv-reveal">
            <p className="text-[10px] font-bold tracking-[0.16em] uppercase mb-5" style={{ ...IF, color: C.blue }}>{f.tag}</p>
            <h2
              className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 whitespace-pre-line"
              style={{ ...MF, color: C.text, letterSpacing: "-0.03em" }}
            >{f.h2}</h2>
            <p className="text-base leading-relaxed mb-8" style={{ ...IF, color: C.muted, maxWidth: "44ch" }}>{f.body}</p>
            <div className="flex flex-col gap-3">
              {f.bullets.map((text) => (
                <div key={text} className="flex items-center gap-3 text-sm" style={{ ...IF, color: C.sub }}>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${C.blue}10`, border: `1px solid ${C.blue}18`, boxShadow: `0 0 12px ${C.blue}10` }}
                  >
                    <Network className="w-3.5 h-3.5" style={{ color: C.blue }} strokeWidth={1.5} />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="bv-reveal bv-reveal-d2">
            <MapFeatureVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

function MapFeatureVisual() {
  const nodes = [
    { x: 0,   y: 0,   name: "Marketing",  color: C.blue,   procs: 4, hrs: 18, manual: 55 },
    { x: 220, y: 0,   name: "Sales",       color: C.green,  procs: 6, hrs: 32, manual: 72 },
    { x: 110, y: 140, name: "Operations",  color: C.amber,  procs: 8, hrs: 41, manual: 80 },
    { x: 0,   y: 270, name: "Finance",     color: C.purple, procs: 3, hrs: 11, manual: 30 },
    { x: 220, y: 270, name: "Support",     color: C.glow,   procs: 5, hrs: 27, manual: 65 },
  ];
  return (
    <div
      className="relative rounded-2xl p-6 overflow-hidden"
      style={{ ...glassCard, boxShadow: `0 0 60px rgba(79,139,255,0.08), 0 20px 60px rgba(0,0,0,0.5)` }}
    >
      <div className="relative" style={{ height: 390 }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
          {[[0,2],[1,2],[2,3],[2,4]].map(([ai,bi]) => {
            const a = nodes[ai], b = nodes[bi];
            const ax = a.x + 90, ay = a.y + 40, bx = b.x + 90, by = b.y + 40;
            return (
              <path key={`${ai}-${bi}`}
                d={`M${ax},${ay} Q${(ax+bx)/2},${(ay+by)/2 - 15} ${bx},${by}`}
                fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="4 4"
              />
            );
          })}
        </svg>
        {nodes.map((n) => (
          <div
            key={n.name}
            className="absolute rounded-xl overflow-hidden"
            style={{
              left: n.x, top: n.y, width: 180,
              backgroundColor: "rgba(16,20,34,0.92)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${n.color}, ${n.color}40)` }} />
            <div className="px-3 py-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold" style={{ ...MF, color: C.text }}>{n.name}</span>
                <span className="text-[8px]" style={{ color: n.manual > 70 ? C.red : C.muted, ...IF }}>{n.manual}% manual</span>
              </div>
              <div className="flex gap-3 text-[9px] mb-2" style={{ color: C.muted, ...IF }}>
                <span>{n.procs} procs</span>
                <span>{n.hrs}h/wk</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{
                  width: `${n.manual}%`,
                  background: `linear-gradient(90deg, ${n.manual > 70 ? C.amber : n.manual > 45 ? C.blue : C.green}cc, ${n.manual > 70 ? C.amber : n.manual > 45 ? C.blue : C.green}60)`,
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Feature: AI Analysis ──────────────────────────────────────────── */
function FeatureAI() {
  const { t } = useLang();
  const f = t.featAI;
  return (
    <section className="py-28 relative overflow-hidden" style={{ backgroundColor: C.bg }}>
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
        style={{ background: `radial-gradient(ellipse at 50% 0%, rgba(79,139,255,0.08) 0%, transparent 65%)` }}
      />
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 relative">
        <div className="text-center max-w-2xl mx-auto mb-16 bv-reveal">
          <p className="text-[10px] font-bold tracking-[0.16em] uppercase mb-5" style={{ ...IF, color: C.blue }}>{f.tag}</p>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5 whitespace-pre-line"
            style={{ ...MF, color: C.text, letterSpacing: "-0.03em" }}>{f.h2}</h2>
          <p className="text-base leading-relaxed" style={{ ...IF, color: C.muted }}>{f.body}</p>
        </div>

        <div className="bv-reveal bv-reveal-d2 rounded-2xl overflow-hidden" style={{ ...glassCard }}>
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ backgroundColor: "rgba(16,20,34,0.8)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" style={{ color: C.blue }} strokeWidth={1.5} />
              <span className="text-sm font-semibold" style={{ ...MF, color: C.text }}>{f.tHead.title}</span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{ backgroundColor: `${C.blue}18`, color: C.glow, ...IF }}
              >{f.tHead.badge}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs" style={{ ...IF, color: C.muted }}>{f.tHead.savLbl}</span>
              <span
                className="text-sm font-bold"
                style={{ ...MF, color: C.glow, textShadow: `0 0 20px ${C.glow}60` }}
              >{f.tHead.sav}</span>
            </div>
          </div>
          {/* Rows */}
          {f.rows.map((opp, i) => (
            <div
              key={opp.agent}
              className="flex items-center gap-4 px-6 py-4 bv-feat-card"
              style={{
                backgroundColor: i % 2 === 0 ? "rgba(7,9,15,0.6)" : "rgba(11,14,26,0.4)",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${opp.color}12`, border: `1px solid ${opp.color}20`, boxShadow: `0 0 12px ${opp.color}10` }}
              >
                <Zap className="w-3.5 h-3.5" style={{ color: opp.color }} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ ...MF, color: C.text }}>{opp.agent}</p>
                <p className="text-xs" style={{ ...IF, color: C.muted }}>{opp.dept}</p>
              </div>
              <div className="hidden sm:flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm font-bold tabular-nums" style={{ ...MF, color: C.text }}>{opp.hrs}h</p>
                  <p className="text-[9px]" style={{ ...IF, color: C.muted }}>saved/wk</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold" style={{ ...MF, color: C.glow, textShadow: `0 0 12px ${C.glow}40` }}>{opp.sav}</p>
                  <p className="text-[9px]" style={{ ...IF, color: C.muted }}>monthly</p>
                </div>
                <div
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ ...IF, backgroundColor: `${opp.color}12`, color: opp.color, border: `1px solid ${opp.color}20` }}
                >{opp.cx}</div>
              </div>
            </div>
          ))}
          {/* Footer */}
          <div
            className="flex items-center justify-between px-6 py-3.5"
            style={{ backgroundColor: "rgba(16,20,34,0.6)", borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            <span className="text-xs" style={{ ...IF, color: C.muted }}>{f.foot.show}</span>
            <Link href="/opportunities" className="inline-flex items-center gap-1 text-xs font-semibold transition-colors duration-200"
              style={{ ...IF, color: C.blue }}
              onMouseEnter={e => (e.currentTarget.style.color = C.glow)}
              onMouseLeave={e => (e.currentTarget.style.color = C.blue)}
            >
              {f.foot.all} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Feature: How it works ─────────────────────────────────────────── */
function FeatureHowItWorks() {
  const { t } = useLang();
  const f = t.hiw;
  const icons = [BarChart3, Network, Zap] as const;
  const colors = [C.blue, C.glow, C.green] as const;
  return (
    <section className="py-28 relative overflow-hidden" style={{ backgroundColor: C.s0 }}>
      <Orb color={C.green} x="90%" y="50%" size={500} opacity={0.05} />
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-16 lg:gap-24 items-start">
          <div className="lg:sticky lg:top-24 bv-reveal">
            <p className="text-[10px] font-bold tracking-[0.16em] uppercase mb-5" style={{ ...IF, color: C.blue }}>{f.tag}</p>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5 whitespace-pre-line"
              style={{ ...MF, color: C.text, letterSpacing: "-0.03em" }}>{f.h2}</h2>
            <p className="text-sm leading-relaxed mb-8" style={{ ...IF, color: C.muted }}>{f.body}</p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.97]"
              style={{
                ...IF,
                background: `linear-gradient(135deg, ${C.blue}, ${C.purple}90)`,
                color: "#fff",
                boxShadow: `0 0 0 1px ${C.blue}30, 0 4px 20px ${C.blue}25`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${C.blue}50, 0 6px 30px ${C.blue}45`;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${C.blue}30, 0 4px 20px ${C.blue}25`;
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {f.btn} <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {f.steps.map((step, i) => {
              const Icon = icons[i];
              const color = colors[i];
              return (
                <div
                  key={step.n}
                  className={`bv-reveal bv-reveal-d${i + 1} flex gap-6 p-7 rounded-2xl cursor-default transition-all duration-300`}
                  style={{ ...glassCard }}
                  onMouseEnter={e => {
                    Object.assign((e.currentTarget as HTMLElement).style, glassCardHover(color));
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    Object.assign((e.currentTarget as HTMLElement).style, glassCard);
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  <span
                    className="text-5xl font-extrabold tabular-nums shrink-0 leading-none select-none"
                    style={{
                      ...MF,
                      letterSpacing: "-0.04em",
                      color: "transparent",
                      WebkitTextStroke: `1px rgba(255,255,255,0.1)`,
                    }}
                  >
                    {step.n}
                  </span>
                  <div>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}12`, border: `1px solid ${color}20`, boxShadow: `0 0 12px ${color}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-base font-bold" style={{ ...MF, color: C.text, letterSpacing: "-0.01em" }}>{step.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ ...IF, color: C.muted }}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
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

/* ─── Stats ─────────────────────────────────────────────────────────── */
function Stats() {
  const { t } = useLang();
  return (
    <section
      style={{
        backgroundColor: "rgba(7,9,15,0.98)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {t.stats.map((item, i) => (
            <StatCell key={item.lbl} val={item.val} lbl={item.lbl} sub={item.sub} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Insight section ───────────────────────────────────────────────── */
function InsightSection() {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  const count = useCountUp(parseInt(t.insight.stat), 1800, triggered);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setTriggered(true); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-28 px-6 relative overflow-hidden" style={{ backgroundColor: C.bg }}>
      <Orb color={C.blue} x="50%" y="50%" size={700} opacity={0.07} />
      <div className="max-w-[860px] mx-auto text-center bv-reveal relative">
        <span className="text-[10px] font-bold tracking-[0.16em] uppercase" style={{ ...IF, color: C.blue }}>{t.insight.tag}</span>
        <div className="mt-8 mb-4 relative">
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${C.blue}12 0%, transparent 70%)`,
              filter: "blur(20px)",
            }}
          />
          <span
            className="text-[6rem] md:text-[9rem] font-extrabold tabular-nums leading-none relative"
            style={{
              ...MF,
              background: `linear-gradient(135deg, ${C.blue} 0%, ${C.glow} 60%, #fff 80%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: `drop-shadow(0 0 40px ${C.blue}40)`,
            }}
          >
            {count}
          </span>
          <span className="text-2xl font-bold ml-3" style={{ ...MF, color: C.sub }}>{t.insight.statUnit}</span>
        </div>
        <p className="text-sm font-semibold mb-6" style={{ ...IF, color: C.muted }}>{t.insight.statLabel}</p>
        <p className="text-base leading-relaxed max-w-[52ch] mx-auto" style={{ ...IF, color: C.muted }}>{t.insight.body}</p>
      </div>
    </section>
  );
}

/* ─── Price anchor ──────────────────────────────────────────────────── */
function PriceAnchorSection() {
  const { t, lang } = useLang();
  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: C.s0 }}>
      <div className="max-w-[700px] mx-auto text-center bv-reveal">
        <span className="text-[10px] font-bold tracking-[0.16em] uppercase" style={{ ...IF, color: C.blue }}>{t.anchor.tag}</span>
        <h2 className="text-2xl md:text-3xl font-bold mt-4 mb-2 tracking-tight" style={{ ...MF, color: C.text, letterSpacing: "-0.02em" }}>{t.anchor.h2}</h2>
        <p className="text-sm mb-10" style={{ ...IF, color: C.muted }}>{t.anchor.sub}</p>
        <div className="grid grid-cols-2 gap-4 mb-10">
          {t.anchor.items.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl p-6 text-left transition-all duration-300"
              style={{
                backgroundColor: item.bad ? `rgba(239,68,68,0.05)` : `rgba(16,185,129,0.05)`,
                border: `1px solid ${item.bad ? `rgba(239,68,68,0.15)` : `rgba(16,185,129,0.15)`}`,
                boxShadow: `inset 0 1px 0 ${item.bad ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)"}`,
              }}
            >
              <p className="text-sm font-bold mb-1.5" style={{ ...IF, color: item.bad ? C.red : C.green }}>{item.label}</p>
              <p className="text-2xl font-extrabold mb-2 tracking-tight" style={{ ...MF, color: C.text }}>{item.cost}</p>
              <p className="text-xs" style={{ ...IF, color: C.muted }}>{item.note}</p>
            </div>
          ))}
        </div>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.97]"
          style={{
            ...IF,
            background: `linear-gradient(135deg, ${C.blue}, ${C.purple}90)`,
            color: "#fff",
            boxShadow: `0 0 0 1px ${C.blue}30, 0 4px 20px ${C.blue}25`,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${C.blue}50, 0 6px 30px ${C.blue}45`;
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${C.blue}30, 0 4px 20px ${C.blue}25`;
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          {lang === "he" ? "מפה את העסק שלי בחינם" : "Map my business — it's free"}
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </Link>
      </div>
    </section>
  );
}

/* ─── FAQ ─────────────────────────────────────────────────────────────── */
function FAQSection() {
  const { lang } = useLang();
  const [open, setOpen] = useState<number | null>(null);
  const items = lang === "he" ? [
    { q: "האם BizMap באמת חינם?", a: "כן. מיפוי העסק המלא, ניתוח הזדמנויות ה-AI ותוכנית הפעולה — חינם לחלוטין. ללא כרטיס אשראי. ללא תקופת ניסיון. אנחנו מרוויחים כשאתה בוחר ליישם סוכני AI עם השותפים שלנו — זה הכל." },
    { q: "עד כמה ההמלצות של ה-AI מדויקות?", a: "ההמלצות מבוססות על דפוסים ממאות עסקים שנותחו בתעשייה שלך. כל הצעה כוללת שעות חסכה משוערות וחיסכון חודשי — אלו טווחים, לא ערבויות. רוב העסקים רואים תוצאות תוך 30–60 יום מפריסת הסוכן הראשון." },
    { q: "האם עלי לחבר כלים או נתונים?", a: "לא. אתה עונה על 18 שאלות מובנות. ללא אינטגרציות, ללא מפתחות API, ללא ייצוא נתונים. התשובות שלך לא עוזבות את המחשב שלך — הניתוח פועל מקומית." },
    { q: "מה קורה אחרי שמסיים את הסקר?", a: "אתה מקבל מפת עסק אינטראקטיבית המציגה כל מחלקה ותהליך, רשימה מדורגת של הזדמנויות סוכן AI עם אומדני חיסכון, ומפת דרכים ליישום. אפשר להתחיל מיד — ללא שיחת מכירות." },
    { q: "אני לא טכנולוגי. האם זה מתאים לי?", a: "בהחלט. BizMap בנוי לבעלי עסקים, לא למהנדסים. השאלות עוסקות בפעילות העסקית שלך, לא בטכנולוגיה. כל המלצת סוכן AI מגיעה עם מדריך יישום בשפה פשוטה." },
  ] : [
    { q: "Is BizMap really free?", a: "Yes. The full business mapping, AI opportunity analysis, and action plan are completely free. No credit card. No trial period. We make money when you choose to implement AI agents with our partners — that's it." },
    { q: "How accurate are the AI recommendations?", a: "Our recommendations are based on patterns from hundreds of analyzed businesses in your industry. Every suggestion includes estimated hours saved and monthly savings — these are ranges, not guarantees. Most businesses see results within 30–60 days of deploying their first agent." },
    { q: "Do I need to connect any of my tools or data?", a: "No. You answer 18 structured questions. No integrations, no API keys, no data exports. Your answers never leave your device — the analysis runs locally." },
    { q: "What happens after I complete the assessment?", a: "You get an interactive Business Map showing every department and process, a ranked list of AI agent opportunities with savings estimates, and an implementation roadmap. You can start implementing immediately — no sales call required." },
    { q: "I'm not technical. Can I still use this?", a: "Absolutely. BizMap is built for business owners, not engineers. The questions are about your business operations, not technology. Each AI agent recommendation comes with a plain-English implementation guide." },
  ];
  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ backgroundColor: C.bg }}>
      <div className="max-w-[720px] mx-auto">
        <div className="text-center mb-14 bv-reveal">
          <span className="text-[10px] font-bold tracking-[0.16em] uppercase" style={{ ...IF, color: C.blue }}>
            {lang === "he" ? "שאלות נפוצות" : "Frequently asked questions"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 tracking-tight" style={{ ...MF, color: C.text, letterSpacing: "-0.02em" }}>
            {lang === "he" ? "שאלות שכנראה יש לך" : "Questions you probably have"}
          </h2>
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
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
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
  const f = t.cta;
  return (
    <section className="py-28 relative overflow-hidden" style={{ backgroundColor: C.s0 }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
        <div
          className="rounded-3xl px-10 md:px-20 py-20 md:py-28 text-center relative overflow-hidden bv-reveal"
          style={{
            backgroundColor: "rgba(11,14,26,0.85)",
            backdropFilter: "blur(30px) saturate(1.6)",
            WebkitBackdropFilter: "blur(30px) saturate(1.6)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 100px rgba(0,0,0,0.6)",
          }}
        >
          {/* Multi-layer ambient glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
            <div
              className="absolute -top-60 -left-60 w-[600px] h-[600px] rounded-full"
              style={{ background: `radial-gradient(circle, ${C.blue}18 0%, transparent 60%)`, filter: "blur(40px)" }}
            />
            <div
              className="absolute -bottom-60 -right-60 w-[600px] h-[600px] rounded-full"
              style={{ background: `radial-gradient(circle, ${C.purple}12 0%, transparent 60%)`, filter: "blur(40px)" }}
            />
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse 80% 50% at 50% 50%, ${C.blue}06 0%, transparent 70%)` }}
            />
          </div>

          <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-6 relative" style={{ ...IF, color: C.blue }}>{f.tag}</p>
          <h2
            className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 relative"
            style={{ ...MF, color: C.text, letterSpacing: "-0.035em" }}
          >
            {f.h2a}<br />
            <span style={{
              background: `linear-gradient(135deg, ${C.blue} 0%, ${C.glow} 60%, #fff 80%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: `drop-shadow(0 0 30px ${C.blue}40)`,
            }}>{f.h2b}</span>
          </h2>
          <p
            className="text-base leading-relaxed mb-10 mx-auto relative whitespace-pre-line"
            style={{ ...IF, color: C.muted, maxWidth: "46ch" }}
          >
            {f.body}
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-xl text-sm font-bold transition-all duration-250 active:scale-[0.97] justify-center relative"
            style={{
              ...IF,
              background: `linear-gradient(135deg, ${C.blue}, ${C.purple}90)`,
              color: "#fff",
              boxShadow: `0 0 0 1px ${C.blue}40, 0 8px 30px ${C.blue}35`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${C.blue}60, 0 8px 50px ${C.blue}55, 0 0 80px ${C.blue}20`;
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${C.blue}40, 0 8px 30px ${C.blue}35`;
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            {f.btn}
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
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
              <span className="text-[10px] font-bold tracking-widest uppercase mb-1 block" style={{ ...IF, color: C.outline }}>
                {lang === "he" ? "צור קשר" : "Contact Us"}
              </span>
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
            <div className="flex items-center gap-2 mt-5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: C.green, boxShadow: `0 0 6px ${C.green}`, animation: "bv-pulse-dot 2s ease-in-out infinite" }}
              />
              <span className="text-[10px]" style={{ ...IF, color: C.muted }}>{f.status}</span>
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
        <LogoMarquee />
        <PainSection />
        <TestimonialsSection />
        <FeatureMap />
        <FeatureAI />
        <InsightSection />
        <FeatureHowItWorks />
        <Stats />
        <PriceAnchorSection />
        <FAQSection />
        <FinalCTA />
        <Footer />
        <StickyMobileCTA />
      </div>
    </LangCtx.Provider>
  );
}
