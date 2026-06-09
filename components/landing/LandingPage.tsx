"use client";

import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, ChevronDown, Zap, Shield, Brain, CheckCircle, Check,
  Target, TrendingUp, Users, MessageSquare, Search, Gift,
  Star, Clock, DollarSign, ArrowRight, Globe, ChevronRight,
} from "lucide-react";
import { CosmicParallaxBg } from "@/components/ui/parallax-cosmic-background";
import { useLanguage } from "@/lib/i18n";

/* ---- Framer Motion variants ------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/* ---- Design tokens --------------------------------------------------------- */
const C = {
  bg:      "#07090f",
  s0:      "#050710",
  s1:      "#0b0e1a",
  s2:      "#101422",
  s3:      "#171c2e",
  s4:      "#1f2438",
  outline: "#303858",
  muted:   "#5a6480",
  sub:     "#8e9ab8",
  text:    "#dde4f8",
  blue:    "#4f8bff",
  glow:    "#93c5fd",
  green:   "#10b981",
  amber:   "#f59e0b",
  red:     "#ef4444",
  purple:  "#8b5cf6",
  gold:    "#fbbf24",
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

const glassCardHover = (color: string = C.blue): React.CSSProperties => ({
  border: `1px solid ${color}30`,
  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px ${color}15, 0 8px 40px rgba(0,0,0,0.5), 0 0 30px ${color}12`,
});

/* ---- Scroll reveal --------------------------------------------------------- */
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

/* ---- Shared logo ----------------------------------------------------------- */
function BizLogo({ size = 14 }: { size?: number }) {
  return (
    <img src="/logo.png" alt="BizMap" style={{ width: size * 1.5, height: size * 1.5, objectFit: "contain" }} />
  );
}

/* ---- Ambient orb ----------------------------------------------------------- */
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

/* ---- CTA Button ------------------------------------------------------------ */
function CTAButton({ children, large, className = "" }: { children: React.ReactNode; large?: boolean; className?: string }) {
  return (
    <Link
      href="/checkout"
      className={`inline-flex items-center justify-center gap-2 font-extrabold transition-all duration-200 active:scale-[0.97] ${large ? "px-12 py-6 rounded-2xl text-lg md:text-xl" : "px-9 py-4 rounded-xl text-base"} ${className}`}
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
      <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
    </Link>
  );
}

/* ============================================================================
   NAV
   ============================================================================ */
function Nav() {
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
          {["איך זה עובד", "מה מקבלים", "מחיר"].map((l) => (
            <a
              key={l}
              href={l === "איך זה עובד" ? "#method" : l === "מה מקבלים" ? "#offer" : "#pricing"}
              className="text-xs font-medium cursor-pointer transition-colors duration-200"
              style={{ ...IF, color: C.muted }}
              onMouseEnter={e => (e.currentTarget.style.color = C.sub)}
              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
            >{l}</a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login?auth=1"
            className="hidden sm:block text-xs font-medium transition-colors duration-200"
            style={{ ...IF, color: C.muted }}
            onMouseEnter={e => (e.currentTarget.style.color = C.sub)}
            onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
          >{"התחבר"}</Link>

          <Link
            href="/checkout"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-[0.97]"
            style={{
              ...IF,
              background: `linear-gradient(135deg, ${C.blue}, ${C.purple}80)`,
              color: "#fff",
              boxShadow: `0 0 0 1px ${C.blue}30, 0 4px 16px ${C.blue}20`,
            }}
          >
            {"אני רוצה את המפה"}
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ============================================================================
   HERO
   ============================================================================ */
function Hero() {
  return (
    <section
      className="min-h-[100dvh] flex flex-col items-center justify-center pt-24 pb-16 px-5 md:px-8 relative overflow-hidden"
      style={{ backgroundColor: C.bg }}
    >
      <CosmicParallaxBg loop={true} />
      <Orb color={C.blue} x="20%" y="30%" size={700} opacity={0.09} />
      <Orb color={C.purple} x="80%" y="20%" size={500} opacity={0.07} />

      <motion.div
        className="relative z-10 text-center max-w-[900px] mx-auto"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="mb-8 flex justify-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs md:text-sm font-bold text-center leading-relaxed"
            style={{
              ...IF,
              backgroundColor: `rgba(79,139,255,0.08)`,
              border: `1px solid rgba(79,139,255,0.2)`,
              color: C.glow,
              backdropFilter: "blur(8px)",
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
            {"לבעלי עסקים שמפגרים מאחור במהפכת ה-AI \u2014 ורוצים יתרון \u201Cלא חוקי\u201D"}
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] lg:text-[4.2rem] font-black leading-[1.12] tracking-[-0.03em] mb-7"
          style={{ ...MF, color: C.text }}
        >
          {"בכמה דקות הקרובות תוכלו להבין בדיוק איפה העסק "}
          <span style={{
            background: `linear-gradient(135deg, ${C.blue}, ${C.glow})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            {"מפסיד כסף כרגע"}
          </span>
          {" ואיך AI יכול לחסוך לכם אלפי שקלים כל חודש ולהפוך את המתחרים ללא רלוונטים."}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-base md:text-lg lg:text-xl leading-relaxed mb-10 mx-auto font-medium"
          style={{ ...IF, color: C.sub, maxWidth: "56ch" }}
        >
          {"בלי לשלם ליועץ יקר שלא מכיר את העסק שלך, בלי להיות מתכנת או לכתוב שורת קוד אחת, ובלי לשנות את מה שכבר עובד"}
        </motion.p>

        {/* CTA */}
        <motion.div variants={fadeUp} className="flex justify-center mb-8">
          <CTAButton large>{"אני רוצה לראות את העסק שלי מלמעלה"}</CTAButton>
        </motion.div>

        {/* Trust indicators */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
          {[
            "תוך דקות בודדות",
            "אחריות 100% החזר כספי",
            "ללא ידע טכני",
          ].map((text) => (
            <div key={text} className="flex items-center gap-1.5 text-xs md:text-base font-bold" style={{ ...IF, color: C.muted }}>
              <CheckCircle className="w-4 h-4 shrink-0" style={{ color: C.green }} strokeWidth={2.5} />
              {text}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ============================================================================
   PROBLEM / PAIN
   ============================================================================ */
function ProblemSection() {
  return (
    <Section bg={C.s0}>
      <div className="max-w-[800px] mx-auto relative">
        <Orb color={C.blue} x="50%" y="50%" size={700} opacity={0.04} />

        {/* Title */}
        <div className="text-center mb-14 bv-reveal">
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight" style={{ ...MF, color: C.text }}>
            {"לכולם כבר נפל האסימון"}
          </h2>
        </div>

        {/* Main problem text */}
        <div className="rounded-3xl p-8 md:p-12 bv-reveal mb-14" style={{ ...glassCard }}>
          <div className="text-base md:text-lg leading-[1.9] font-medium space-y-5" style={{ ...IF, color: C.sub }}>
            <p>{"אחד כבר הקים אתר עם AI."}<br />{"השני כבר החליף את מערכת ה-CRM שלו."}<br />{"ועוד אחד כבר פיטר עובד, ושלא נדבר על החברות הגדולות שמפטרות עשרות אלפי אנשים."}</p>
            <p>{"לדבר עם הצ\u2019אט ולשלם 20 דולר על מנוי ולא למצות אותו,"}<br />
              <strong style={{ color: C.text }}>{"זה עדיין לא להיות חלק מהמהפכה."}</strong>
            </p>
            <p>{"כי המהפכה האמיתית לא תלויה בכלים."}<br />
              {"היא מתחילה כשמבינים בדיוק "}
              <strong style={{ color: C.text }}>{"מה לשנות בעסק שלך ספציפית."}</strong>
            </p>
            <p>{"לא בעסק כללי. לא בעסק של מישהו אחר."}<br />
              {"בעסק הזה, עם העובדים האלה, עם התהליכים האלה."}
            </p>
            <p>{"וזה בדיוק מה שרוב בעלי העסקים עדיין לא עשו."}</p>
            <p>{"הסיבה שזה לא קרה עדיין היא לא עצלנות,"}<br />
              {"זה לא פחד מטכנולוגיה,"}<br />
              {"וזה בטח לא חוסר רצון."}
            </p>
            <p>{"מי שמנהל עסק עם כמה עובדים או ספקים יודע טוב מאוד שמשהו צריך להשתנות."}</p>
            <p style={{ color: C.text, fontWeight: 700 }}>
              {"הבעיה היא שבמירוץ היום יום, אין את היכולת לקבל תמונה מלמעלה של העסק."}
            </p>
            <p>{"כי מי שבתוך העסק לא יכול לראות איפה הכסף בורח."}<br />
              {"לא יכול לראות איזה עובד עושה עבודה שAI יכול לעשות פי עשר יותר טוב ומהר."}<br />
              {"לא יכול לראות איזה תהליך אחד קטן, אם ישתנה \u2014 יחסוך עשרות אלפי שקלים בשנה הקרובה."}
            </p>
          </div>
        </div>

        {/* Failed solutions */}
        <div className="grid gap-5 mb-14">
          {[
            {
              icon: <Users className="w-5 h-5" />,
              title: "יועץ יכול לעזור בזה?",
              body: "יועץ מגיע, שואל שאלות, ובסוף נותן המלצות שמתאימות לכל עסק \u2014 בלי התאמה למי שמאחורי העסק, בלי התאמה לחדשנות ולכלים החדשים שיוצאים כל יום.",
            },
            {
              icon: <Users className="w-5 h-5" />,
              title: "עובדים חדשים?",
              body: "עוד עובד אמור לפתור את הבעיה. אבל כדי לגייס עובד נדרשת הכשרה, ניהול שלו, בקרה שלו \u2014 ולקחת בחשבון שבחודשים הראשונים התשלום אליו יעבור ב-10 לחודש למרות ש-20%-50% מהעבודה שלו נעשתה על ידך. כמובן שזה דורש גם עוד ניהול, עוד עלויות, עוד שריפות לכבות.",
            },
            {
              icon: <Zap className="w-5 h-5" />,
              title: "מערכות ואוטומציות?",
              body: "לעבור ולנסות כלי אחרי כלי. אנשי אוטומציות שלוקח להם ימים ולילות לבצע שינויים קטנים, ובעיקר חוסר אונים שאיכשהו צריך לחכות יומיים בשביל עבודה שלוקחת להם רגע. ובסוף אותו בלבול, רק עם יותר סיסמאות לזכור.",
            },
          ].map((sub, i) => (
            <div
              key={i}
              className={`rounded-2xl p-7 md:p-8 bv-reveal bv-reveal-d${i + 1}`}
              style={{ ...glassCard, borderRight: `4px solid ${C.red}80` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${C.red}15`, color: C.red }}>
                  {sub.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold" style={{ ...MF, color: C.text }}>{sub.title}</h3>
              </div>
              <p className="text-[17px] md:text-lg leading-relaxed font-medium font-medium" style={{ ...IF, color: C.muted }}>{sub.body}</p>
            </div>
          ))}
        </div>

        {/* Transition */}
        <div className="rounded-3xl p-8 md:p-12 bv-reveal text-center" style={{ ...glassCard, border: `1px solid ${C.blue}25` }}>
          <div className="text-base md:text-lg leading-[1.9] font-medium space-y-5" style={{ ...IF, color: C.sub }}>
            <p style={{ color: C.text, fontWeight: 800, fontSize: "1.4rem" }}>
              {"הבעיה לא הייתה הפתרונות."}
              <br />
              {"הבעיה הייתה שאף אחד לא התחיל מהעסק עצמו."}
            </p>
            <p>{"כי לפני שיודעים מה לשנות \u2014 צריך לראות את העסק מלמעלה."}</p>
            <p>{"לראות איפה הזמן הולך. איפה הכסף בורח. איפה עובד אחד עם AI יכול לעשות עבודה של שלושה."}<br />
              {"וזה בדיוק מה שיועצים וכלים לא עושים."}<br />
              {"הם מגיעים עם תשובה לפני שהבינו את השאלה."}
            </p>
            <p style={{ color: C.blue, fontWeight: 800, fontSize: "1.5rem" }}>
              {"וזאת הסיבה שיצרנו את BizMap"}
            </p>
            <p>{"כל עסק עם כמה עובדים או ספקים מכיל בתוכו לפחות 2-3 תהליכים שאפשר להפוך אותם לכפול עשר עם AI."}<br />
              {"לא בעזרת תקציב ענק. לא בעזרת ידע טכנולוגי."}<br />
              <strong style={{ color: C.blue, fontSize: "1.2em" }}>{"רק בעזרת הבנה מדויקת של איפה להתחיל ומה בדיוק לעשות."}</strong>
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   VISION — "Imagine in a few minutes"
   ============================================================================ */
function VisionSection() {
  return (
    <Section bg={C.bg}>
      <div className="max-w-[800px] mx-auto relative text-center">
        <Orb color={C.purple} x="50%" y="50%" size={600} opacity={0.06} />

        <div className="bv-reveal space-y-6">
          <h2 className="text-3xl md:text-5xl font-black leading-tight" style={{ ...MF, color: C.text }}>
            {"אז הגיע הזמן להכיר את BizMap\u2026"}
          </h2>

          <p className="text-base md:text-lg leading-[1.9] font-medium" style={{ ...IF, color: C.sub }}>
            {"דמיינו שעוד כמה דקות מעכשיו אפשר לדעת בדיוק "}
            <strong style={{ color: C.text }}>{"איפה נשרפות עשרות שעות בחודש"}</strong>
            {", איפה אפשר "}
            <strong style={{ color: C.text }}>{"לחסוך אלפי שקלים בהוצאות כל חודש"}</strong>
            {", ולקבל את התובנות המדויקות ביותר על העסק שלך לפני שהמתחרים בכלל מבינים מה קרה."}
          </p>

          <p className="text-base md:text-lg leading-[1.9] font-medium" style={{ ...IF, color: C.sub }}>
            {"לא עצה כללית, לא \u201Cמה שעובד לכולם\u201D, אלא "}
            <strong style={{ color: C.blue }}>{"מפה מדויקת של העסק שלך."}</strong>
          </p>

          <p className="text-base md:text-lg leading-[1.9] font-medium" style={{ ...IF, color: C.sub }}>
            {"מאיפה הכסף בורח, איזה תהליך להפוך ל-10x, ומה הצעד האחד שמתחילים ממנו עוד היום."}
          </p>

          <p className="text-xl md:text-2xl font-extrabold mt-8" style={{ ...MF, color: C.text }}>
            {"זה בדיוק מה ש-BizMap באה לעשות \u2014 וזה לא דומה לשום דבר שניסיתם עד היום."}
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   BIZMAP PRODUCT REVEAL
   ============================================================================ */
function ProductReveal() {
  return (
    <Section bg={C.s0} id="offer">
      <div className="max-w-[900px] mx-auto relative text-center">
        <Orb color={C.blue} x="50%" y="30%" size={800} opacity={0.08} />

        {/* Big name reveal */}
        <div className="bv-reveal mb-12">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6"
            style={{
              ...MF,
              background: `linear-gradient(135deg, ${C.blue}, ${C.glow}, ${C.purple})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: `drop-shadow(0 0 40px ${C.blue}30)`,
            }}
          >
            BizMap
          </motion.h2>
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ ...IF, color: C.sub }}>
            {"המערכת היחידה שממפה את העסק הספציפי שלך מלמעלה ומראה בדיוק את הצעדים שיביאו לכם יתרון \u201Cלא חוקי\u201D במהפכה הזאת"}
          </p>
        </div>

        {/* Mockup placeholder */}
        <div className="bv-reveal mb-6 relative">
          <div
            className="absolute -inset-4 rounded-3xl blur-2xl opacity-30"
            style={{ background: `linear-gradient(135deg, ${C.blue}40, ${C.purple}30, ${C.blue}20)` }}
          />
          <div
            className="relative rounded-2xl overflow-hidden mx-auto max-w-[800px]"
            style={{ ...glassCard, boxShadow: `0 40px 100px rgba(0,0,0,0.8), 0 0 80px ${C.blue}20, 0 0 120px ${C.purple}10`, border: `1px solid ${C.blue}25` }}
          >
            <HeroBrowserMockup />
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---- Browser mockup -------------------------------------------------------- */
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
    <div className="select-none">
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
            bizmapai.com/dashboard
          </div>
        </div>
      </div>

      {/* App shell */}
      <div className="flex" style={{ minHeight: 420 }}>
        {/* Sidebar */}
        <div
          className="w-40 shrink-0 flex-col py-3 px-2 hidden md:flex"
          style={{ backgroundColor: "rgba(8,10,18,0.95)", borderLeft: "1px solid rgba(255,255,255,0.05)" }}
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
              <span className="text-[9px]" style={{ ...IF, color: C.muted }}>5 departments</span>
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
                    border: `1px solid ${dept.color}25`,
                    boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 20px ${dept.color}10`,
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

/* ============================================================================
   WHAT YOU GET — 4 main deliverables
   ============================================================================ */
function WhatYouGet() {
  const deliverables = [
    {
      num: "1",
      title: "האפיון המדויק על העסק שלכם",
      body: "תוך כמה דקות המערכת לומדת בדיוק מי אתם, מה כל עובד עושה, לאן הולך הזמן ומה חוזר על עצמו כל שבוע. הבסיס שכל יועץ גובה עליו אלפי שקלים \u2014 רק מדויק יותר.",
      value: "3,000",
      valueLabel: "פגישת אפיון עם יועץ עסקי",
      color: C.blue,
      icon: <Target className="w-5 h-5" />,
    },
    {
      num: "2",
      title: "המפה של העסק \u2014 מלמעלה, בפעם הראשונה",
      body: "תמונה מדויקת ומלאה של כל הפעילות \u2014 כל מחלקה, כל תהליך, כל מקום שבו כסף נכנס ויוצא. רוב בעלי העסקים אומרים את אותו משפט: \u201Cמעולם לא ראיתי את העסק שלי ככה.\u201D",
      value: "2,500",
      valueLabel: "מיפוי תהליכים בעסק",
      color: C.purple,
      icon: <Search className="w-5 h-5" />,
    },
    {
      num: "3",
      title: "איפה בורח הכסף \u2014 והפעולות הראשונות לעצור את זה",
      body: "המערכת מזהה את הדליפה הגדולה ביותר \u2014 מאיפה בורח כסף כל יום בלי שמרגישים \u2014 עם מספרים, הערכת חיסכון שנתית, והפעולות הראשונות שמתחילים מהן.",
      value: "4,970",
      valueLabel: "אבחון התייעלות עסקית ממומחה AI",
      color: C.red,
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      num: "4",
      title: "ההזדמנויות שלכם \u2014 ולאן אפשר להגיע",
      body: "רשימה מלאה של כל מקום שבו עובד אחד עם AI יכול לעשות עבודה של שלושה \u2014 כל הזדמנות עם שם, שעות חיסכון שבועיות, וכמה זה שווה בחודש. לא תיאוריה. מפת פעולה.",
      value: "3,900",
      valueLabel: "תוכנית הטמעת AI מותאמת",
      color: C.green,
      icon: <Zap className="w-5 h-5" />,
    },
  ];

  return (
    <Section bg={C.bg}>
      <div className="max-w-[900px] mx-auto relative">
        <Orb color={C.blue} x="0%" y="50%" size={500} opacity={0.05} />

        <div className="text-center mb-10 bv-reveal">
          <h2 className="text-4xl md:text-6xl font-black mb-3 leading-tight" style={{ ...MF, color: C.text }}>
            {"מה מקבלים בתוך BizMap:"}
          </h2>
        </div>

        <div className="space-y-4">
          {deliverables.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="rounded-2xl p-7 md:p-9 transition-all duration-300"
              style={{ ...glassCard }}
              onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, glassCardHover(d.color))}
              onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, glassCard)}
            >
              <div className="flex items-start gap-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${d.color}15`, border: `1px solid ${d.color}30`, color: d.color }}
                >
                  {d.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl md:text-2xl font-extrabold mb-3" style={{ ...MF, color: C.text }}>
                    <span className="text-sm font-bold ml-2" style={{ color: d.color }}>{d.num}.</span>
                    {d.title}
                  </h3>
                  <p className="text-[17px] md:text-lg leading-relaxed font-medium font-medium mb-4" style={{ ...IF, color: C.sub }}>
                    {d.body}
                  </p>
                  <div
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
                    style={{ backgroundColor: `${d.color}0c`, border: `1px solid ${d.color}20`, color: d.color, ...IF }}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    {"שווי אמיתי: " + d.valueLabel + " \u2014 " + d.value + "+\u05DE\u05E2\u0022\u05DE \u20AA"}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   GUARANTEE
   ============================================================================ */
function GuaranteeSection() {
  return (
    <Section bg={C.s0}>
      <div className="max-w-[700px] mx-auto relative text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-3xl p-10 md:p-14"
          style={{
            ...glassCard,
            border: `2px solid ${C.green}50`,
            boxShadow: `0 0 80px ${C.green}20, 0 0 120px ${C.green}10, 0 20px 60px rgba(0,0,0,0.5)`,
          }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 relative"
            style={{
              backgroundColor: `${C.green}20`,
              border: `3px solid ${C.green}70`,
              boxShadow: `0 0 40px ${C.green}30, 0 0 80px ${C.green}15, inset 0 0 30px ${C.green}10`,
            }}
          >
            <Shield className="w-12 h-12" style={{ color: C.green }} />
            <div
              className="absolute -inset-2 rounded-full animate-ping"
              style={{ border: `2px solid ${C.green}30`, opacity: 0.4 }}
            />
          </div>
          <h3 className="text-4xl md:text-5xl font-black mb-5" style={{ ...MF, color: C.green }}>
            {"אחריות 100% החזר כספי"}
          </h3>
          <p className="text-lg md:text-xl leading-relaxed font-medium" style={{ ...IF, color: C.sub }}>
            {"אם נכנסתם, מילאתם את המיפוי, ולא קיבלתם ערך \u2014 אתם מקבלים את הכסף בחזרה. 100%. בלי שאלות מיותרות."}
          </p>
          <p className="text-base font-extrabold mt-5" style={{ ...IF, color: C.green }}>
            {"כי אני בטוח שמה שיש פה שווה פי 10 מזה לפחות."}
          </p>
        </motion.div>
      </div>
    </Section>
  );
}

/* ============================================================================
   BONUSES
   ============================================================================ */
function BonusesSection() {
  const bonuses = [
    {
      emoji: "1",
      title: "המתנה שאי אפשר לסרב לה: אנחנו עושים את זה בשבילכם",
      body: "לוקחים את הדבר האחד שהכי יכול לקדם אתכם כרגע \u2014 תסריט מכירה, פוסט שיווקי, סיסטם לשירות, מה שזה לא יהיה \u2014 ועושים אותו בשבילכם. ממש. כמתנה. לא הדרכה איך לעשות \u2014 אנחנו עושים.",
      value: "1,930",
      valueLabel: "תוצר מקצועי בהזמנה אישית",
      color: C.amber,
      icon: <Gift className="w-5 h-5" />,
    },
    {
      emoji: "2",
      title: "מחקר מקיף עליכם ועל הנוכחות הדיגיטלית שלכם",
      body: "מעבר מעמיק על האינסטגרם, האתר, דף הנחיתה, הפייסבוק וכל מה שיש לכם בחוץ \u2014 כדי שהמפה תהיה מדויקת לא רק על מה שקורה בפנים, אלא על איך העסק נראה ללקוחות.",
      value: "1,500",
      valueLabel: "ביקורת נוכחות דיגיטלית",
      color: C.blue,
      icon: <Globe className="w-5 h-5" />,
    },
    {
      emoji: "3",
      title: "מחקר מתחרים מקיף",
      body: "בדיוק איפה המתחרים שלכם עומדים, מה הם עושים נכון, ואיפה הפער שאתם יכולים לנצל כדי לעקוף אותם בסיבוב. היתרון ה\u201Cלא חוקי\u201D מתחיל בלדעת בדיוק נגד מי משחקים.",
      value: "1,500",
      valueLabel: "ניתוח תחרותי",
      color: C.purple,
      icon: <Target className="w-5 h-5" />,
    },
    {
      emoji: "4",
      title: "שבוע נוסף במערכת: המוח השני של העסק",
      body: "שבוע נוסף, חינם לגמרי, עם המוח השני של העסק \u2014 צ\u2019אט שמאומן עליכם ועל הידע שלכם, שיודע לעקוב אחרי פרויקטים של הטמעת AI ולפרק כל מטרה למשימות. לא ChatGPT שמתחיל מאפס בכל שיחה \u2014 יועץ שכבר מכיר את העסק שלכם.",
      value: "990",
      valueLabel: "שבוע ליווי AI אישי",
      color: C.green,
      icon: <Brain className="w-5 h-5" />,
    },
  ];

  return (
    <Section bg={C.bg}>
      <div className="max-w-[900px] mx-auto relative">
        <Orb color={C.amber} x="80%" y="30%" size={400} opacity={0.06} />

        <div className="text-center mb-14 bv-reveal">
          <h2 className="text-4xl md:text-6xl font-black mb-3 leading-tight" style={{ ...MF, color: C.text }}>
            {"וזה לא הכל\u2026 הנה הבונוסים:"}
          </h2>
        </div>

        <div className="space-y-5">
          {bonuses.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl p-7 md:p-8 transition-all duration-300"
              style={{ ...glassCard, borderRight: `3px solid ${b.color}60` }}
            >
              <div className="flex items-start gap-5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg font-extrabold"
                  style={{ backgroundColor: `${b.color}15`, border: `1px solid ${b.color}30`, color: b.color }}
                >
                  {b.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-extrabold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${b.color}20`, color: b.color }}>
                      {"בונוס " + b.emoji}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold mb-2" style={{ ...MF, color: C.text }}>{b.title}</h3>
                  <p className="text-base leading-relaxed font-medium mb-3" style={{ ...IF, color: C.sub }}>{b.body}</p>
                  <span className="text-sm font-bold" style={{ ...IF, color: b.color }}>
                    {"(שווי אמיתי: " + b.valueLabel + " \u2014 " + b.value + "+\u05DE\u05E2\u0022\u05DE \u20AA)"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   VALUE STACK + PRICING
   ============================================================================ */
function PricingSection() {
  return (
    <Section bg={C.s0} id="pricing">
      <div className="max-w-[800px] mx-auto relative text-center">
        <Orb color={C.blue} x="50%" y="50%" size={700} opacity={0.07} />

        {/* Value stack */}
        <div className="bv-reveal mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-10" style={{ ...MF, color: C.text }}>
            {"השווי הכולל של כל מה שמקבלים:"}
          </h2>

          <div className="rounded-2xl p-8 mb-8" style={{ ...glassCard }}>
            <div className="space-y-3 text-base font-medium" style={{ ...IF }}>
              {[
                ["אפיון מדויק של העסק", "3,000"],
                ["מפת העסק מלמעלה", "2,500"],
                ["איפה בורח הכסף + צעדים ראשונים", "4,970"],
                ["מפת הזדמנויות AI", "3,900"],
                ["תוצר Done-For-You", "1,930"],
                ["מחקר נוכחות דיגיטלית", "1,500"],
                ["מחקר מתחרים", "1,500"],
                ["שבוע המוח השני", "990"],
              ].map(([label, val], i) => (
                <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: C.sub }}>{label}</span>
                  <span className="font-bold tabular-nums" style={{ color: C.text }}>{val}+{"מע\u0022מ"} {"₪"}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6" style={{ borderTop: `2px solid ${C.red}40` }}>
              <p className="text-base font-bold mb-2" style={{ ...IF, color: C.muted }}>{"שווי כולל כולל מע\u0022מ:"}</p>
              <p
                className="text-6xl md:text-8xl font-black line-through"
                style={{ ...MF, color: C.red, opacity: 0.85, textDecorationColor: C.red, textDecorationThickness: "4px" }}
              >
                {"23,942 ₪"}
              </p>
            </div>
          </div>
        </div>

        {/* The real price */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bv-reveal"
        >
          <div
            className="rounded-3xl p-10 md:p-14"
            style={{
              ...glassCard,
              border: `2px solid ${C.blue}50`,
              boxShadow: `0 0 80px ${C.blue}15, 0 30px 80px rgba(0,0,0,0.6)`,
            }}
          >
            <p className="text-xl font-bold mb-3" style={{ ...IF, color: C.sub }}>
              {"אז כדי לקבל את BizMap + כל הבונוסים \u2014 ההשקעה שלכם היא רק:"}
            </p>

            <div className="flex items-baseline justify-center gap-2 mb-4">
              <span
                className="text-8xl md:text-[10rem] font-black"
                style={{
                  ...MF,
                  color: C.green,
                  textShadow: `0 0 40px ${C.green}50, 0 0 80px ${C.green}25`,
                }}
              >
                497
              </span>
              <span className="text-3xl font-bold" style={{ color: C.green }}>{"₪"}</span>
            </div>

            <p className="text-lg font-extrabold mb-2" style={{ ...MF, color: C.text }}>
              {"תשלום חד-פעמי. לא חודשי. לא מנוי."}
            </p>
            <p className="text-base font-medium mb-8" style={{ ...IF, color: C.muted }}>
              {"פחות ממה שיועץ גובה על שעה אחת \u2014 בשביל מפה מלאה של העסק, הצעד הראשון לחיסכון, וכל הבונוסים."}
            </p>

            <CTAButton large>{"אני רוצה לראות את העסק שלי מלמעלה"}</CTAButton>

            <div className="flex items-center justify-center gap-2 mt-6">
              <Shield className="w-4 h-4" style={{ color: C.green }} />
              <span className="text-sm font-bold" style={{ ...IF, color: C.green }}>
                {"אחריות מלאה של 100%. אם לא ראיתם ערך, הכסף חוזר."}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Urgency */}
        <div className="mt-14 bv-reveal">
          <div
            className="rounded-2xl p-7 md:p-9 text-center"
            style={{ ...glassCard, border: `1px solid ${C.amber}30` }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-5 h-5" style={{ color: C.amber }} />
              <h3 className="text-xl font-extrabold" style={{ ...MF, color: C.amber }}>
                {"השקה: 30 המקומות הראשונים"}
              </h3>
            </div>
            <p className="text-base leading-relaxed font-medium" style={{ ...IF, color: C.sub }}>
              {"אני לא הולך לשים פה טיימר מזויף, ברגע שנסגור את ה-30 הראשונים \u2014 אנחנו נחליט אם להעלות את המחיר או שנחליט לעבור למכירה לחברות הגדולות בארץ שכבר אנחנו במגעים עם חלק."}
            </p>
            <p className="text-sm font-bold mt-3" style={{ ...IF, color: C.amber }}>
              {"זה הרגע היחיד שבו אפשר להיכנס לדבר הזה במחיר כזה."}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   CTA SECTION
   ============================================================================ */
function CTASection() {
  return (
    <Section bg={C.bg}>
      <div className="max-w-[700px] mx-auto text-center relative">
        <Orb color={C.blue} x="50%" y="50%" size={600} opacity={0.08} />

        <div className="bv-reveal">
          <h2 className="text-3xl md:text-5xl font-black mb-5 leading-tight" style={{ ...MF, color: C.text }}>
            {"כדי לראות סוף סוף את העסק מלמעלה \u2014 איפה בורח הכסף ומה הצעד הראשון שסוגר את זה:"}
          </h2>
          <p className="text-[17px] md:text-lg leading-relaxed font-medium mb-10" style={{ ...IF, color: C.sub }}>
            {"לחצו על הכפתור, מלאו את הפרטים ואשרו את התשלום \u2014 ותוך כמה דקות תתחילו את המיפוי של העסק."}
          </p>
          <CTAButton large>{"אני רוצה לראות את העסק שלי מלמעלה"}</CTAButton>
          <p className="text-sm mt-5" style={{ ...IF, color: C.muted }}>
            {"הרכישה מאובטחת לחלוטין, והפרטים האישיים לא נשארים אצלי ולא משותפים לאף גורם."}
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   ABOUT US
   ============================================================================ */
function AboutSection() {
  return (
    <Section bg={C.s0}>
      <div className="max-w-[800px] mx-auto relative">
        <Orb color={C.purple} x="0%" y="50%" size={400} opacity={0.05} />

        <div className="text-center mb-10 bv-reveal">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3" style={{ ...MF, color: C.text }}>
            {"מי אנחנו, ולמה להקשיב לנו?"}
          </h2>
        </div>

        <div className="rounded-3xl p-8 md:p-12 bv-reveal" style={{ ...glassCard }}>
          <div className="text-[15px] leading-[1.9] space-y-5" style={{ ...IF, color: C.sub }}>
            <p>
              {"קוראים לי "}
              <strong style={{ color: C.text }}>{"עמית ועקנין"}</strong>
              {", ואני בעל סוכנות שיווק שעבדה עם מאות בעלי עסקים \u2014 מכל התחומים ובכל הגדלים. מאנשים שרק הקימו עסק, ועד חברות גדולות."}
            </p>
            <p>
              {"ובמשך השנים, בזמן שעזרתי להם להביא יותר לקוחות ולהגדיל מכירות, התחילה לחזור אותה שאלה \u2014 שוב ושוב, כמעט בכל שיחה:"}
            </p>
            <p className="text-lg font-bold pr-4" style={{ color: C.text, borderRight: `3px solid ${C.blue}60`, paddingRight: 16 }}>
              {"\u201Cעמית, איך אני מייעל את עצמי עוד יותר? איפה אני יכול לחסוך זמן? ואיפה הבינה המלאכותית יכולה להקפיץ אותי לשלב הבא?\u201D"}
            </p>
            <p>
              {"ובשלב מסוים הבנתי משהו: רוב בעלי העסקים לא צריכים עוד יועץ שגובה עשרות אלפי שקלים ונותן עצה כללית. הם צריכים דרך לראות את העסק שלהם מלמעלה \u2014 ולדעת בדיוק איפה הבינה המלאכותית יכולה לעזור להם."}
            </p>
            <p style={{ color: C.text, fontWeight: 700 }}>
              {"אז במקום לענות על אותה שאלה עוד אלף פעם \u2014 החלטתי לבנות את התשובה."}
            </p>
            <p>
              {"יחד איתי עומדים שני השותפים הטכנולוגיים שלי \u2014 בעלי בית תוכנה לפיתוח פתרונות בינה מלאכותית, אפליקציות ומערכות חכמות לעסקים. הם התחילו לכתוב קוד הרבה לפני שבכלל היה דבר כזה \u201Cכלי AI\u201D."}
            </p>
            <p>
              {"וביחד, הטמענו בתוך המערכת "}
              <strong style={{ color: C.text }}>{"ידע עסקי של עשרות שנים"}</strong>
              {", אלפי בעלי עסקים שראינו מקרוב, וחודשים ארוכים של מחקר בבינה מלאכותית."}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   CLARITY — "One difference"
   ============================================================================ */
function ClaritySection() {
  return (
    <Section bg={C.bg}>
      <div className="max-w-[800px] mx-auto relative text-center">
        <Orb color={C.purple} x="100%" y="50%" size={500} opacity={0.05} />
        <div className="bv-reveal space-y-6">
          <h2 className="text-3xl md:text-5xl font-black leading-tight" style={{ ...MF, color: C.text }}>
            {"יש הבדל אחד בין עסק שמרוויח יותר עם פחות עובדים לבין עסק שנשאר תקוע עם אותן בעיות."}
          </h2>
          <p className="text-lg font-bold" style={{ ...IF, color: C.sub }}>
            {"לא התקציב. לא הענף. ולא הניסיון."}
          </p>
          <p
            className="text-5xl md:text-7xl font-black"
            style={{
              ...MF,
              background: `linear-gradient(135deg, ${C.blue}, ${C.glow})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {"הבהירות."}
          </p>
          <p className="text-base md:text-lg leading-[1.9] font-medium max-w-2xl mx-auto" style={{ ...IF, color: C.sub }}>
            {"לדעת בדיוק איזה תהליך אחד יחסוך 20, 30, 50 אלף שקל בשנה הקרובה. ולדעת איך לעשות את זה בלי לשבור את מה שכבר עובד."}
          </p>
          <p className="text-base md:text-lg leading-[1.9] font-medium" style={{ ...IF, color: C.sub }}>
            {"רוב בעלי העסקים לא מחפשים עוד כלי AI. הם מחפשים מישהו שיסתכל על העסק שלהם מלמעלה ויגיד: "}
            <strong style={{ color: C.text }}>{"זה. זה המקום. מכאן מתחילים."}</strong>
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   METHOD — 5 Steps
   ============================================================================ */
function MethodSection() {
  const steps = [
    {
      title: "מיפוי ושאלות",
      body: "זה מתחיל בשאלון ותהליך אונבורדינג מקיף על העסק שלך. שאלות שעוזרות לנו להבין את העסק שלך, לאיפה הזמן הולך היום, מה כל אחד מהעובדים והספקים עושים, ואיפה מרגישים שמשהו תקוע. כמה דקות. ו-BizMap כבר מתחילה לעבוד.",
      icon: <MessageSquare className="w-5 h-5" />,
      color: C.blue,
    },
    {
      title: "רואים את העסק מלמעלה בפעם הראשונה",
      body: "זה הרגע שרוב בעלי העסקים אומרים \u201Cוואו\u201D. BizMap בונה מפה ויזואלית מלאה של העסק שלך \u2014 כל מחלקה, כל תהליך, כל מקום שכסף נכנס ויוצא. פעם ראשונה שרואים את כל התמונה במקום אחד. לא מתוך העסק \u2014 מעליו.",
      icon: <Search className="w-5 h-5" />,
      color: C.purple,
    },
    {
      title: "מוצאים את הדליפה הגדולה ביותר",
      body: "מכל מה שנמפה \u2014 BizMap מצביעה על הדליפה הגדולה ביותר בעסק. המקום שכסף יוצא ממנו כל יום \u2014 בלי שיודעים. סוגרים את החור הזה בלבד \u2014 וכבר חוסכים עשרות אלפי שקלים בשנה הקרובה. עם מספרים. עם הערכת חיסכון. עם צעד ראשון ברור.",
      icon: <TrendingUp className="w-5 h-5" />,
      color: C.red,
    },
    {
      title: "בונים את מפת ה-AI של העסק שלך",
      body: "אחרי הצעד הראשון \u2014 BizMap לא עוצרת. היא בונה רשימה מלאה של כל ההזדמנויות בעסק שלך \u2014 כל מקום שבו AI יכול להיכנס, לחסוך זמן, ולהחזיר כסף. כל הזדמנות עם שם ברור, שעות חיסכון בשבוע, וכמה זה שווה בחודש. מפת פעולה. לא תיאוריה.",
      icon: <Zap className="w-5 h-5" />,
      color: C.green,
    },
    {
      title: "מחליפים את היועץ העסקי שלך (בלי לשלם 50,000₪)",
      body: "ואז מקבלים משהו שאף יועץ לא יכול לתת \u2014 צ\u2019אט שכבר יודע הכל על העסק שלך. לא ChatGPT שמתחיל מאפס בכל שיחה. יועץ שמכיר את התהליכים שלך, את האנשים שלך, את הצעדים שלך \u2014 ומאומן על ידע עסקי אמיתי של מאות עסקים. \u201Cמוח שני\u201D שאליו תוכלו להעלות חומרים של העסק שלכם והוא יזכור את זה כל שיחה מחדש.",
      icon: <Brain className="w-5 h-5" />,
      color: C.amber,
    },
  ];

  const imgs = ["/onboarding.png", "/map.png", "/opportunity.png", "/analysis.png", "/chat.png"];

  return (
    <Section bg={C.s0} id="method">
      <div className="max-w-[1200px] mx-auto relative">
        <Orb color={C.green} x="90%" y="50%" size={500} opacity={0.05} />

        <div className="text-center mb-16 bv-reveal">
          <h2 className="text-4xl md:text-6xl font-black mb-5" style={{ ...MF, color: C.text }}>
            {"תכירו את השיטה של BizMap"}
          </h2>
          <p className="text-base max-w-2xl mx-auto" style={{ ...IF, color: C.muted }}>
            {"המפה המלאה של העסק שלך \u2014 איפה הכסף בורח, איפה הזמן נבלע, ואיזה צעד אחד ישנה את התמונה ויראה לך בדיוק איך להפוך כל עובד לכפול עשר של עצמו."}
          </p>
        </div>

        <div className="space-y-20 md:space-y-24">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7 }}
              className="grid md:grid-cols-2 gap-10 md:gap-14 items-center"
            >
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${step.color}15`, border: `1px solid ${step.color}30`, color: step.color }}
                  >
                    {step.icon}
                  </div>
                  <div>
                    <span className="text-sm font-extrabold block mb-1" style={{ color: step.color }}>{"שלב " + (i + 1)}</span>
                    <h3 className="text-2xl md:text-3xl font-extrabold" style={{ ...MF, color: C.text }}>{step.title}</h3>
                  </div>
                </div>
                <p className="text-[17px] md:text-lg leading-relaxed font-medium font-medium" style={{ ...IF, color: C.sub }}>{step.body}</p>
              </div>
              <div className={i % 2 === 1 ? "md:order-1" : ""}>
                <div className="relative group">
                  <div
                    className="absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"
                    style={{ background: `linear-gradient(135deg, ${step.color}30, ${C.purple}30)` }}
                  />
                  <img
                    src={imgs[i]}
                    alt={step.title}
                    className="relative rounded-2xl border border-white/10 shadow-2xl w-full h-auto object-cover"
                    style={{ ...glassCard }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <CTAButton large>{"אני רוצה להתחיל את המיפוי"}</CTAButton>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   FAQ
   ============================================================================ */
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  const items = [
    { q: "במה זה שונה מ-ChatGPT? אני כבר משלם 20 דולר בחודש.", a: "ChatGPT מתחיל מאפס בכל שיחה ולא מכיר את העסק. BizMap קודם ממפה את העסק הספציפי \u2014 העובדים, התהליכים, איפה הכסף בורח \u2014 ורק אז נותנת המלצה. זה ההבדל בין רופא שמנחש לבין כזה ששלח אותך לבדיקת דם. וב-14 הימים במערכת מקבלים \u201Cמוח שני\u201D שזוכר את העסק כל שיחה מחדש." },
    { q: "למה לשלם 497 ₪ אם אני יכול לנסות לעשות את זה לבד?", a: "אפשר לנסות \u2014 אבל זה בדיוק מה שרוב בעלי העסקים עושים כבר חודשים, ועדיין מנחשים. 497 ₪ חד-פעמי זה פחות ממה שיועץ גובה על שעה אחת, בשביל מפה מלאה של העסק וצעד ראשון מדויק. ומספיק שתובנה אחת תחסוך כמה אלפי שקלים \u2014 וזה כבר החזיר את עצמו פי כמה." },
    { q: "זה באמת יתאים לעסק הספציפי שלי?", a: "בדיוק בגלל זה זה עובד. BizMap לא נותנת עצה גנרית \u2014 היא מתחילה מהשאלון על העסק הזה, ובונה מפה רק עליו. עבדנו עם עסקים ממאות תחומים ובכל הגדלים. אם יש בעסק כמה עובדים או ספקים \u2014 יש בו לפחות 2-3 תהליכים שאפשר להפוך לכפול-עשר." },
    { q: "ואם אני לא טכנולוגי בכלל?", a: "לא צריך לדעת שורת קוד אחת. עונים על שאלות בשפה פשוטה, והמערכת עושה את כל השאר. אם יודעים לכתוב הודעת וואטסאפ \u2014 יודעים להשתמש ב-BizMap." },
    { q: "מה אם אכנס ולא אראה שום ערך?", a: "מקבלים את כל הכסף בחזרה. 100%, בלי שאלות מיותרות. נכנסים, ממלאים את המיפוי, ואם זה לא נתן ערך \u2014 הכסף חוזר. כל הסיכון עליי, לא עליכם." },
    { q: "כמה זמן זה לוקח?", a: "המיפוי הראשוני לוקח כמה דקות. תוך זמן קצר כבר רואים את המפה, את הדליפה הגדולה, ואת הצעד הראשון. אין פה קורס של שעות \u2014 יש פה תוצאה מהירה." },
    { q: "למה זה כל כך זול אם השווי כזה גבוה?", a: "כי אנחנו בהשקה. החלטנו לפתוח את המערכת ל-30 בעלי העסקים הראשונים במחיר הזה, לאסוף פידבקים ולשפר \u2014 לפני שהיא עוברת למכירה לחברות גדולות בעשרות אלפי שקלים. זה הרגע היחיד להיכנס במחיר כזה." },
    { q: "כבר ניסיתי יועצים וכלים. למה שזה יהיה שונה?", a: "כי כולם עשו את אותה טעות \u2014 הגיעו עם תשובה לפני שהבינו את השאלה. יועץ מתחיל מהמתודולוגיה שלו, כלי מתחיל מאינטגרציות. BizMap מתחילה מהעסק עצמו, ורק אז ממליצה. זה בדיוק מה שחסר בכל מה שניסיתם." },
    { q: "מה קורה אחרי 14 הימים במערכת?", a: "את כל הערך \u2014 האפיון, המפה, הדליפה, מפת ה-AI והבונוסים \u2014 מקבלים מההתחלה והם נשארים. 14 הימים הם גישה נוספת ל\u201Cמוח השני\u201D כדי להתחיל ליישם בליווי. מה שקורה אחרי תלוי בכם, בלי התחייבות." },
    { q: "אני עסוק. אין לי זמן לעוד פרויקט.", a: "בדיוק בשביל זה זה קיים. BizMap לא מוסיפה עוד עבודה \u2014 היא מראה איפה כבר מבזבזים זמן, ומה הצעד האחד שמחזיר אותו. וה-Done-For-You עושה בשבילכם את הדבר הראשון, בלי שתצטרכו להרים אצבע." },
  ];

  return (
    <Section bg={C.bg}>
      <div className="max-w-[750px] mx-auto">
        <div className="text-center mb-14 bv-reveal">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ ...MF, color: C.text }}>
            {"כל מה שעובר לכם בראש עכשיו \u2014 ויש לו תשובה"}
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
                className="w-full text-right px-6 py-4 flex items-center justify-between gap-4"
                style={{
                  backgroundColor: open === i ? "rgba(16,20,34,0.9)" : "rgba(11,14,26,0.8)",
                  cursor: "pointer",
                }}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-base font-bold" style={{ ...MF, color: C.text }}>{faq.q}</span>
                <ChevronDown
                  className="w-4 h-4 shrink-0 transition-transform duration-200"
                  style={{ color: C.blue, transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
                  strokeWidth={2.5}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-1" style={{ backgroundColor: "rgba(16,20,34,0.7)" }}>
                      <p className="text-base leading-relaxed font-medium" style={{ ...IF, color: C.muted }}>{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   FINAL CTA
   ============================================================================ */
function FinalCTA() {
  return (
    <Section bg={C.s0}>
      <div className="max-w-[1000px] mx-auto">
        <div
          className="rounded-3xl px-8 md:px-14 py-16 md:py-20 text-center relative overflow-hidden bv-reveal"
          style={{
            ...glassCard,
            boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 80px ${C.blue}08`,
            border: `1px solid ${C.blue}20`,
          }}
        >
          <Orb color={C.blue} x="50%" y="50%" size={500} opacity={0.08} />

          <h2 className="text-3xl md:text-5xl font-black mb-4 relative z-10" style={{ ...MF, color: C.text }}>
            {"עסק שיודע איפה הכסף בורח \u2014 יכול לעצור את זה."}
          </h2>
          <p className="text-xl md:text-2xl font-semibold mb-3 relative z-10" style={{ ...IF, color: C.sub }}>
            {"עסק שלא יודע \u2014 ממשיך לשלם על זה כל חודש."}
          </p>
          <p className="text-base mb-10 max-w-2xl mx-auto relative z-10" style={{ ...IF, color: C.muted }}>
            {"כמה דקות של שאלות. מפה מלאה של העסק שלך. וצעד ראשון ברור שמתחיל לחסוך עשרות אלפי שקלים בשנה הקרובה."}
          </p>

          <div className="relative z-10">
            <CTAButton large>{"אני רוצה לראות את העסק שלי מלמעלה"}</CTAButton>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8 relative z-10 flex-wrap">
            {["497₪ חד-פעמי", "אחריות 100% החזר כספי", "30 מקומות בלבד"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-sm font-semibold" style={{ ...IF, color: C.muted }}>
                <Check className="w-3.5 h-3.5" style={{ color: C.green }} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================================
   FOOTER
   ============================================================================ */
function Footer() {
  return (
    <footer style={{ backgroundColor: C.bg, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-16">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex w-fit items-center gap-2.5 mb-5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${C.blue}cc, ${C.purple}80)`, boxShadow: `0 0 12px ${C.blue}25` }}
              >
                <BizLogo size={10} />
              </div>
              <span className="text-sm font-bold" style={{ ...MF, color: C.text }}>BizMap</span>
            </Link>
            <p className="text-xs leading-relaxed mb-4" style={{ ...IF, color: C.muted, maxWidth: "26ch" }}>
              {"המערכת שממפה את העסק שלך מלמעלה ומראה בדיוק מאיפה להתחיל."}
            </p>
            <a
              href="mailto:support@bizmapai.com"
              className="text-xs font-semibold transition-colors duration-200"
              style={{ ...IF, color: C.blue }}
            >
              support@bizmapai.com
            </a>
          </div>
          {[
            { h: "מוצר", links: ["מפת עסקים", "הזדמנויות AI", "ביקורת תהליכים", "המוח השני"] },
            { h: "חברה", links: ["אודות", "בלוג", "צור קשר"] },
            { h: "משפטי", links: ["פרטיות", "תנאים", "אבטחה"] },
          ].map((col) => (
            <div key={col.h}>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ ...IF, color: C.outline }}>{col.h}</p>
              <ul className="space-y-3">
                {col.links.map((link) => {
                  const href = link === "פרטיות" ? "/privacy" : link === "תנאים" ? "/terms" : "#";
                  return (
                    <li key={link}>
                      <Link
                        href={href}
                        className="text-xs cursor-pointer transition-colors duration-200"
                        style={{ ...IF, color: C.muted }}
                        onMouseEnter={e => (e.currentTarget.style.color = C.sub)}
                        onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                      >{link}</Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <p className="text-[11px]" style={{ ...IF, color: C.outline }}>{"© 2026 BizMap. כל הזכויות שמורות."}</p>
          <div className="flex items-center gap-4">
            {["פרטיות", "תנאים"].map((l) => (
              <Link
                key={l}
                href={l === "פרטיות" ? "/privacy" : "/terms"}
                className="text-[11px] cursor-pointer transition-colors duration-200"
                style={{ ...IF, color: C.outline }}
                onMouseEnter={e => (e.currentTarget.style.color = C.muted)}
                onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
              >{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================================
   STICKY MOBILE CTA
   ============================================================================ */
function StickyMobileCTA() {
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
        href="/checkout"
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold"
        style={{
          background: `linear-gradient(135deg, ${C.blue}, ${C.purple}90)`,
          color: "#fff",
          boxShadow: `0 4px 20px ${C.blue}30`,
        }}
      >
        {"אני רוצה לראות את העסק שלי מלמעלה"}
        <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
      </Link>
    </div>
  );
}

/* ============================================================================
   ROOT
   ============================================================================ */
export function LandingPage() {
  useReveal();
  return (
    <div dir="rtl" style={{ backgroundColor: C.bg }}>
      <Nav />
      <Hero />
      <ProblemSection />
      <VisionSection />
      <ProductReveal />
      <WhatYouGet />
      <GuaranteeSection />
      <BonusesSection />
      <PricingSection />
      <CTASection />
      <AboutSection />
      <ClaritySection />
      <MethodSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
