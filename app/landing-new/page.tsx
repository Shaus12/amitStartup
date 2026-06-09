"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── Inline global styles ────────────────────────────────────────────────────
const globalStyles = `
  @keyframes blob1 {
    0%   { transform: translate(0px,   0px)   scale(1);   }
    33%  { transform: translate(30px, -50px)  scale(1.1); }
    66%  { transform: translate(-20px, 20px)  scale(0.9); }
    100% { transform: translate(0px,   0px)   scale(1);   }
  }
  @keyframes blob2 {
    0%   { transform: translate(0px,   0px)   scale(1);   }
    33%  { transform: translate(-30px, 50px)  scale(1.2); }
    66%  { transform: translate(20px, -20px)  scale(0.8); }
    100% { transform: translate(0px,   0px)   scale(1);   }
  }
  @keyframes blob3 {
    0%   { transform: translate(0px,  0px)   scale(1);   }
    33%  { transform: translate(40px, 20px)  scale(0.9); }
    66%  { transform: translate(-40px,-20px) scale(1.1); }
    100% { transform: translate(0px,  0px)   scale(1);   }
  }
  @keyframes blob4 {
    0%   { transform: translate(0px,   0px)   scale(1);   }
    40%  { transform: translate(-20px, 30px)  scale(1.15);}
    80%  { transform: translate(25px, -15px)  scale(0.85);}
    100% { transform: translate(0px,   0px)   scale(1);   }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes shimmer {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
  @keyframes pulse-glow {
    0%,100% { box-shadow: 0 0 20px rgba(99,102,241,0.4); }
    50%      { box-shadow: 0 0 40px rgba(99,102,241,0.7); }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes countDown {
    from { opacity:0; transform: scale(0.8); }
    to   { opacity:1; transform: scale(1);   }
  }

  .aurora-blob {
    position: absolute;
    filter: blur(80px);
    opacity: 0.18;
    z-index: 0;
    pointer-events: none;
    border-radius: 9999px;
  }
  .glass-card {
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .shimmer-btn {
    position: relative;
    overflow: hidden;
  }
  .shimmer-btn::after {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 50%; height: 100%;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.25), transparent);
    transform: skewX(-20deg);
    transition: left 0.6s ease;
  }
  .shimmer-btn:hover::after { left: 150%; }

  .fade-in-up {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .fade-in-up.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .value-text {
    color: #d4a14a;
    font-size: 0.82rem;
  }
  .strikethrough {
    text-decoration: line-through;
    opacity: 0.5;
  }
  .accordion-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease, padding 0.3s ease;
  }
  .accordion-content.open {
    max-height: 600px;
  }
  .number-badge {
    font-size: 3.5rem;
    font-weight: 900;
    line-height: 1;
    background: linear-gradient(135deg, rgba(99,102,241,0.4), rgba(14,165,233,0.4));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .mockup-placeholder {
    width: 100%;
    min-height: 180px;
    border: 1px dashed rgba(255,255,255,0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255,255,255,0.3);
    font-size: 0.85rem;
    margin-top: 1rem;
    background: rgba(255,255,255,0.02);
  }
  .step-line {
    position: absolute;
    right: 24px;
    top: 56px;
    bottom: -24px;
    width: 2px;
    background: linear-gradient(to bottom, rgba(99,102,241,0.5), transparent);
  }
  .gradient-text {
    background: linear-gradient(135deg, #818cf8, #38bdf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-headline {
    background: linear-gradient(135deg, #ffffff 0%, #c7d2fe 60%, #7dd3fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .scarcity-counter {
    animation: countDown 0.6s ease forwards;
  }
`;

// ─── Reusable CTA Button ─────────────────────────────────────────────────────
function CtaButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/checkout"
      className={`shimmer-btn inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-lg font-bold text-white transition-all hover:scale-[1.03] active:scale-[0.98] ${className}`}
      style={{
        background: "linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)",
        boxShadow: "0 4px 30px rgba(79,70,229,0.45)",
        fontFamily: "var(--font-manrope)",
      }}
    >
      אני רוצה לראות את העסק שלי מלמעלה ←
    </Link>
  );
}

// ─── Mockup Placeholder ──────────────────────────────────────────────────────
function MockupPlaceholder({ label }: { label: string }) {
  return <div className="mockup-placeholder">{label}</div>;
}

