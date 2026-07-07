"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Calendar, Clock, Ticket, PlayCircle, Sparkles, Zap, AlertTriangle,
  Search, Cog, Check, ArrowLeft, ShieldCheck, Loader2, MessageCircle, X
} from "lucide-react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/* ---- Modal Context --------------------------------------------------------- */
const ModalContext = React.createContext({ isOpen: false, open: () => {}, close: () => {} });

/* ---- Design tokens (aligned with LandingPage) ------------------------------ */
const C = {
  bg: "#07090f",
  s1: "#0b0e1a",
  s2: "#101422",
  outline: "#303858",
  muted: "#5a6480",
  sub: "#8e9ab8",
  text: "#dde4f8",
  blue: "#4f8bff",
  glow: "#93c5fd",
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
  gold: "#fbbf24",
} as const;

const MF: React.CSSProperties = { fontFamily: "var(--font-heebo, var(--font-manrope, system-ui))" };
const IF: React.CSSProperties = { fontFamily: "var(--font-heebo, var(--font-inter, system-ui))" };

const glassCard: React.CSSProperties = {
  backgroundColor: "rgba(11,14,26,0.82)",
  backdropFilter: "blur(20px) saturate(1.6)",
  WebkitBackdropFilter: "blur(20px) saturate(1.6)",
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 40px rgba(0,0,0,0.4)",
};

/* ---- Webinar target date: July 15, 20:00 (next occurrence) ----------------- */
function getTargetDate() {
  const now = new Date();
  const year = now.getFullYear();
  let target = new Date(year, 6, 15, 20, 0, 0); // month 6 = July
  if (target.getTime() < now.getTime()) {
    target = new Date(year + 1, 6, 15, 20, 0, 0);
  }
  return target;
}

/* ---- Ambient orb ----------------------------------------------------------- */
function Orb({ color, x, y, size = 600, opacity = 0.12 }: {
  color: string; x: string; y: string; size?: number; opacity?: number;
}) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: x, top: y, width: size, height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity, transform: "translate(-50%, -50%)", filter: "blur(1px)",
      }}
    />
  );
}

/* ---- Section wrapper ------------------------------------------------------- */
function Section({ children, bg = C.bg, className = "", id }: {
  children: React.ReactNode; bg?: string; className?: string; id?: string;
}) {
  return (
    <section id={id} className={`py-20 md:py-28 px-5 md:px-8 relative overflow-hidden ${className}`} style={{ backgroundColor: bg }}>
      {children}
    </section>
  );
}

