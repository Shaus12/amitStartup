"use client";

import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import Link from "next/link";
import {
  ArrowRight, ChevronRight, Zap, Network,
  Brain, CheckCircle, Activity, BarChart3, Globe,
} from "lucide-react";
import { CosmicParallaxBg } from "@/components/ui/parallax-cosmic-background";
import { useLanguage } from "@/lib/i18n";

/* ─── Typewriter hook ────────────────────────────────────────────────── */
function useTypewriter(text: string, speed = 22, startDelay = 700) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

/* ─── Animated counter hook ──────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800, trigger: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, trigger]);
  return value;
}

/* ─── Design tokens (matches dashboard palette) ─────────────────────── */
const C = {
  bg:     "#111319",
  s0:     "#0c0e14",
  s1:     "#191b22",
  s2:     "#1e1f26",
  s3:     "#282a30",
  s4:     "#33343b",
  outline:"#424754",
  muted:  "#8c909f",
  sub:    "#c2c6d6",
  text:   "#e2e2eb",
  blue:   "#4d8eff",
  glow:   "#adc6ff",
  green:  "#34d399",
  amber:  "#fbbf24",
  red:    "#f87171",
  purple: "#a78bfa",
} as const;
const MF: React.CSSProperties = { fontFamily: "var(--font-manrope, system-ui)" };
const IF: React.CSSProperties = { fontFamily: "var(--font-inter, system-ui)" };

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
      sub: "BizView ממפה את כל הפעילות שלך תוך 15 דקות ומראה לך בדיוק אילו סוכני AI יחזירו לך את הזמן — ואת הכסף. ללא יועצים. ללא ניחושים.",
      cta1: "הראה לי לאן הזמן שלי הולך",
      cta2: "ראה דוגמה אמיתית",
      proof: ["15 דקות בלבד", "חוסך ~23 שעות/שבוע", "ללא כרטיס אשראי"],
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
        { label: "BizView", cost: "חינם", note: "מפה מלאה + תוכנית AI + המלצות ספציפיות", bad: false },
      ],
    },
    insight: {
      tag: "מה הנתונים מראים",
      stat: "23",
      statUnit: "שעות/שבוע",
      statLabel: "ממוצע הזמן שעסקי שירות מבזבזים על עבודה ידנית",
      body: "ניתחנו מאות עסקים. עסק שירות ממוצע מוציא 23 שעות בשבוע על משימות שסוכן AI יכול לבצע תוך דקות. זה 2.5 ימי עבודה שבועיים שנגנבים ממך.",
    },
    marquee: "מוסמך על ידי עסקים חדשניים",
    companies: [
      "אלפא-טק", "רמות גרופ", "סטודיו דיגיטל", "מרכז הנגב", "חינם מדיה",
      "Thornwick & Co.", "Barlow Digital", "Fenwick Media", "Ostler Group",
      "Castlewood Retail", "Meridian Consulting", "Halden Studio",
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
      copy: "© 2026 BizView. נבנה עם Claude AI. הנתונים שלך לא עוזבים את המחשב שלך.",
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
      pricing: "Pricing", signIn: "Sign in", cta: "Get BizView free",
    },
    /* CRO-optimised copy:
       ✓ Outcome-focused headlines with specific numbers
       ✓ "Get [result] without [pain]" framing
       ✓ CTAs that communicate value, not just action
       ✓ Social proof badge + trust indicators near CTAs
       ✓ Final CTA creates urgency via competitive framing */
    hero: {
      badge: "Join 500+ businesses already saving 23h/week",
      h1: "You started a business to be free.",
      h2: "So why are you drowning in WhatsApp, spreadsheets, and fires?",
      sub: "BizView maps your entire operation in 15 minutes and shows you exactly which AI agents will recover your time — and your money. No consultants. No guesswork.",
      cta1: "Show me where my time is going",
      cta2: "Watch a 2-min demo",
      proof: ["Takes just 15 minutes", "Saves ~23 hours/week on average", "No credit card required"],
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
        { label: "BizView", cost: "Free", note: "Full map + AI plan + specific recommendations", bad: false },
      ],
    },
    insight: {
      tag: "What the data shows",
      stat: "23",
      statUnit: "hrs/week",
      statLabel: "Average time service businesses waste on manual work",
      body: "We've analyzed hundreds of businesses. The average service business spends 23 hours a week on tasks an AI agent can do in minutes. That's 2.5 workdays every week stolen from you.",
    },
    marquee: "Trusted by forward-thinking businesses",
    companies: [
      "Thornwick & Co.", "Barlow Digital", "Fenwick Media", "Ostler Group",
      "Castlewood Retail", "Meridian Consulting", "Halden Studio", "Vantage Partners",
      "Greyfield Labs", "Pembroke Ventures", "Langdon Foods", "Clifton Advisory",
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
      copy: "© 2026 BizView. Built with Claude AI. Local-first — your data never leaves your machine.",
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

/* ─── Language context (uses global context from lib/i18n) ────────── */
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

/* ─── Shared logo mark ──────────────────────────────────────────────── */
function BizLogo({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
      <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.45" />
      <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.45" />
      <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
    </svg>
  );
}

/* ─── Nav ───────────────────────────────────────────────────────────── */
function Nav() {
  const { t, lang, setLang } = useLang();
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: C.bg + "d8",
        backdropFilter: "blur(18px) saturate(1.5)",
        WebkitBackdropFilter: "blur(18px) saturate(1.5)",
        borderBottom: `1px solid ${C.s3}`,
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-14 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.glow})` }}
          >
            <BizLogo size={13} />
          </div>
          <span className="text-sm font-bold" style={{ ...MF, color: C.text }}>BizView</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-7">
          {[t.nav.features, t.nav.howItWorks, t.nav.pricing].map((l) => (
            <span
              key={l}
              className="text-xs font-medium cursor-pointer transition-colors duration-150"
              style={{ ...IF, color: C.muted }}
              onMouseEnter={e => (e.currentTarget.style.color = C.sub)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >{l}</span>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "he" ? "en" : "he")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
            style={{ ...IF, color: C.sub, backgroundColor: `${C.blue}10`, border: `1px solid ${C.blue}30` }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${C.blue}20`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${C.blue}10`; }}
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5" style={{ color: C.blue }} />
            {lang === "he" ? "EN" : "עב"}
          </button>

          <Link
            href="/login"
            className="hidden sm:block text-xs font-medium transition-colors duration-150"
            style={{ ...IF, color: C.muted }}
            onMouseEnter={e => (e.currentTarget.style.color = C.sub)}
            onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
          >{t.nav.signIn}</Link>

          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-[0.97]"
            style={{
              ...IF,
              background: `linear-gradient(135deg, ${C.blue}, ${C.glow}80)`,
              color: "#fff",
              boxShadow: `0 0 0 1px ${C.blue}40`,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${C.blue}50, 0 0 0 1px ${C.blue}60`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${C.blue}40`; }}
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
  const { displayed: typedSub, done: typeDone } = useTypewriter(t.hero.sub, 18, 900);
  return (
    <section
      className="min-h-[100dvh] flex flex-col items-center justify-center pt-24 pb-0 px-6 relative overflow-hidden"
      style={{ backgroundColor: C.bg }}
    >
      {/* Cosmic parallax star background */}
      <CosmicParallaxBg loop={true} />

      {/* Content — z-index keeps it above the cosmic layer */}
      <div className="relative z-10 text-center max-w-[880px] mx-auto">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-8 text-[11px] font-semibold"
          style={{
            ...IF,
            backgroundColor: `rgba(77,142,255,0.08)`,
            border: `1px solid rgba(77,142,255,0.22)`,
            color: C.glow,
            animation: "bv-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            backgroundColor: C.blue,
            animation: "bv-pulse-dot 2s ease-in-out infinite",
            display: "inline-block",
          }} />
          {t.hero.badge}
        </div>

        {/* Headline */}
        <h1
          className="text-[3rem] md:text-[4.25rem] lg:text-[5rem] font-extrabold leading-[1.05] tracking-tight mb-6"
          style={{ ...MF, color: C.text, animation: "bv-fade-up 0.7s 0.08s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          {t.hero.h1}<br />
          <span style={{
            background: `linear-gradient(110deg, ${C.blue} 0%, ${C.glow} 40%, #e8f0ff 55%, ${C.glow} 70%, ${C.blue} 100%)`,
            backgroundSize: "250% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "bv-shimmer-sweep 4s linear infinite",
          }}>{t.hero.h2}</span>
        </h1>

        {/* Subtitle — typewriter */}
        <p
          className="text-base md:text-lg leading-relaxed mb-10 mx-auto"
          style={{ ...IF, color: C.muted, maxWidth: "52ch", animation: "bv-fade-up 0.7s 0.16s cubic-bezier(0.16,1,0.3,1) both", minHeight: "5em" }}
        >
          {typedSub}
          {!typeDone && (
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: "1em",
                marginLeft: 2,
                verticalAlign: "middle",
                backgroundColor: C.blue,
                animation: "bv-cursor-blink 0.8s step-end infinite",
              }}
            />
          )}
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          style={{ animation: "bv-fade-up 0.7s 0.24s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.97] w-full sm:w-auto justify-center"
            style={{
              ...IF,
              background: `linear-gradient(135deg, ${C.blue}, ${C.glow}90)`,
              color: "#fff",
              boxShadow: `0 0 0 1px ${C.blue}50`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 28px ${C.blue}50, 0 8px 32px ${C.blue}30`;
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${C.blue}50`;
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            {t.hero.cta1}
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] w-full sm:w-auto justify-center"
            style={{ ...IF, color: C.sub, border: `1px solid ${C.s3}`, backgroundColor: C.s2 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.s4; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.s3; }}
          >
            {t.hero.cta2}
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>

        {/* Trust indicators */}
        <div
          className="flex items-center justify-center gap-5 mt-8 flex-wrap"
          style={{ animation: "bv-fade-up 0.7s 0.32s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          {t.hero.proof.map((text) => (
            <div key={text} className="flex items-center gap-1.5 text-xs" style={{ ...IF, color: C.outline }}>
              <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: C.green }} strokeWidth={2.5} />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Product mockup */}
      <div
        className="relative z-10 mt-16 w-full max-w-[1180px] mx-auto"
        style={{ animation: "bv-fade-up 0.9s 0.4s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <HeroBrowserMockup />
        <div
          className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent, ${C.bg})` }}
        />
      </div>
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
        backgroundColor: C.s1,
        border: `1px solid ${C.s3}`,
        boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px ${C.s4}, 0 0 60px rgba(77,142,255,0.06)`,
        transform: "perspective(1400px) rotateX(4deg)",
        transformOrigin: "50% 0%",
      }}
    >
      {/* Chrome bar */}
      <div className="flex items-center gap-3 px-4 h-10 shrink-0" style={{ backgroundColor: C.s2, borderBottom: `1px solid ${C.s3}` }}>
        <div className="flex gap-1.5">
          {[C.red, C.amber, C.green].map((col, i) => (
            <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: col }} />
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded px-3 py-1 text-[11px] w-48" style={{ backgroundColor: C.s3, color: C.outline, ...IF }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.green }} />
            bizview.app/dashboard
          </div>
        </div>
      </div>

      {/* App shell */}
      <div className="flex" style={{ minHeight: 420 }}>
        {/* Sidebar */}
        <div className="w-40 shrink-0 flex flex-col py-3 px-2" style={{ backgroundColor: C.s1, borderRight: `1px solid ${C.s3}` }}>
          <div className="flex items-center gap-2 px-2 mb-5">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.glow})` }}>
              <BizLogo size={9} />
            </div>
            <span className="text-[11px] font-bold" style={{ ...MF, color: C.text }}>BizView</span>
          </div>
          <div className="text-[8px] font-bold tracking-widest uppercase px-2 mb-2" style={{ ...IF, color: C.s4 }}>Workspace</div>
          {[{ label: "Business Map", active: true }, { label: "AI Opportunities", active: false }].map(({ label, active }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-[10px] font-medium mb-0.5"
              style={{ backgroundColor: active ? C.s3 : "transparent", color: active ? C.text : C.outline, ...IF }}
            >
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: active ? C.blue : C.s4 }} />
              {label}
            </div>
          ))}
          <div className="flex-1" />
          <div className="mx-1 p-2 rounded" style={{ backgroundColor: `rgba(77,142,255,0.06)`, border: `1px solid ${C.s3}` }}>
            <div className="text-[9px] font-bold mb-1" style={{ ...IF, color: C.blue }}>AI Analysis</div>
            <div className="text-[8px] leading-snug" style={{ ...IF, color: C.outline }}>8 opportunities found</div>
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
            backgroundImage: `radial-gradient(circle, ${C.s3} 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        >
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 z-10"
            style={{ backgroundColor: C.bg + "cc", borderBottom: `1px solid ${C.s3}` }}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold" style={{ ...MF, color: C.sub }}>Meridian Consulting Group</span>
              <span className="text-[8px]" style={{ color: C.outline }}>·</span>
              <span className="text-[9px]" style={{ ...IF, color: C.outline }}>5 departments · 23 processes</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded"
              style={{ backgroundColor: C.s2, border: `1px solid ${C.s3}`, color: C.muted, ...IF }}>
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
                    fill="none" stroke={C.s4} strokeWidth="1.5" strokeDasharray="4 4" opacity={0.6}
                  />
                );
              })}
            </svg>
            {DEPTS.map((dept) => {
              const statusColor = dept.status === "Healthy" ? C.green : dept.status === "At Risk" ? C.red : C.amber;
              return (
                <div
                  key={dept.id}
                  className="absolute rounded-lg overflow-hidden"
                  style={{ left: dept.x, top: dept.y + 8, width: 180, backgroundColor: C.s2, border: `1px solid ${C.s3}`, boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
                >
                  <div className="h-[2px]" style={{ backgroundColor: dept.color }} />
                  <div className="px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dept.color }} />
                        <span className="text-[10px] font-bold" style={{ ...MF, color: C.text }}>{dept.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: statusColor }} />
                        <span className="text-[8px] font-semibold" style={{ color: statusColor, ...IF }}>{dept.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[8px]" style={{ color: C.outline, ...IF }}>
                      <span style={{ color: C.muted }}>{dept.hrs}h/wk</span>
                      <span>·</span>
                      <span style={{ color: C.muted }}>{dept.procs} processes</span>
                    </div>
                    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: C.s3 }}>
                      <div className="h-full rounded-full" style={{
                        width: `${[55, 72, 40, 63, 48][DEPTS.indexOf(dept)]}%`,
                        backgroundColor: dept.color, opacity: 0.7,
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
    <section className="py-14 overflow-hidden" style={{ backgroundColor: C.s1, borderTop: `1px solid ${C.s3}`, borderBottom: `1px solid ${C.s3}` }}>
      <p className="text-center text-[10px] font-bold tracking-[0.15em] uppercase mb-8" style={{ ...IF, color: C.outline }}>
        {t.marquee}
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to right, ${C.s1}, transparent)` }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to left, ${C.s1}, transparent)` }} />
        <div
          className="flex"
          style={{ animation: isRtl ? "bv-marquee-rtl 28s linear infinite" : "bv-marquee 28s linear infinite" }}
        >
          {doubled.map((name, i) => (
            <div
              key={i}
              className="shrink-0 flex items-center gap-2 rounded-full px-4 py-2 mx-3 text-xs font-medium"
              style={{ ...IF, color: C.muted, backgroundColor: C.s2, border: `1px solid ${C.s3}`, whiteSpace: "nowrap" }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.blue, opacity: 0.5 }} />
              {name}
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
    <section className="py-28" style={{ backgroundColor: C.bg }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="bv-reveal">
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-5" style={{ ...IF, color: C.blue }}>{f.tag}</p>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 whitespace-pre-line"
              style={{ ...MF, color: C.text, letterSpacing: "-0.03em" }}>
              {f.h2}
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ ...IF, color: C.muted, maxWidth: "44ch" }}>{f.body}</p>
            <div className="flex flex-col gap-3">
              {f.bullets.map((text) => (
                <div key={text} className="flex items-center gap-3 text-sm" style={{ ...IF, color: C.sub }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${C.blue}12`, border: `1px solid ${C.blue}20` }}>
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
    <div className="relative rounded-2xl p-6 overflow-hidden"
      style={{ backgroundColor: C.s1, border: `1px solid ${C.s3}`, boxShadow: `0 0 40px rgba(77,142,255,0.06)` }}>
      <div className="relative" style={{ height: 380 }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
          {[[0,2],[1,2],[2,3],[2,4]].map(([ai,bi]) => {
            const a = nodes[ai], b = nodes[bi];
            const ax = a.x + 90, ay = a.y + 40, bx = b.x + 90, by = b.y + 40;
            return (
              <path key={`${ai}-${bi}`}
                d={`M${ax},${ay} Q${(ax+bx)/2},${(ay+by)/2 - 15} ${bx},${by}`}
                fill="none" stroke={C.s4} strokeWidth="1.5" strokeDasharray="4 4" opacity={0.7}
              />
            );
          })}
        </svg>
        {nodes.map((n) => (
          <div
            key={n.name}
            className="absolute rounded-lg overflow-hidden"
            style={{ left: n.x, top: n.y, width: 180, backgroundColor: C.s2, border: `1px solid ${C.s3}`, boxShadow: "0 4px 16px rgba(0,0,0,0.35)" }}
          >
            <div className="h-[2px]" style={{ backgroundColor: n.color }} />
            <div className="px-3 py-2.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold" style={{ ...MF, color: C.text }}>{n.name}</span>
                <span className="text-[8px]" style={{ color: n.manual > 70 ? C.red : C.muted, ...IF }}>{n.manual}% manual</span>
              </div>
              <div className="flex gap-3 text-[9px] mb-2" style={{ color: C.outline, ...IF }}>
                <span style={{ color: C.muted }}>{n.procs} procs</span>
                <span style={{ color: C.muted }}>{n.hrs}h/wk</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: C.s3 }}>
                <div className="h-full rounded-full" style={{
                  width: `${n.manual}%`,
                  backgroundColor: n.manual > 70 ? C.amber : n.manual > 45 ? C.blue : C.green,
                  opacity: 0.8,
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
    <section className="py-28 relative overflow-hidden"
      style={{ backgroundColor: C.s1, borderTop: `1px solid ${C.s3}`, borderBottom: `1px solid ${C.s3}` }}>
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px]"
        style={{ background: `radial-gradient(ellipse at 50% 0%, rgba(77,142,255,0.07) 0%, transparent 65%)` }} />
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="text-center max-w-2xl mx-auto mb-16 bv-reveal">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-5" style={{ ...IF, color: C.blue }}>{f.tag}</p>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5 whitespace-pre-line"
            style={{ ...MF, color: C.text, letterSpacing: "-0.03em" }}>{f.h2}</h2>
          <p className="text-base leading-relaxed" style={{ ...IF, color: C.muted }}>{f.body}</p>
        </div>

        <div className="bv-reveal bv-reveal-d2 rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${C.s3}`, boxShadow: `0 0 40px rgba(77,142,255,0.05)` }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4"
            style={{ backgroundColor: C.s2, borderBottom: `1px solid ${C.s3}` }}>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" style={{ color: C.blue }} strokeWidth={1.5} />
              <span className="text-sm font-semibold" style={{ ...MF, color: C.text }}>{f.tHead.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: `${C.blue}15`, color: C.glow, ...IF }}>{f.tHead.badge}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ ...IF, color: C.outline }}>{f.tHead.savLbl}</span>
              <span className="text-sm font-bold" style={{ ...MF, color: C.glow }}>{f.tHead.sav}</span>
            </div>
          </div>
          {/* Rows */}
          {f.rows.map((opp, i) => (
            <div
              key={opp.agent}
              className="flex items-center gap-4 px-6 py-4 bv-feat-card"
              style={{ backgroundColor: i % 2 === 0 ? C.bg : C.s1, borderBottom: `1px solid ${C.s3}` }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${opp.color}12`, border: `1px solid ${opp.color}20` }}>
                <Zap className="w-3.5 h-3.5" style={{ color: opp.color }} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ ...MF, color: C.text }}>{opp.agent}</p>
                <p className="text-xs" style={{ ...IF, color: C.outline }}>{opp.dept}</p>
              </div>
              <div className="hidden sm:flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm font-bold tabular-nums" style={{ ...MF, color: C.text }}>{opp.hrs}h</p>
                  <p className="text-[9px]" style={{ ...IF, color: C.outline }}>saved/wk</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold" style={{ ...MF, color: C.glow }}>{opp.sav}</p>
                  <p className="text-[9px]" style={{ ...IF, color: C.outline }}>monthly</p>
                </div>
                <div className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ ...IF, backgroundColor: `${opp.color}12`, color: opp.color }}>{opp.cx}</div>
              </div>
            </div>
          ))}
          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-3.5" style={{ backgroundColor: C.s2 }}>
            <span className="text-xs" style={{ ...IF, color: C.outline }}>{f.foot.show}</span>
            <Link href="/opportunities" className="inline-flex items-center gap-1 text-xs font-medium" style={{ ...IF, color: C.blue }}>
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
    <section className="py-28" style={{ backgroundColor: C.bg }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-16 lg:gap-24 items-start">
          <div className="lg:sticky lg:top-24 bv-reveal">
            <p className="text-[10px] font-bold tracking-[0.14em] uppercase mb-5" style={{ ...IF, color: C.blue }}>{f.tag}</p>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5 whitespace-pre-line"
              style={{ ...MF, color: C.text, letterSpacing: "-0.03em" }}>{f.h2}</h2>
            <p className="text-sm leading-relaxed" style={{ ...IF, color: C.muted }}>{f.body}</p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.97]"
              style={{ ...IF, background: `linear-gradient(135deg, ${C.blue}, ${C.glow}90)`, color: "#fff" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${C.blue}45`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
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
                  className={`bv-reveal bv-reveal-d${i + 1} flex gap-6 p-7 rounded-2xl cursor-default transition-all duration-200`}
                  style={{ backgroundColor: C.s1, border: `1px solid ${C.s3}` }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = `${C.blue}40`;
                    el.style.boxShadow = `0 0 30px rgba(77,142,255,0.08)`;
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = C.s3;
                    el.style.boxShadow = "none";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  <span className="text-5xl font-extrabold tabular-nums shrink-0 leading-none select-none"
                    style={{ ...MF, color: C.s3, letterSpacing: "-0.04em", WebkitTextStroke: `1px ${C.s4}` }}>
                    {step.n}
                  </span>
                  <div>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}12`, border: `1px solid ${color}20` }}>
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

  // Parse numeric part and suffix (e.g. "~23h" → prefix "~", num 23, suffix "h")
  const match = val.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  const prefix = match?.[1] ?? "";
  const numStr = match?.[2] ?? "";
  const suffix = match?.[3] ?? "";
  const target = parseFloat(numStr) || 0;
  const isFloat = numStr.includes(".");
  const counted = useCountUp(target, 1600, triggered);
  const displayed = target > 0
    ? `${prefix}${isFloat ? counted.toFixed(1) : counted}${suffix}`
    : val;

  return (
    <div
      ref={ref}
      className="px-6 py-10 transition-all duration-500"
      style={{
        borderRight: index < 3 ? `1px solid ${C.s3}` : "none",
        opacity: triggered ? 1 : 0,
        transform: triggered ? "translateY(0)" : "translateY(16px)",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <p
        className="text-4xl font-extrabold mb-1.5 tabular-nums"
        style={{
          ...MF,
          letterSpacing: "-0.04em",
          background: `linear-gradient(135deg, ${C.text} 0%, ${C.glow} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {displayed}
      </p>
      <p className="text-xs font-semibold mb-1" style={{ ...IF, color: C.sub }}>{lbl}</p>
      <p className="text-[11px] leading-snug" style={{ ...IF, color: C.outline }}>{sub}</p>
    </div>
  );
}

/* ─── Stats ─────────────────────────────────────────────────────────── */
function Stats() {
  const { t } = useLang();
  return (
    <section style={{ backgroundColor: C.s1, borderTop: `1px solid ${C.s3}`, borderBottom: `1px solid ${C.s3}` }}>
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

/* ─── Pain Section ──────────────────────────────────────────────────── */
function PainSection() {
  const { t } = useLang();
  return (
    <section className="py-20 px-6" style={{ backgroundColor: C.s0 }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-12 bv-reveal">
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ ...IF, color: C.blue }}>{t.pain.tag}</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3" style={{ ...MF, color: C.text }}>{t.pain.h2}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {t.pain.avatars.map((a) => (
            <div key={a.type} className="rounded-2xl p-6 bv-reveal" style={{ backgroundColor: C.s1, border: `1px solid ${C.s3}` }}>
              <div className="text-3xl mb-3">{a.icon}</div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ ...IF, color: C.blue }}>{a.type}</p>
              <p className="text-sm leading-relaxed" style={{ ...IF, color: C.muted }}>{a.problem}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Insight Section ───────────────────────────────────────────────── */
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
    <section ref={ref} className="py-24 px-6" style={{ backgroundColor: C.bg }}>
      <div className="max-w-[860px] mx-auto text-center bv-reveal">
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ ...IF, color: C.blue }}>{t.insight.tag}</span>
        <div className="mt-6 mb-4">
          <span className="text-[5rem] md:text-[7rem] font-extrabold tabular-nums leading-none" style={{ ...MF, background: `linear-gradient(135deg, ${C.blue}, ${C.glow})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            {count}
          </span>
          <span className="text-2xl font-bold ml-2" style={{ ...MF, color: C.sub }}>{t.insight.statUnit}</span>
        </div>
        <p className="text-sm font-semibold mb-6" style={{ ...IF, color: C.muted }}>{t.insight.statLabel}</p>
        <p className="text-base leading-relaxed max-w-[52ch] mx-auto" style={{ ...IF, color: C.muted }}>{t.insight.body}</p>
      </div>
    </section>
  );
}

/* ─── Price Anchor Section ──────────────────────────────────────────── */
function PriceAnchorSection() {
  const { t } = useLang();
  return (
    <section className="py-20 px-6" style={{ backgroundColor: C.s0 }}>
      <div className="max-w-[700px] mx-auto text-center bv-reveal">
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ ...IF, color: C.blue }}>{t.anchor.tag}</span>
        <h2 className="text-2xl md:text-3xl font-bold mt-3 mb-2" style={{ ...MF, color: C.text }}>{t.anchor.h2}</h2>
        <p className="text-sm mb-10" style={{ ...IF, color: C.muted }}>{t.anchor.sub}</p>
        <div className="grid grid-cols-2 gap-4">
          {t.anchor.items.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl p-6 text-left"
              style={{
                backgroundColor: item.bad ? `${C.red}08` : `${C.green}08`,
                border: `1px solid ${item.bad ? `${C.red}20` : `${C.green}20`}`,
              }}
            >
              <p className="text-sm font-bold mb-1" style={{ ...IF, color: item.bad ? "#f87171" : C.green }}>{item.label}</p>
              <p className="text-2xl font-extrabold mb-2" style={{ ...MF, color: C.text }}>{item.cost}</p>
              <p className="text-xs" style={{ ...IF, color: C.muted }}>{item.note}</p>
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
    <section className="py-28" style={{ backgroundColor: C.bg }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
        <div
          className="rounded-2xl px-10 md:px-20 py-20 md:py-24 text-center relative overflow-hidden bv-reveal"
          style={{ backgroundColor: C.s1, border: `1px solid ${C.s3}` }}
        >
          {/* Glassmorphism glows */}
          <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px]"
            style={{ background: `radial-gradient(circle at 0% 0%, rgba(77,142,255,0.10) 0%, transparent 60%)` }} />
          <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px]"
            style={{ background: `radial-gradient(circle at 100% 100%, rgba(240,144,184,0.07) 0%, transparent 60%)` }} />
          <div className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, rgba(77,142,255,0.04) 0%, transparent 70%)` }} />

          <p className="text-[10px] font-bold tracking-[0.16em] uppercase mb-6 relative"
            style={{ ...IF, color: C.blue }}>{f.tag}</p>
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 relative"
            style={{ ...MF, color: C.text, letterSpacing: "-0.035em" }}>
            {f.h2a}<br />
            <span style={{
              background: `linear-gradient(135deg, ${C.blue} 0%, ${C.glow} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>{f.h2b}</span>
          </h2>
          <p className="text-base leading-relaxed mb-10 mx-auto relative whitespace-pre-line"
            style={{ ...IF, color: C.muted, maxWidth: "46ch" }}>
            {f.body}
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.97] justify-center"
            style={{
              ...IF,
              background: `linear-gradient(135deg, ${C.blue}, ${C.glow}90)`,
              color: "#fff",
              boxShadow: `0 0 0 1px ${C.blue}40`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${C.blue}55, 0 8px 32px ${C.blue}30`;
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${C.blue}40`;
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
  const { t } = useLang();
  const f = t.footer;
  return (
    <footer style={{ backgroundColor: C.s1, borderTop: `1px solid ${C.s3}` }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.glow})` }}>
                <BizLogo size={13} />
              </div>
              <span className="text-sm font-bold" style={{ ...MF, color: C.text }}>BizView</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ ...IF, color: C.muted, maxWidth: "26ch" }}>{f.tag}</p>
            <div className="flex items-center gap-2 mt-5">
              <div className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: C.green, animation: "bv-pulse-dot 2s ease-in-out infinite" }} />
              <span className="text-[10px]" style={{ ...IF, color: C.outline }}>{f.status}</span>
            </div>
          </div>
          {/* Link columns */}
          {f.cols.map((col) => (
            <div key={col.h}>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ ...IF, color: C.outline }}>{col.h}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <span
                      className="text-xs cursor-pointer transition-colors duration-150"
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

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: `1px solid ${C.s3}` }}>
          <p className="text-[11px]" style={{ ...IF, color: C.outline }}>{f.copy}</p>
          <div className="flex items-center gap-4">
            {[f.privacy, f.terms].map((l) => (
              <span key={l} className="text-[11px] cursor-pointer transition-colors duration-150"
                style={{ ...IF, color: C.outline }}
                onMouseEnter={e => (e.currentTarget.style.color = C.sub)}
                onMouseLeave={e => (e.currentTarget.style.color = C.outline)}
              >{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
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
        <FeatureMap />
        <FeatureAI />
        <InsightSection />
        <FeatureHowItWorks />
        <Stats />
        <PriceAnchorSection />
        <FinalCTA />
        <Footer />
      </div>
    </LangCtx.Provider>
  );
}