// ─── Scroll animation hook ───────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".fade-in-up");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─── FAQ Data ────────────────────────────────────────────────────────────────
const faqItems = [
  {
    q: "האם BizMap מתאים לכל סוגי העסקים?",
    a: "כן. BizMap תוכנן לעבוד עם כל עסק שיש בו לפחות 2-3 תהליכים — בין אם מדובר בעסק שירותי, מסחרי, ייצורי או דיגיטלי. המיפוי מותאם אישית לפי הפרטים שאתם מספקים.",
  },
  {
    q: "כמה זמן לוקח למלא את המיפוי?",
    a: "בין 20 ל-40 דקות, תלוי בכמות הפרטים שתשתפו. המערכת מנחה אתכם שלב אחר שלב, ואפשר לשמור ולהמשיך מאוחר יותר.",
  },
  {
    q: "מה קורה אחרי שממלאים את המיפוי?",
    a: "תקבלו מסמך ניתוח מפורט שכולל: מפת התהליכים של העסק, זיהוי נקודות הדליפה, המלצות AI ספציפיות לעסק שלכם, ותוכנית פעולה ראשונית.",
  },
  {
    q: "האם צריך ידע טכנולוגי כדי להשתמש?",
    a: "בכלל לא. BizMap בנוי לבעלי עסקים — לא למתכנתים. כל השאלות בעברית פשוטה, כל הפלטים בעברית ברורה.",
  },
  {
    q: "מה זה 'שבוע במערכת: המוח השני של העסק'?",
    a: "אחרי שתקבלו את הניתוח, תוכלו לגשת למערכת הצ׳אט החכמה שלנו למשך שבוע ולשאול שאלות ספציפיות על העסק שלכם — AI שכבר מכיר את הפרטים שלכם.",
  },
  {
    q: "האם זה תשלום חד-פעמי או מנוי?",
    a: "תשלום חד-פעמי בלבד — 497 ₪. אין חיובים נוספים, אין מנוי, אין הפתעות.",
  },
  {
    q: "איך עובדת האחריות להחזר כספי?",
    a: "אם מילאתם את המיפוי ולא קיבלתם ערך — שולחים מייל ואנחנו מחזירים 100% מהסכום. בלי שאלות, בלי בירוקרטיה.",
  },
  {
    q: "האם מישהו יראה את הנתונים שלי?",
    a: "הנתונים שלכם שמורים באופן מאובטח ולא מועברים לצדדים שלישיים. הם משמשים אך ורק ליצירת הניתוח שלכם.",
  },
  {
    q: "למה 30 מקומות בלבד?",
    a: "כי חלק מהתהליך כולל ליווי אישי מהצוות שלנו. כדי לשמור על איכות גבוהה, אנחנו מגבילים את הקבוצה הראשונה. ברגע שה-30 מקומות מתמלאים — המחיר עולה.",
  },
  {
    q: "מה הפרטים שאני צריך להכין לפני שמתחיל?",
    a: "כלום מיוחד. רק להגיע עם הכנות לענות על שאלות על העסק שלכם — כמה עובדים, מה התהליכים העיקריים, איפה אתם מרגישים שדברים 'נופלים בין הכיסאות'.",
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LandingNewPage() {
  useScrollReveal();

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#050510] text-white relative overflow-x-hidden"
      style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
    >
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

      {/* ── Aurora Background ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="aurora-blob w-[700px] h-[700px]"
          style={{
            left: "-150px",
            top: "-100px",
            background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)",
            animation: "blob1 9s infinite alternate",
          }}
        />
        <div
          className="aurora-blob w-[600px] h-[600px]"
          style={{
            right: "-80px",
            top: "30%",
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
            animation: "blob2 13s infinite alternate",
          }}
        />
        <div
          className="aurora-blob w-[500px] h-[500px]"
          style={{
            left: "25%",
            top: "55%",
            background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)",
            animation: "blob3 11s infinite alternate",
          }}
        />
        <div
          className="aurora-blob w-[450px] h-[450px]"
          style={{
            right: "10%",
            bottom: "5%",
            background: "radial-gradient(circle, #6d28d9 0%, transparent 70%)",
            animation: "blob4 14s infinite alternate",
          }}
        />
      </div>

      {/* ════════════════════════════════════════════
          SECTION 1 — HERO
      ════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative z-10 flex flex-col items-center text-center px-5 pt-20 pb-28"
      >
        {/* Top badge */}
        <div className="fade-in-up mb-8">
          <span
            className="inline-block px-5 py-2.5 rounded-full text-sm font-semibold"
            style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.4)",
              color: "#c7d2fe",
            }}
          >
            לבעלי עסקים שמפגרים מאחור במהפכת ה-AI — ורוצים יתרון ״לא חוקי״
          </span>
        </div>

        {/* Main headline */}
        <h1
          className="fade-in-up hero-headline text-4xl md:text-6xl lg:text-7xl font-black leading-tight max-w-5xl mb-7"
          style={{ fontFamily: "var(--font-manrope)", transitionDelay: "0.1s" }}
        >
          בכמה דקות הקרובות תוכלו להבין בדיוק איפה
          <br className="hidden md:block" />
          העסק מפסיד כסף כרגע ואיך AI יכול לחסוך לכם אלפי שקלים כל חודש ולהפוך את המתחרים ללא רלוונטים.
        </h1>

        {/* Sub-headline */}
        <p
          className="fade-in-up text-lg md:text-xl text-white/60 max-w-3xl mb-10 leading-relaxed"
          style={{ transitionDelay: "0.2s" }}
        >
          בלי לשלם ליועץ יקר שלא מכיר את העסק שלך, בלי להיות מתכנת או לכתוב שורת קוד אחת, ובלי לשנות את מה שכבר עובד
        </p>

        {/* CTA */}
        <div
          className="fade-in-up flex flex-col items-center gap-4"
          style={{ transitionDelay: "0.3s" }}
        >
          <CtaButton />
          <p className="text-sm text-white/40">
            תשלום חד-פעמי · אחריות החזר כספי 100%
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 2 — PROBLEM
      ════════════════════════════════════════════ */}
      <section
        id="problem"
        className="relative z-10 py-24 px-5"
        style={{ background: "rgba(0,0,0,0.45)" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2
            className="fade-in-up text-4xl md:text-5xl font-black text-center mb-14"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            לכולם כבר נפל האסימון
          </h2>

          {/* 3 statement lines */}
          <div className="fade-in-up flex flex-col gap-5 mb-12">
            {[
              { icon: "💻", text: "אחד כבר הקים אתר עם AI." },
              { icon: "🔄", text: "השני כבר החליף את מערכת ה-CRM שלו." },
              {
                icon: "👔",
                text: "ועוד אחד כבר פיטר עובד, ושלא נדבר על החברות הגדולות שמפטרות עשרות אלפי אנשים.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 glass-card rounded-2xl px-6 py-4"
              >
                <span className="text-2xl mt-0.5">{item.icon}</span>
                <p className="text-lg md:text-xl font-semibold text-white/90">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Body text */}
          <div className="fade-in-up glass-card rounded-3xl p-8 mb-12 text-white/75 text-lg leading-relaxed space-y-4">
            <p>
              לדבר עם הצ׳אט ולשלם 20 דולר על מנוי ולא למצות אותו, זה עדיין לא להיות חלק מהמהפכה...
            </p>
            <p>
              המהפכה האמיתית היא כשה-AI לא רק עוזר לך לכתוב תוכן — אלא כשהוא{" "}
              <strong className="text-white">
                חוסך לך כסף, מחליף תפקידים שלמים, ומייצר הכנסה שלא הייתה קיימת לפני.
              </strong>
            </p>
            <p>
              וזה לא קורה כי מישהו קנה כלי. זה קורה כי מישהו הבין <em>איפה</em> להכניס את הכלי.
            </p>
          </div>

          {/* 3 problem cards */}
          <div className="fade-in-up grid md:grid-cols-3 gap-5 mb-14">
            {[
              {
                icon: "👔",
                title: "יועץ יכול לעזור בזה?",
                text: "יועץ טוב עולה אלפי שקלים — ולא מכיר את העסק שלך. הוא יתן לך עצות גנריות שעובדות בממוצע לכולם, ולא ספציפיות לך.",
              },
              {
                icon: "👤",
                title: "עובדים חדשים?",
                text: "עובד חדש לוקח זמן להכשרה, עולה כסף כל חודש, ועלול לעזוב. לא זאת הסיבה שהעסק שלך לא מנצל AI.",
              },
              {
                icon: "⚙️",
                title: "מערכות ואוטומציות?",
                text: "קנית מערכת CRM? אוטומציה חדשה? בלי מפה ברורה של העסק — אתה קונה כלי בלי לדעת מה לבנות איתו.",
              },
            ].map((card, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 flex flex-col gap-3">
                <span className="text-3xl">{card.icon}</span>
                <h3
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {card.title}
                </h3>
                <p className="text-white/65 text-sm leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>

          {/* Closing line */}
          <div className="fade-in-up text-center">
            <p
              className="text-2xl md:text-3xl font-black leading-snug"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              הבעיה לא הייתה הפתרונות
              <br />
              <span className="gradient-text">הבעיה הייתה שאף אחד לא התחיל מהעסק עצמו.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 3 — SOLUTION INTRO
      ════════════════════════════════════════════ */}
      <section id="solution" className="relative z-10 py-24 px-5">
        <div className="max-w-4xl mx-auto">
          <p
            className="fade-in-up text-center text-white/50 text-xl mb-4"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            וזאת הסיבה שיצרנו את
          </p>
          <h2
            className="fade-in-up text-center text-5xl md:text-6xl font-black gradient-text mb-12"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            BizMap
          </h2>

          <div className="fade-in-up glass-card rounded-3xl p-8 md:p-10 text-white/80 text-lg leading-relaxed mb-10 space-y-5">
            <p>
              כל עסק עם כמה עובדים או ספקים מכיל בתוכו לפחות 2-3 תהליכים שמבזבזים כסף בשקט — בלי שבעל העסק מודע לכך.
            </p>
            <p>
              לא בגלל שהוא לא חכם. אלא כי{" "}
              <strong className="text-white">
                אף פעם לא ראה את העסק שלו מלמעלה, ברזולוציה הנכונה, עם השאלות הנכונות.
              </strong>
            </p>
            <p>
              עד עכשיו, זה היה הפריבילגיה של עסקים גדולים שיש להם יועץ, CFO, ומנהל תפעול. עסקים קטנים ובינוניים — פשוט ניהלו מתוך הבטן.
            </p>
            <p>
              BizMap שינתה את זה.
            </p>
          </div>

          {/* Highlighted "Imagine" card */}
          <div
            className="fade-in-up rounded-3xl p-8 md:p-10 text-white/90 text-lg leading-relaxed"
            style={{
              background: "linear-gradient(135deg, rgba(79,70,229,0.15), rgba(14,165,233,0.1))",
              border: "1px solid rgba(99,102,241,0.35)",
            }}
          >
            <p className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-manrope)" }}>
              ✨ דמיינו:
            </p>
            <p>
              דמיינו שעוד כמה דקות מעכשיו אפשר לדעת בדיוק:
            </p>
            <ul className="mt-4 space-y-3 list-none">
              {[
                "איפה העסק שלכם מאבד כסף — לא בתחושת בטן, אלא בצורה מדויקת ומתועדת",
                "אילו תהליכים אפשר להחליף ב-AI ולחסוך אלפי שקלים בחודש",
                "מה המתחרים עושים שאתם לא — ואיך לסגור את הפער",
                "מה הצעדים הראשונים שצריך לעשות כדי להיות רלוונטיים בעולם ה-AI",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-indigo-400 mt-1 shrink-0">▸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 4 — PRODUCT INTRO
      ════════════════════════════════════════════ */}
      <section
        id="product"
        className="relative z-10 py-20 px-5 text-center"
        style={{ background: "rgba(0,0,0,0.3)" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2
            className="fade-in-up text-6xl md:text-8xl font-black gradient-text mb-4"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            BizMap
          </h2>
          <p
            className="fade-in-up text-xl md:text-2xl text-white/70 mb-12 font-semibold"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            המערכת היחידה שממפה את העסק הספציפי שלך מלמעלה
          </p>
          <div className="fade-in-up">
            <MockupPlaceholder label="מוקאפ מוצר" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 5 — WHAT YOU GET
      ════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <h2
            className="fade-in-up text-4xl md:text-5xl font-black text-center mb-16"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            מה מקבלים בתוך BizMap:
          </h2>

          <div className="flex flex-col gap-8">
            {[
              {
                num: "01",
                title: "האפיון המדויק על העסק שלכם",
                desc: "מיפוי עומק של העסק שלכם — לא שאלון גנרי, אלא שאלות חכמות שמנחות אתכם לחשוב על תהליכים שאולי מעולם לא עצרתם לבדוק. בסוף התהליך — AI מנתח כל מה שסיפרתם ומייצר פרופיל עסקי מדויק.",
                value: "(שווי אמיתי: פגישת אפיון עם יועץ עסקי — 3,000+מע״מ ₪)",
                mockup: "מוקאפ: אפיון עסקי",
              },
              {
                num: "02",
                title: "המפה של העסק — מלמעלה, בפעם הראשונה",
                desc: "ויזואליזציה מלאה של כל תהליכי העסק שלכם — מי עושה מה, מתי, ואיך הכל מחובר. בפעם הראשונה תראו את העסק שלכם כמו שרואה אותו מי שמנהל מבחוץ.",
                value: "(שווי אמיתי: מיפוי תהליכים בעסק — 2,500+מע״מ ₪)",
                mockup: "מוקאפ: מפת תהליכים",
              },
              {
                num: "03",
                title: "איפה בורח הכסף — והפעולות הראשונות לעצור את זה",
                desc: "אחרי שרואים את המפה — AI מזהה את נקודות הדליפה: כפילויות, תהליכים ידניים שמבזבזים שעות, ועיכובים שעולים לכם כסף בכל חודש. ומקבלים רשימת פעולות ראשונות לסגור את הדליפות.",
                value: "(שווי אמיתי: אבחון התייעלות עסקית — 4,970+מע״מ ₪)",
                mockup: "מוקאפ: זיהוי דליפות",
              },
              {
                num: "04",
                title: "ההזדמנויות שלכם — ולאן אפשר להגיע",
                desc: "לא רק לתקן — אלא לבנות. AI ממפה את ההזדמנויות הספציפיות לעסק שלכם: אילו כלי AI רלוונטיים, מה אפשר לאוטומט, ואיך נראה העסק שלכם עם הטמעה נכונה.",
                value: "(שווי אמיתי: תוכנית הטמעת AI מותאמת — 3,900+מע״מ)",
                mockup: "מוקאפ: הזדמנויות AI",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="fade-in-up glass-card rounded-3xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start"
              >
                <div className="shrink-0">
                  <span className="number-badge">{item.num}</span>
                </div>
                <div className="flex-1">
                  <h3
                    className="text-2xl md:text-3xl font-black text-white mb-4"
                    style={{ fontFamily: "var(--font-manrope)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-white/70 text-base leading-relaxed mb-3">
                    {item.desc}
                  </p>
                  <p className="value-text font-semibold">{item.value}</p>
                  <MockupPlaceholder label={item.mockup} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 6 — GUARANTEE
      ════════════════════════════════════════════ */}
      <section
        id="guarantee"
        className="relative z-10 py-20 px-5"
        style={{ background: "rgba(0,0,0,0.35)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="fade-in-up rounded-3xl p-10 md:p-14"
            style={{
              border: "2px solid rgba(212,161,74,0.5)",
              background: "rgba(212,161,74,0.06)",
            }}
          >
            <div className="text-5xl mb-6">🛡️</div>
            <h2
              className="text-3xl md:text-4xl font-black text-white mb-6 leading-snug"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              אם נכנסתם, מילאתם את המיפוי, ולא קיבלתם ערך —
              <br />
              <span style={{ color: "#d4a14a" }}>
                אתם מקבלים את הכסף בחזרה!
              </span>
              <br />
              100%. בלי שאלות מיותרות.
            </h2>
            <div
              className="inline-block px-8 py-4 rounded-2xl text-lg font-bold mt-2"
              style={{
                border: "2px solid rgba(212,161,74,0.7)",
                color: "#d4a14a",
                background: "rgba(212,161,74,0.1)",
              }}
            >
              חותמת ״החזר כספי 100%״
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 7 — BONUSES
      ════════════════════════════════════════════ */}
      <section id="bonuses" className="relative z-10 py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <h2
            className="fade-in-up text-4xl md:text-5xl font-black text-center mb-3"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            וזה לא הכל…
          </h2>
          <p
            className="fade-in-up text-2xl md:text-3xl text-center text-white/70 mb-16 font-semibold"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            הנה הבונוסים:
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              {
                icon: "🎁",
                title: "המתנה שאי אפשר לסרב לה: אנחנו עושים את זה בשבילכם",
                desc: "הצוות שלנו לוקח את תוצאות המיפוי שלכם ומייצר עבורכם מסמך מקצועי מוגמר — כזה שאפשר להציג לשותפים, משקיעים, או פשוט לשמור כ-SOP לעסק. לא תבנית. תוצר אמיתי מותאם אישית.",
                value: "(שווי אמיתי: תוצר מקצועי בהזמנה אישית — 1,930+מע״מ)",
              },
              {
                icon: "🎁",
                title: "מחקר מקיף עליכם ועל הנוכחות הדיגיטלית שלכם",
                desc: "לפני שנמפה — אנחנו חוקרים. הצוות שלנו בודק את הנוכחות הדיגיטלית שלכם: אתר, סושיאל, ביקורות, נראות בגוגל. כדי שהניתוח לא יהיה רק מה שאתם אומרים עלי עצמכם — אלא גם מה שהעולם רואה.",
                value: "(שווי אמיתי: ביקורת נוכחות דיגיטלית — 1,500+מע״מ)",
              },
              {
                icon: "🎁",
                title: "מחקר מתחרים מקיף",
                desc: "מי המתחרים שלכם? מה הם עושים? איפה הם חזקים מכם — ואיפה יש לכם יתרון שאתם לא מממשים? אנחנו עושים את המחקר הזה בשבילכם — כדי שתכנסו לתהליך עם תמונה מלאה.",
                value: "(שווי אמיתי: ניתוח תחרותי — 1,500₪+מע״מ)",
              },
              {
                icon: "🎁",
                title: "שבוע נוסף במערכת: המוח השני של העסק",
                desc: "אחרי שמקבלים את הניתוח — אפשר לגשת למערכת הצ׳אט החכמה שלנו ולשאול שאלות ספציפיות על העסק שלכם. AI שכבר מכיר אתכם, שיכול לעזור לכם לתעדף, לתכנן, ולבנות את הצעדים הבאים.",
                value: "(שווי אמיתי: שבוע ליווי AI אישי — 990₪+מע״מ)",
              },
            ].map((bonus, i) => (
              <div
                key={i}
                className="fade-in-up glass-card rounded-2xl p-7 flex flex-col gap-4"
                style={{ border: "1px solid rgba(212,161,74,0.2)" }}
              >
                <span className="text-4xl">{bonus.icon}</span>
                <h3
                  className="text-xl font-bold text-white leading-snug"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {bonus.title}
                </h3>
                <p className="text-white/65 text-sm leading-relaxed flex-1">
                  {bonus.desc}
                </p>
                <p className="value-text font-semibold">{bonus.value}</p>
              </div>
            ))}
          </div>

          {/* Total value summary */}
          <div
            className="fade-in-up text-center rounded-3xl py-10 px-8"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(14,165,233,0.1))",
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            <p className="text-white/60 text-lg mb-2">השווי הכולל של כל מה שמקבלים:</p>
            <p
              className="text-5xl md:text-6xl font-black strikethrough text-white/40 mb-2"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              23,942 ₪
            </p>
            <p className="text-white/50 text-sm">
              (וזה לפני מע״מ — כי זה מה שהיה עולה לשלם לכל אחד בנפרד)
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 8 — PRICE
      ════════════════════════════════════════════ */}
      <section
        id="price"
        className="relative z-10 py-24 px-5"
        style={{ background: "rgba(0,0,0,0.4)" }}
      >
        <div className="max-w-4xl mx-auto">
          <h2
            className="fade-in-up text-4xl md:text-5xl font-black text-center mb-14"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            אז מה ההשקעה כדי לקבל את כל זה?
          </h2>

          {/* Cost of inaction */}
          <div className="fade-in-up glass-card rounded-3xl p-8 mb-10">
            <p
              className="text-2xl font-bold text-white mb-5"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              כמה כבר עולה לכם לא לעשות את זה?
            </p>
            <div className="text-white/70 leading-relaxed space-y-3 text-base">
              <p>
                חישבו רגע: כמה שעות בשבוע מוציאים על משימות שאפשר לאוטומט? כפול השעה שלכם — זה מספר אמיתי שנדלק כל חודש, בשקט.
              </p>
              <p>
                כמה עולה עובד שעושה משהו שAI יכול לעשות? כמה עסקאות פספסתם כי התהליך איטי?
              </p>
              <p>
                <strong className="text-white">
                  רוב בעלי העסקים שאיתם דיברנו מגלים שהם מאבדים בין 3,000 ל-12,000 ₪ בחודש — מבלי לדעת.
                </strong>
              </p>
            </div>
          </div>

          {/* Comparison box */}
          <div className="fade-in-up grid md:grid-cols-2 gap-4 mb-12">
            <div className="glass-card rounded-2xl p-7 text-center">
              <p className="text-white/50 text-sm mb-2">יועץ AI חיצוני</p>
              <p
                className="text-3xl font-black text-white/40"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                3,000-8,000 ₪
              </p>
              <p className="text-white/40 text-sm mt-1">לחודש</p>
            </div>
            <div
              className="rounded-2xl p-7 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(79,70,229,0.2), rgba(14,165,233,0.15))",
                border: "2px solid rgba(99,102,241,0.5)",
                animation: "pulse-glow 3s ease infinite",
              }}
            >
              <p className="text-indigo-300 text-sm mb-2 font-semibold">BizMap</p>
              <p
                className="text-4xl font-black text-white"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                497 ₪
              </p>
              <p className="text-indigo-300 text-sm mt-1">חד-פעמי</p>
            </div>
          </div>

          {/* Large price display */}
          <div className="fade-in-up text-center mb-12">
            <p
              className="text-4xl font-black strikethrough text-white/30 mb-3"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              23,942 ₪
            </p>
            <div className="text-5xl text-white/50 mb-3">↓</div>
            <p
              className="text-7xl md:text-8xl font-black gradient-text"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              497 ₪
            </p>
            <p className="text-xl text-white/60 mt-4 font-semibold">
              תשלום חד-פעמי. לא חודשי. לא מנוי.
            </p>
          </div>

          {/* Personal note */}
          <div
            className="fade-in-up rounded-3xl p-8 mb-12 text-white/75 text-base italic leading-relaxed"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p className="text-white font-bold not-italic text-lg mb-4" style={{ fontFamily: "var(--font-manrope)" }}>
              💬 הערה אישית:
            </p>
            <p>
              בניתי את BizMap כי אני בעצמי שילמתי. שילמתי ליועצים שלא הכירו את העסק שלי. שילמתי על כלים שלא ידעתי איפה להכניס אותם. שילמתי — במשמעות הכי כואבת — בזמן שאבד, בהחלטות שהתקבלו מהבטן ולא מנתונים.
            </p>
            <p className="mt-4">
              אם היה לי מישהו שיראה לי את העסק מלמעלה, בשפה פשוטה, בלי עגה של יועצים — הייתי חוסך שנתיים.
            </p>
            <p className="mt-4">
              <strong className="text-white not-italic">BizMap הוא הדבר הזה.</strong>
            </p>
          </div>

          {/* CTA */}
          <div className="fade-in-up text-center">
            <CtaButton />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 9 — HOW IT WORKS
      ════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 py-24 px-5">
        <div className="max-w-4xl mx-auto">
          <h2
            className="fade-in-up text-4xl md:text-5xl font-black text-center mb-16"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            תכירו את השיטה של BizMap
          </h2>

          <div className="flex flex-col gap-8">
            {[
              {
                step: 1,
                title: "מיפוי ושאלות",
                desc: "נכנסים למערכת, עונים על שאלות מנחות על העסק שלכם. לא שאלון גנרי — שאלות חכמות שמבוססות על AI ומכוונות לפי סוג העסק, הגודל, והאתגרים שלכם.",
              },
              {
                step: 2,
                title: "רואים את העסק מלמעלה בפעם הראשונה",
                desc: "המערכת מייצרת ויזואליזציה מלאה של תהליכי העסק שלכם — מי, מה, מתי, ואיך. לראשונה תוכלו לראות את הכל במקום אחד.",
              },
              {
                step: 3,
                title: "מוצאים את הדליפה הגדולה ביותר",
                desc: "AI מנתח את המפה ומזהה את נקודת הדליפה הקריטית — שם שהכי הרבה כסף יוצא בשקט. ומקבלים את הצעדים הראשונים לסגור אותה.",
              },
              {
                step: 4,
                title: "בונים את מפת ה-AI של העסק שלך",
                desc: "על בסיס המפה, AI ממפה בדיוק אילו כלים, אילו אוטומציות, ואילו תהליכים — ספציפית לעסק שלכם. לא גנרי. לא 'נסו ChatGPT'. תוכנית אמיתית.",
              },
              {
                step: 5,
                title: "מחליפים את היועץ העסקי שלך",
                desc: "השבוע במערכת הוא לשאלות: שולחים שאלות, מקבלים תשובות שמבוססות על הנתונים הספציפיים שלכם. AI שכבר מכיר את העסק — וזמין תמיד.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="fade-in-up flex gap-6 items-start relative"
              >
                <div
                  className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-white relative z-10"
                  style={{
                    background: "linear-gradient(135deg, #4f46e5, #0ea5e9)",
                    boxShadow: "0 0 20px rgba(79,70,229,0.4)",
                    fontFamily: "var(--font-manrope)",
                  }}
                >
                  {item.step}
                </div>
                {i < 4 && (
                  <div
                    style={{
                      position: "absolute",
                      right: "22px",
                      top: "56px",
                      width: "2px",
                      bottom: "-40px",
                      background: "linear-gradient(to bottom, rgba(99,102,241,0.4), transparent)",
                    }}
                  />
                )}
                <div className="glass-card rounded-2xl p-6 flex-1">
                  <h3
                    className="text-xl font-bold text-white mb-3"
                    style={{ fontFamily: "var(--font-manrope)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-white/65 text-base leading-relaxed mb-4">
                    {item.desc}
                  </p>
                  <MockupPlaceholder label={`מוקאפ שלב ${item.step}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 10 — SCARCITY
      ════════════════════════════════════════════ */}
      <section
        id="scarcity"
        className="relative z-10 py-20 px-5"
        style={{ background: "rgba(0,0,0,0.4)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="fade-in-up rounded-3xl p-10 md:p-14"
            style={{
              border: "2px solid rgba(245,158,11,0.5)",
              background: "rgba(245,158,11,0.05)",
            }}
          >
            <div className="text-center mb-8">
              <span className="text-4xl">⚠️</span>
              <h2
                className="text-2xl md:text-3xl font-black text-white mt-4 mb-2"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                ולפני שתחליטו — משהו אישי שחשוב לי שתדעו:
              </h2>
            </div>
            <div className="text-white/75 leading-relaxed space-y-4 text-base mb-10">
              <p>
                ה-30 בעלי העסקים הראשונים שנכנסים מקבלים משהו שאחרים לא יקבלו: אני בעצמי (עמית ועקנין) מביט על הניתוח שלהם ונותן שכבה נוספת של תובנות אישיות.
              </p>
              <p>
                זה לא סקיילבל. לכן זה מוגבל ל-30 מקומות בלבד.
              </p>
              <p>
                ברגע שה-30 מקומות מתמלאים — המחיר עולה, והמגע האישי שלי יוצא מהמשוואה.
              </p>
            </div>

            {/* Counter */}
            <div className="text-center">
              <div
                className="inline-block rounded-2xl px-10 py-7"
                style={{
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.4)",
                }}
              >
                <p className="text-amber-400/70 text-sm mb-2 font-semibold">מתוך 30 מקומות</p>
                <p
                  className="text-6xl font-black scarcity-counter"
                  style={{ color: "#f59e0b", fontFamily: "var(--font-manrope)" }}
                >
                  23
                </p>
                <p className="text-amber-400/70 text-sm mt-2">מקומות נותרו</p>
              </div>
              <p className="text-white/50 text-base mt-6">
                לכן ההצעה הזו יכולה להיסגר בכל רגע.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 11 — WHO WE ARE
      ════════════════════════════════════════════ */}
      <section id="about" className="relative z-10 py-24 px-5">
        <div className="max-w-4xl mx-auto">
          <h2
            className="fade-in-up text-4xl md:text-5xl font-black text-center mb-16"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            מי אנחנו ולמה להקשיב לנו?
          </h2>

          <div className="fade-in-up glass-card rounded-3xl p-10 md:p-14 flex flex-col md:flex-row gap-10 items-start">
            {/* Photo placeholder */}
            <div
              className="shrink-0 w-40 h-40 rounded-2xl flex items-center justify-center text-white/30 text-sm text-center mx-auto md:mx-0"
              style={{
                border: "1px dashed rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.03)",
                minWidth: "160px",
              }}
            >
              תמונה
              <br />
              עמית ועקנין
            </div>

            <div className="flex-1 text-white/75 leading-relaxed space-y-4 text-base">
              <p className="text-white font-bold text-2xl" style={{ fontFamily: "var(--font-manrope)" }}>
                קוראים לי עמית ועקנין
              </p>
              <p>
                ויזמתי ובניתי עסקים ומערכות טכנולוגיות בשנים האחרונות. ראיתי מקרוב כמה כסף בעלי עסקים מאבדים — לא בגלל שהם לא חכמים, אלא כי אף פעם לא עצרו לראות את התמונה המלאה.
              </p>
              <p>
                עם הכניסה של AI לחיי היומיום, הבנתי שיש כאן הזדמנות חד-פעמית: לאפשר לבעלי עסקים קטנים ובינוניים לקבל ניתוח שפעם היה שייך רק לחברות גדולות.
              </p>
              <p>
                BizMap היא התוצאה של אותה הבנה.
              </p>

              {/* Logo placeholder */}
              <div
                className="inline-block mt-4 px-6 py-3 rounded-xl text-white/40 text-sm"
                style={{
                  border: "1px dashed rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                לוגו BizMap
              </div>

              <p className="pt-4">
                <strong className="text-white">ולא לבד.</strong> מאחורי BizMap עומד צוות של מפתחים ומומחי AI שמוודא שהניתוח שתקבלו הוא ברמה שרק חברות גדולות יכלו להרשות לעצמן לפני.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 12 — FAQ
      ════════════════════════════════════════════ */}
      <section
        id="faq"
        className="relative z-10 py-24 px-5"
        style={{ background: "rgba(0,0,0,0.35)" }}
      >
        <div className="max-w-3xl mx-auto">
          <h2
            className="fade-in-up text-4xl md:text-5xl font-black text-center mb-14"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            שאלות ששווה לשאול לפני שמתחילים
          </h2>

          <div className="fade-in-up flex flex-col gap-3">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl overflow-hidden"
                style={{ border: openFaq === i ? "1px solid rgba(99,102,241,0.4)" : undefined }}
              >
                <button
                  id={`faq-btn-${i}`}
                  className="w-full text-right px-7 py-5 flex items-center justify-between gap-4 text-white font-semibold text-base hover:text-indigo-300 transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{item.q}</span>
                  <span
                    className="shrink-0 text-indigo-400 text-xl transition-transform"
                    style={{
                      transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  id={`faq-content-${i}`}
                  className={`accordion-content ${openFaq === i ? "open" : ""}`}
                >
                  <p className="px-7 pb-6 text-white/65 text-sm leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 13 — FINAL CTA
      ════════════════════════════════════════════ */}
      <section
        id="final-cta"
        className="relative z-10 py-28 px-5"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(79,70,229,0.12) 50%, rgba(0,0,0,0.3) 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="fade-in-up glass-card rounded-3xl p-12 md:p-20">
            <p
              className="text-white/60 text-xl mb-6 leading-relaxed"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              יש הבדל אחד בין עסק שמרוויח יותר לעסק שמתחרה במחיר:
            </p>
            <h2
              className="text-3xl md:text-5xl font-black hero-headline mb-8 leading-tight"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              העסק המרוויח ידע בדיוק
              <br />
              <span className="gradient-text">איפה הוא עומד.</span>
            </h2>
            <p className="text-white/65 text-lg leading-relaxed mb-12 max-w-2xl mx-auto">
              עכשיו יש לכם הזדמנות לראות את העסק שלכם מלמעלה. לא מהבטן. לא מהתחושה. אלא בדיוק — עם ניתוח AI מותאם אישית, מפת תהליכים, זיהוי הדליפות, ותוכנית AI ספציפית לעסק שלכם.
            </p>

            <h3
              className="text-2xl md:text-3xl font-black text-white mb-8"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              אני רוצה לראות את העסק שלי מלמעלה
            </h3>

            <Link
              href="/checkout"
              id="final-cta-btn"
              className="shimmer-btn inline-flex items-center justify-center gap-3 px-10 py-6 rounded-2xl text-xl font-black text-white transition-all hover:scale-[1.04] active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)",
                boxShadow: "0 6px 40px rgba(79,70,229,0.55)",
                fontFamily: "var(--font-manrope)",
                animation: "pulse-glow 3s ease infinite",
              }}
            >
              התחל עכשיו — 497 ₪ בלבד ←
            </Link>

            <p className="text-white/40 text-sm mt-6">
              תשלום מאובטח · אחריות החזר 100% · ביטול תוך 14 יום
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-5 text-center border-t border-white/5">
        <p className="text-white/30 text-sm">
          © 2025 BizMap · כל הזכויות שמורות
        </p>
      </footer>
    </div>
  );
}