/* ---- Register CTA button (scrolls to form) --------------------------------- */
function RegisterButton({ children, large, className = "" }: { children: React.ReactNode; large?: boolean; className?: string }) {
  const { open } = React.useContext(ModalContext);
  return (
    <button
      onClick={open}
      className={`group inline-flex items-center justify-center gap-2 font-extrabold transition-all duration-200 active:scale-[0.97] ${large ? "px-10 py-5 rounded-2xl text-lg md:text-xl" : "px-8 py-4 rounded-xl text-base"} ${className}`}
      style={{
        ...MF,
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
      {children}
      <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" strokeWidth={2.5} />
    </button>
  );
}

/* ---- Countdown timer ------------------------------------------------------- */
function Countdown() {
  const [target] = useState(getTargetDate);
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { v: left.d, l: "ימים" },
    { v: left.h, l: "שעות" },
    { v: left.m, l: "דקות" },
    { v: left.s, l: "שניות" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 md:gap-3" dir="ltr">
      {units.map((u, i) => (
        <React.Fragment key={u.l}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center tabular-nums"
              style={{
                ...glassCard,
                fontSize: "1.75rem",
                fontWeight: 800,
                color: C.text,
                ...MF,
              }}
            >
              {String(u.v).padStart(2, "0")}
            </div>
            <span className="text-[11px] font-medium" style={{ ...IF, color: C.muted }}>{u.l}</span>
          </div>
          {i < units.length - 1 && (
            <span className="text-2xl font-bold pb-5" style={{ color: C.outline }}>:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---- Event details strip --------------------------------------------------- */
function EventDetails() {
  const rows = [
    { icon: Calendar, text: "שידור חי אחד. ב-15.7, בשעה 20:00." },
    { icon: Ticket, text: "מספר המקומות מוגבל." },
    { icon: PlayCircle, text: "השיעור לא יעלה כהקלטה — מי שלא שם, לא רואה את זה." },
  ];
  return (
    <div className="flex flex-col gap-3 max-w-xl mx-auto">
      {rows.map((r) => (
        <div key={r.text} className="flex items-center gap-3 rounded-xl px-4 py-3" style={glassCard}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${C.blue}18` }}>
            <r.icon className="w-4 h-4" style={{ color: C.glow }} strokeWidth={2.2} />
          </div>
          <span className="text-sm md:text-[15px] font-medium text-right" style={{ ...IF, color: C.sub }}>{r.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ---- CTA block (reused) ---------------------------------------------------- */
function CtaBlock() {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <EventDetails />
      <p className="mt-6 text-[15px] md:text-base leading-relaxed" style={{ ...IF, color: C.sub }}>
        בתוך שעה תבין מה הסיבה שהעסק שלך תקוע, איפה בורח לך הכסף, ואיך הופכים את העסק למכונה.
        ובסוף אני אראה לך בדיוק איך מטמיעים את זה אצלך. כל מה שנשאר זה להחליט שאתה שם.
      </p>
      <p className="mt-4 text-base font-bold" style={{ ...MF, color: C.text }}>👇 שמור את המקום שלך עכשיו.</p>
      <div className="mt-6 flex justify-center">
        <RegisterButton large>אני רוצה מקום בהדרכה</RegisterButton>
      </div>
    </div>
  );
}

/* ============================================================================
   NAV
   ============================================================================ */
function Nav() {
  const { open } = React.useContext(ModalContext);
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "rgba(7,9,15,0.80)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-14 flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.png" alt="BizMap" style={{ width: 27, height: 27, objectFit: "contain" }} />
          <span className="text-sm font-bold tracking-tight" style={{ ...MF, color: C.text }}>BizMap</span>
        </Link>
        <button
          onClick={open}
          className="text-xs md:text-sm font-bold px-4 py-2 rounded-lg transition-all duration-200"
          style={{ ...MF, background: `${C.blue}18`, color: C.glow, border: `1px solid ${C.blue}30` }}
        >
          שמור מקום
        </button>
      </div>
    </header>
  );
}

/* ============================================================================
   HERO
   ============================================================================ */
function Hero() {
  return (
    <Section className="pt-32 md:pt-40 pb-16 md:pb-24" bg={C.bg}>
      <Orb color={C.blue} x="15%" y="10%" size={700} opacity={0.14} />
      <Orb color={C.purple} x="85%" y="40%" size={620} opacity={0.12} />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <p className="text-sm md:text-base font-semibold mb-6" style={{ ...IF, color: C.amber }}>
          במיוחד לבעלי עסקים שמרגישים שהם מפגרים מאחור במהפכת ה-AI
        </p>

        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7"
          style={{ background: `${C.green}15`, border: `1px solid ${C.green}30` }}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: C.green }} strokeWidth={2.5} />
          <span className="text-xs font-bold tracking-wide" style={{ ...MF, color: C.green }}>הדרכה חינם · ללא עלות</span>
        </div>

        <h1
          className="text-3xl md:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.15] mb-6"
          style={{ ...MF, color: C.text }}
        >
          איך בעלי עסקים בדיוק כמוכם חוסכים{" "}
          <span style={{ color: C.glow }}>10,000₪+</span> כל חודש
          <br className="hidden md:block" />
          {" "}ומייצרים עסק עם יתרון{" "}
          <span
            style={{
              background: `linear-gradient(120deg, ${C.blue}, ${C.purple})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >״לא חוקי״</span>{" "}
          בעזרת בינה מלאכותית.
        </h1>

        <p className="text-base md:text-xl leading-relaxed max-w-2xl mx-auto mb-10" style={{ ...IF, color: C.sub }}>
          שלב אחרי שלב — איך בעלי עסקים הופכים מ״רק להתייעץ עם הצ׳אט״ למצב שיש להם
          מערכת בינה מלאכותית אוטונומית שעובדת בשבילם <span style={{ color: C.text, fontWeight: 700 }}>24/7</span>.
        </p>

        <div className="mb-10">
          <p className="text-xs font-semibold tracking-wider uppercase mb-4" style={{ ...IF, color: C.muted }}>
            השידור מתחיל בעוד
          </p>
          <Countdown />
        </div>

        <CtaBlock />
      </div>
    </Section>
  );
}

/* ============================================================================
   PAIN — "לכולם כבר נפל האסימון"
   ============================================================================ */
function Pain() {
  return (
    <Section bg={C.s1}>
      <Orb color={C.red} x="20%" y="60%" size={500} opacity={0.08} />
      <div className="max-w-3xl mx-auto relative z-10">
        <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-8" style={{ ...MF, color: C.text }}>
          לכולם כבר נפל האסימון. חוץ מ...?
        </h2>

        <div className="rounded-2xl p-6 md:p-8 mb-6" style={glassCard}>
          <p className="text-base md:text-lg leading-relaxed" style={{ ...IF, color: C.sub }}>
            אחד כבר הקים אתר עם AI. השני החליף מערכת CRM. ועוד אחד כבר פיטר עובד.
          </p>
          <p className="text-base md:text-lg leading-relaxed mt-4" style={{ ...IF, color: C.sub }}>
            ואתה? פתחת את הצ׳אט, שילמת 20 דולר — ומשם זה נעצר.
            וזה מרגיש כאילו כולם קפצו על רכבת אחת, ולך אין כרטיס למסיבה.
          </p>
        </div>

        <div
          className="rounded-2xl p-6 md:p-8"
          style={{ ...glassCard, border: `1px solid ${C.amber}25`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 30px ${C.amber}10` }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5" style={{ color: C.amber }} strokeWidth={2.2} />
            <span className="text-sm font-bold" style={{ ...MF, color: C.amber }}>אבל הנה מה שאף אחד לא אומר לך:</span>
          </div>
          <p className="text-base md:text-lg leading-relaxed" style={{ ...IF, color: C.text }}>
            זה לא שאתה לא טכנולוגי. זה לא שאין לך זמן. וזה בטח לא שה-AI לא מתאים לעסק שלך.
          </p>
          <p className="text-base md:text-lg leading-relaxed mt-4" style={{ ...IF, color: C.sub }}>
            הסיבה האמיתית שזה עוד לא קרה היא אחת בלבד — ורוב בעלי העסקים אפילו לא יודעים שהיא שם.
            (כן, גם אלה שפתאום הפכו ל״מומחים״ בזה.)
          </p>
          <p className="text-base md:text-lg leading-relaxed mt-4 font-semibold" style={{ ...MF, color: C.glow }}>
            בהדרכה הזאת, בשידור חי, אני הולך להראות לך בדיוק מה היא ואיך לסגור אותה —
            ולייצר עסק עם יתרון ״לא חוקי״ בעזרת בינה מלאכותית.
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   WHAT YOU'LL LEARN — 3 items
   ============================================================================ */
function Curriculum() {
  const items = [
    {
      num: "①",
      icon: Zap,
      color: C.blue,
      title: "הסיבה האמיתית שניסיתם AI וזה לא הזיז כלום",
      body: "למה ChatGPT, יועצים וכלי אוטומציה נתנו לכם המלצות גנריות שלא שינו דבר — וזה לא מה שאתם חושבים. ברגע שתראו את זה, לא תוכלו יותר להסתפק בתוצאות גנריות בעולם הבינה המלאכותית.",
    },
    {
      num: "②",
      icon: Search,
      color: C.amber,
      title: "איפה בדיוק העסק שלכם מדמם כסף כרגע",
      body: "נראה בלייב איך מאתרים את ״הדליפה הגדולה״ — המקום שממנו בורחים עשרות אלפי שקלים בשנה בלי שמרגישים. ואיך מזהים את התהליך האחד שאם משנים אותו — הוא לבדו מחזיר את כל ההשקעה.",
    },
    {
      num: "③",
      icon: Cog,
      color: C.purple,
      title: "איך הופכים את העסק למכונה",
      body: "בלי לגייס, בלי ידע טכני, ובלי לשבור מה שכבר עובד. המנגנון שמאפשר לעבוד פחות שעות ולהכניס יותר — איך זה נראה כשעסק מפסיק לכבות שריפות ומתחיל לרוץ לבד, עם מכפיל כוח של בינה מלאכותית ויתרון ״לא חוקי״ על כל מי שעדיין מחפש את הפתרון.",
    },
  ];

  return (
    <Section bg={C.bg}>
      <Orb color={C.blue} x="80%" y="20%" size={560} opacity={0.1} />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ ...MF, color: C.text }}>
            מה יהיה בהדרכה
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto" style={{ ...IF, color: C.sub }}>
            בשידור הזה לא נדבר על AI בתאוריה. ניקח עקרונות של עסק אמיתי, נפרק אותם שלב אחרי שלב,
            ותראו בזמן אמת איך הופכים עסק רגיל למכונה שעובדת גם כשאתם לא שם.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl p-6 md:p-7 flex flex-col" style={glassCard}>
              <div className="flex items-center justify-between mb-5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: `${it.color}18`, border: `1px solid ${it.color}30` }}
                >
                  <it.icon className="w-5 h-5" style={{ color: it.color }} strokeWidth={2.2} />
                </div>
                <span className="text-3xl font-extrabold" style={{ ...MF, color: `${it.color}` }}>{it.num}</span>
              </div>
              <h3 className="text-lg font-bold mb-3 leading-snug" style={{ ...MF, color: C.text }}>{it.title}</h3>
              <p className="text-sm leading-relaxed" style={{ ...IF, color: C.sub }}>{it.body}</p>
            </div>
          ))}
        </div>

        <p className="text-center mt-10 text-sm font-medium" style={{ ...IF, color: C.muted }}>
          (אתם לא רוצים שהמתחרים שלכם יהיו שם — ואתם לא.)
        </p>
      </div>
    </Section>
  );
}

/* ============================================================================
   MID CTA
   ============================================================================ */
function MidCta() {
  return (
    <Section bg={C.s1}>
      <Orb color={C.blue} x="50%" y="50%" size={640} opacity={0.1} />
      <div className="relative z-10">
        <CtaBlock />
      </div>
    </Section>
  );
}

/* ============================================================================
   ABOUT — עמית ועקנין
   ============================================================================ */
function About() {
  return (
    <Section bg={C.bg}>
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="h-px w-10" style={{ background: C.outline }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ ...MF, color: C.muted }}>מי מעביר את ההדרכה</span>
          <div className="h-px w-10" style={{ background: C.outline }} />
        </div>

        <div className="rounded-2xl p-7 md:p-9 space-y-5" style={glassCard}>
          <p className="text-base md:text-lg leading-relaxed" style={{ ...IF, color: C.text }}>
            קוראים לי <span style={{ color: C.glow, fontWeight: 700 }}>עמית ועקנין</span>, ואני בעל סוכנות שיווק
            שעבדה עם מאות בעלי עסקים — מכל התחומים ובכל הגדלים. מאנשים שרק הקימו עסק, ועד חברות גדולות.
          </p>
          <p className="text-base md:text-lg leading-relaxed" style={{ ...IF, color: C.sub }}>
            במשך השנים, בזמן שעזרתי להם להביא יותר לקוחות ולהגדיל מכירות, התחילה לחזור אותה שאלה — שוב ושוב,
            כמעט בכל שיחה: ״עמית, איך אני מייעל את עצמי עוד יותר? איפה אני יכול לחסוך זמן? ואיפה הבינה המלאכותית
            יכולה להקפיץ אותי לשלב הבא?״
          </p>
          <p className="text-base md:text-lg leading-relaxed" style={{ ...IF, color: C.sub }}>
            ובשלב מסוים הבנתי משהו: רוב בעלי העסקים לא צריכים עוד יועץ שגובה עשרות אלפי שקלים ונותן עצה כללית.
            הם צריכים דרך לראות את העסק שלהם מלמעלה — ולדעת בדיוק איפה הבינה המלאכותית יכולה לעזור להם.
            אז במקום לענות על אותה שאלה עוד אלף פעם — החלטתי לבנות את התשובה.
          </p>
          <p className="text-base md:text-lg leading-relaxed" style={{ ...IF, color: C.sub }}>
            יחד איתי עומדים שני השותפים הטכנולוגיים שלי — בעלי בית תוכנה לפיתוח פתרונות בינה מלאכותית, אפליקציות
            ומערכות חכמות לעסקים. הם התחילו לכתוב קוד הרבה לפני שבכלל היה דבר כזה ״כלי AI״.
          </p>
          <p className="text-base md:text-lg leading-relaxed font-semibold" style={{ ...MF, color: C.text }}>
            וביחד, הטמענו בתוך המערכת ידע עסקי של עשרות שנים, אלפי בעלי עסקים שראינו מקרוב, וחודשים ארוכים של
            מחקר בבינה מלאכותית.
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   URGENCY — אז מה עכשיו?
   ============================================================================ */
function Urgency() {
  return (
    <Section bg={C.s1}>
      <Orb color={C.purple} x="25%" y="30%" size={520} opacity={0.1} />
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h2 className="text-2xl md:text-4xl font-extrabold mb-6" style={{ ...MF, color: C.text }}>
          אז מה עכשיו?
        </h2>
        <p className="text-base md:text-lg leading-relaxed mb-4" style={{ ...IF, color: C.sub }}>
          בזמן שאתה קורא את זה, יש בעלי עסקים בתחום שלך שכבר שריינו מקום.
        </p>
        <p className="text-base md:text-lg leading-relaxed mb-10" style={{ ...IF, color: C.sub }}>
          בעוד כמה שבועות חלק מהם כבר יעבדו פחות שעות, יכניסו יותר, ויהיו צעד אחד לפניך — פשוט כי הם עשו
          את הצעד הזה בזמן. וההדרכה הזאת היא בדיוק הרגע להצטרף.
        </p>
        <CtaBlock />
      </div>
    </Section>
  );
}

/* ============================================================================
   REGISTRATION MODAL
   ============================================================================ */
function RegisterModal() {
  const { isOpen, close } = React.useContext(ModalContext);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const leadTrackedRef = useRef(false);

  const isValidPhone = (p: string) => /^05\d{8}$/.test(p.replace(/\D/g, ""));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading" || status === "success") return;
    setError("");
    if (!name.trim()) { setError("נא למלא שם מלא"); return; }
    if (!isValidPhone(phone)) { setError("נא להזין מספר טלפון תקין (05XXXXXXXX)"); return; }

    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.replace(/\D/g, ""), source: "webinar" }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      if (!leadTrackedRef.current && typeof window !== "undefined" && window.fbq) {
        leadTrackedRef.current = true;
        window.fbq('track', 'Lead');
      }
    } catch {
      setStatus("error");
      setError("משהו השתבש. נסה שוב או פנה אלינו.");
    }
  };

  const inputStyle: React.CSSProperties = {
    ...IF,
    backgroundColor: "rgba(5,7,16,0.6)",
    border: `1px solid ${C.outline}`,
    color: C.text,
  };

  const getCalendarUrl = () => {
    const date = getTargetDate();
    const start = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(date.getTime() + 90 * 60000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("הדרכת AI לעסקים - BizMap")}&dates=${start}/${end}&details=${encodeURIComponent("הדרכה מיוחדת על שימוש בבינה מלאכותית לייעול העסק.\n\nקישור לשידור יישלח בסמוך למועד ההדרכה.")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={close} />
      <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in duration-200">
        <button onClick={close} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="rounded-2xl relative overflow-hidden" style={{ backgroundColor: C.bg, border: `1px solid ${C.outline}`, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)" }}>
          <Orb color={C.blue} x="50%" y="30%" size={680} opacity={0.14} />
          <div className="relative z-10 p-6 md:p-8">
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 mt-2"
                style={{ background: `${C.blue}15`, border: `1px solid ${C.blue}30` }}
              >
                <Calendar className="w-3.5 h-3.5" style={{ color: C.glow }} strokeWidth={2.5} />
                <span className="text-xs font-bold" style={{ ...MF, color: C.glow }}>15.7 · 20:00 · שידור חי</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3" style={{ ...MF, color: C.text }}>
                שמור את המקום שלך בהדרכה
              </h2>
              <p className="text-sm md:text-base" style={{ ...IF, color: C.sub }}>
                מספר המקומות מוגבל. השאר פרטים ונשמור לך מקום לשידור החי.
              </p>
            </div>

            {status === "success" ? (
              <div
                className="rounded-2xl p-8 text-center"
                style={{ ...glassCard, border: `1px solid ${C.green}30`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 40px ${C.green}15` }}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${C.green}18` }}>
                  <Check className="w-7 h-7" style={{ color: C.green }} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ ...MF, color: C.text }}>המקום שלך שמור! 🎉</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ ...IF, color: C.sub }}>
                  נשלח לך תזכורת עם קישור לשידור לפני שהוא מתחיל. נתראה ב-15.7 בשעה 20:00.
                </p>
                <div className="flex flex-col gap-3 max-w-sm mx-auto">
                  <a
                    href="https://chat.whatsapp.com/L5YSVCMCtJa77yLX7Do6FG?mode=gi_t"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 font-extrabold px-6 py-3 rounded-xl text-base transition-all duration-200 active:scale-[0.98] hover:opacity-90"
                    style={{
                      ...MF,
                      background: "#25D366",
                      color: "#ffffff",
                      boxShadow: "0 4px 14px rgba(37, 211, 102, 0.4)",
                    }}
                  >
                    <MessageCircle className="w-5 h-5" strokeWidth={2.5} />
                    להצטרפות לקבוצת הוואטסאפ השקטה
                  </a>
                  <a
                    href={getCalendarUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 font-extrabold px-6 py-3 rounded-xl text-base transition-all duration-200 active:scale-[0.98] hover:opacity-90"
                    style={{
                      ...MF,
                      background: `${C.blue}18`,
                      color: C.glow,
                      border: `1px solid ${C.blue}40`,
                    }}
                  >
                    <Calendar className="w-5 h-5" strokeWidth={2.5} />
                    הוסף ליומן (Google Calendar)
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ ...MF, color: C.sub }}>שם מלא</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ישראל ישראלי"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors focus:border-[#4f8bff]"
                    style={inputStyle}
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ ...MF, color: C.sub }}>טלפון נייד</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="050-0000000"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors focus:border-[#4f8bff]"
                    style={inputStyle}
                    dir="rtl"
                  />
                </div>

                {error && (
                  <p className="text-sm font-medium" style={{ ...IF, color: C.red }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full inline-flex items-center justify-center gap-2 font-extrabold py-4 rounded-xl text-base transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
                  style={{
                    ...MF,
                    background: `linear-gradient(135deg, ${C.blue}, ${C.purple}90)`,
                    color: "#fff",
                    boxShadow: `0 0 0 1px ${C.blue}40, 0 6px 24px ${C.blue}30`,
                  }}
                >
                  {status === "loading" ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> שולח...</>
                  ) : (
                    <>אני רוצה מקום בהדרכה <ArrowLeft className="w-5 h-5" strokeWidth={2.5} /></>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: C.muted }} />
                  <span className="text-xs" style={{ ...IF, color: C.muted }}>הפרטים שלך מאובטחים ולא יועברו לאף אחד.</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   FOOTER
   ============================================================================ */
function Footer() {
  return (
    <footer className="py-10 px-6 text-center" style={{ backgroundColor: C.s2, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center justify-center gap-2.5 mb-4">
        <img src="/logo.png" alt="BizMap" style={{ width: 27, height: 27, objectFit: "contain" }} />
        <span className="text-sm font-bold" style={{ ...MF, color: C.text }}>BizMap</span>
      </div>
      <div className="flex items-center justify-center gap-5 mb-4 text-xs" style={{ ...IF, color: C.muted }}>
        <Link href="/privacy" className="hover:opacity-80 transition-opacity">מדיניות פרטיות</Link>
        <Link href="/terms" className="hover:opacity-80 transition-opacity">תנאי שימוש</Link>
      </div>
      <p className="text-xs" style={{ ...IF, color: C.muted }}>
        © {new Date().getFullYear()} BizMap. כל הזכויות שמורות.
      </p>
    </footer>
  );
}

/* ============================================================================
   PAGE
   ============================================================================ */
export default function WebinarPage() {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ModalContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      <div ref={ref} dir="rtl" style={{ backgroundColor: C.bg, minHeight: "100vh" }}>
        <Nav />
        <main>
          <Hero />
          <Pain />
          <Curriculum />
          <MidCta />
          <About />
          <Urgency />
        </main>
        <Footer />
        <RegisterModal />
      </div>
    </ModalContext.Provider>
  );
}
