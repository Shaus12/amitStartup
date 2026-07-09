"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronDown,
  Clock,
  Layers,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Workflow,
  Zap,
} from "lucide-react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const C = {
  bg: "#070b1a",
  bg2: "#0d1530",
  panel: "rgba(13,21,48,0.78)",
  panel2: "rgba(9,15,34,0.92)",
  line: "rgba(234,240,255,0.12)",
  line2: "rgba(79,139,255,0.28)",
  text: "#eaf0ff",
  sub: "#aeb9d7",
  muted: "#7f8aaa",
  blue: "#4f8bff",
  teal: "#2dd4bf",
  green: "#22c55e",
  gold: "#f5c451",
  red: "#f97373",
} as const;

const MF = { fontFamily: "var(--font-heebo, var(--font-manrope, system-ui))" };
const IF = { fontFamily: "var(--font-heebo, var(--font-inter, system-ui))" };

const shell =
  "rounded-2xl border border-white/10 bg-[rgba(13,21,48,0.72)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_80px_rgba(0,0,0,0.34)]";

function scrollToSignup() {
  document.getElementById("workshop-signup")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Section({
  children,
  id,
  tone = "base",
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  tone?: "base" | "deep";
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden px-5 py-18 md:px-8 md:py-24 ${className}`}
      style={{ backgroundColor: tone === "deep" ? C.bg2 : C.bg }}
      dir="rtl"
    >
      <div className="relative mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={scrollToSignup}
      className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-extrabold text-[#06101c] transition duration-200 hover:-translate-y-0.5 active:translate-y-px md:px-8"
      style={{
        ...MF,
        background: `linear-gradient(135deg, ${C.teal}, ${C.blue})`,
        boxShadow: `0 18px 42px ${C.blue}35`,
      }}
    >
      <span className="whitespace-nowrap">{children}</span>
      <ArrowLeft className="h-5 w-5 shrink-0" strokeWidth={2.5} />
    </button>
  );
}

function SoftButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-6 py-4 text-base font-bold text-[#eaf0ff] transition duration-200 hover:border-white/22 hover:bg-white/[0.07] active:translate-y-px"
      style={MF}
    >
      <span className="whitespace-nowrap">{children}</span>
      <ArrowLeft className="h-5 w-5 shrink-0" strokeWidth={2.5} />
    </Link>
  );
}

const painItems = [
  "פתחתם ChatGPT, קיבלתם כמה תשובות יפות, ואז זה נשאר עוד כלי בצד.",
  "יש יותר מדי מדריכים, מודלים, אוטומציות ושמות. אין לכם זמן להבין מה באמת מתאים לעסק.",
  "העבודה עדיין חוזרת אליכם: הודעות, דוחות, פולואפים, תפעול, החלטות קטנות שגומרות את היום.",
];

const scenarios = [
  {
    title: "פניות לקוחות לא אוכלות את הבוקר",
    body: "שאלות שחוזרות על עצמן מקבלות מענה מסודר, והמעבר לנציג אנושי קורה רק כשצריך.",
  },
  {
    title: "דוחות שלא נכתבים לבד מתחילים לזוז",
    body: "מידע שנמצא אצלכם במערכת הופך לסיכום, משימות, תובנות והמשך טיפול ברור.",
  },
  {
    title: "העסק לא מחכה רק לכם",
    body: "תהליכים שתלויים בזיכרון שלכם מקבלים מבנה, אחריות, ותנועה גם בין פגישות.",
  },
];

const sessions = [
  {
    icon: Workflow,
    title: "מפגש ראשון: מאוטומציה אחת לתהליך שעובד",
    body: "יוצאים עם הבנה איפה נכון להתחיל, מה לא לבנות, ואיך להפוך משימה חוזרת לזרימה עסקית.",
  },
  {
    icon: Bot,
    title: "מפגש שני: סוכן AI עם תפקיד ברור",
    body: "מגדירים עובד AI שמקבל מידע, מקבל גבולות, ומבצע עבודה שאפשר לסמוך עליה.",
  },
  {
    icon: Layers,
    title: "מפגש שלישי: מערכת ולא אוסף כלים",
    body: "מחברים ידע, תהליכים ואחריות למבנה אחד, כדי שהעסק יפסיק להישען על אלתורים.",
  },
  {
    icon: Sparkles,
    title: "מפגש רביעי: העלייה להרמס",
    body: "מבינים איך נראית פסגת הרמות בעסק שלכם, ומה הצעדים הבאים אחרי המחזור.",
  },
];

const bonuses = [
  ["ספריית Skills לעסק", "פרומפטים ותבניות חשיבה מוכנות לתפקידים שחוזרים בעסק.", "₪1,200"],
  ["תבניות אוטומציה", "מבני עבודה כלליים שאפשר להתאים לתהליכי שירות, מכירות ותפעול.", "₪1,400"],
  ["מיני קורסים קצרים", "שיעורים ממוקדים להשלמת פערים בין המפגשים, בלי להציף את היומן.", "₪900"],
  ["ערכת יישום למחזור הראשון", "צ'ק ליסטים, דוגמאות ומסמכי עבודה שיעזרו להפוך רעיון למהלך.", "₪1,100"],
  ["ליווי בין המפגשים", "מקום לשאלות, תיקונים והכוונה כדי שלא תישארו לבד אחרי ה-Zoom.", "₪1,600"],
];

const faqs = [
  {
    q: "אין לי רקע טכני. זה מתאים לי?",
    a: "כן. הסדנה מיועדת לבעלי עסקים ולא למפתחים. נבנה את החשיבה, הגבולות והיישום בצורה עסקית וברורה.",
  },
  {
    q: "אין לי הרבה זמן. מה נדרש בין המפגשים?",
    a: "המטרה היא התקדמות קטנה ומעשית בכל שבוע. יהיו משימות קצרות, תמיכה והכוונה כדי לשמור על רצף בלי להפוך את זה לעוד עבודה כבדה.",
  },
  {
    q: "איך אדע שזה יעבוד לעסק שלי?",
    a: "אנחנו עובדים מתוך העסק שלכם: התהליכים, הלקוחות, הצוות והכאבים האמיתיים. לא כולם בונים אותו דבר, ולכן הקבוצה קטנה.",
  },
  {
    q: "מה בדיוק קורה במפגשים?",
    a: "כל מפגש הוא צעד ברמות: מאוטומציות, דרך סוכנים, ועד מערכת. זה לא סילבוס תיאורטי, אלא מסע יישומי שמתקדם עם העסק שלכם.",
  },
  {
    q: "מתי זה מתחיל וכמה זה עולה?",
    a: "המחזור הראשון ייפתח כמה שבועות אחרי הוובינר. ההשקעה צפויה להיות באזור ₪3,500, והפרטים הסופיים יישלחו לרשימת ההמתנה לפני פתיחת ההרשמה.",
  },
];

function Hero() {
  return (
    <section
      className="relative isolate flex min-h-[76dvh] items-center overflow-hidden px-5 py-20 md:min-h-[82dvh] md:px-8 md:py-24"
      style={{
        ...IF,
        backgroundColor: C.bg,
      }}
      dir="rtl"
    >
      {/* Dynamic Background Grid & Mask */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Glowing Orbs */}
      <div className="absolute -z-10 left-1/2 top-0 -translate-x-1/2 h-[400px] w-[800px] opacity-20 blur-[100px] bg-gradient-to-r from-[#4f8bff] to-[#2dd4bf] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute -z-10 left-1/4 bottom-1/4 h-[300px] w-[500px] opacity-[0.15] blur-[100px] bg-[#f5c451] rounded-full mix-blend-screen pointer-events-none" />

      <div className="relative mx-auto w-full max-w-5xl text-center">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-[#aeb9d7] shadow-sm backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-[#2dd4bf]" />
          מחזור ראשון, קבוצה קטנה של 8-15 בעלי עסקים
        </p>
        
        <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.12] text-[#eaf0ff] md:text-6xl drop-shadow-sm" style={MF}>
          עסק יעיל יותר. פחות זמן, יותר רווח בעזרת{" "}
          <span dir="ltr" className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#2dd4bf] to-[#4f8bff]">
            AI
          </span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#aeb9d7] md:text-xl drop-shadow-sm" style={IF}>
          סדנת Zoom מעשית של 4 שבועות שמובילה אתכם מיסודות חינמיים למערכת AI שעובדת בתוך העסק.
        </p>
        
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <PrimaryButton>הצטרפו לרשימת ההמתנה למחזור הראשון</PrimaryButton>
          <SoftButton href="/ai-level">גלו את רמת ה-AI שלכם</SoftButton>
        </div>
        
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-[#7f8aaa]">
          <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#22c55e]" />פרקטיקה מעשית</span>
          <span className="hidden h-1.5 w-1.5 rounded-full bg-[#7f8aaa]/50 sm:block" />
          <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#22c55e]" />ללא רקע טכני</span>
          <span className="hidden h-1.5 w-1.5 rounded-full bg-[#7f8aaa]/50 sm:block" />
          <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#22c55e]" />החזר מובטח</span>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = [
    { icon: Clock, title: "4 מפגשי Zoom", body: "פעם בשבוע" },
    { icon: MessageCircle, title: "ליווי בין מפגשים", body: "שאלות והכוונה" },
    { icon: ShieldCheck, title: "אחריות אחרי מפגש ראשון", body: "החזר אם זה לא מתאים" },
  ];

  return (
    <section className="border-y border-white/10 bg-[#0d1530] px-5 py-5 md:px-8" dir="rtl">
      <div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-center gap-3 rounded-xl bg-white/[0.035] px-4 py-3">
              <Icon className="h-5 w-5 shrink-0 text-[#2dd4bf]" />
              <div>
                <p className="text-sm font-extrabold text-[#eaf0ff]">{item.title}</p>
                <p className="mt-0.5 text-xs font-semibold text-[#aeb9d7]">{item.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PainAndVision() {
  return (
    <>
      <Section>
        <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-center">
          <div>
            <h2 className="max-w-2xl text-3xl font-black leading-tight text-[#eaf0ff] md:text-5xl" style={MF}>
              אתם יודעים ש-AI יכול לשנות את העסק. לבד זה פשוט נתקע.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#aeb9d7]">
              רוב בעלי העסקים לא צריכים עוד כלי. הם צריכים מסלול שמחבר בין העבודה האמיתית בעסק לבין יישום שאפשר להחזיק לאורך זמן.
            </p>
          </div>
          <div className="grid gap-4">
            {painItems.map((item) => (
              <div key={item} className={`${shell} flex gap-4 p-5`}>
                <Zap className="mt-1 h-5 w-5 shrink-0 text-[#2dd4bf]" />
                <p className="text-lg font-semibold leading-8 text-[#eaf0ff]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="deep">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black leading-tight text-[#eaf0ff] md:text-5xl" style={MF}>
            אחרי זה, AI מפסיק להיות צעצוע ומתחיל להיות כוח עבודה
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#aeb9d7]">
            לא הבטחות מנופחות. תרחישים יומיומיים שבהם עבודה שכבר קיימת בעסק מקבלת ידיים, זיכרון וקצב.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {scenarios.map((item) => (
            <article key={item.title} className={`${shell} p-6`}>
              <h3 className="text-xl font-extrabold text-[#eaf0ff]" style={MF}>
                {item.title}
              </h3>
              <p className="mt-4 text-base leading-8 text-[#aeb9d7]">{item.body}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}

function LevelsMap() {
  return (
    <Section id="levels-map">
      <div className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
        <div className={`${shell} overflow-hidden p-4 md:p-6`}>
          <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#050814]">
            <Image
              src="/levels-map.png"
              alt="מפת 7 רמות ה-AI של BizMap, מבסיס ירוק של רמות יסוד ועד פסגת Hermes בזהב"
              width={1254}
              height={1254}
              sizes="(min-width: 1024px) 48vw, 92vw"
              className="h-auto w-full object-contain"
            />
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-black leading-tight text-[#eaf0ff] md:text-5xl" style={MF}>
            7 רמות בדרך ל-AI שעובד בשבילכם
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#aeb9d7]">
            התוכן החינמי שלנו מביא אתכם לשלב היסודות: שיחה, נכסים ותהליכי עבודה. שם רוב העסקים נעצרים.
          </p>
          <div className="mt-8 grid gap-4">
            <div className="rounded-2xl border border-[#22c55e]/25 bg-[#22c55e]/10 p-5">
              <h3 className="text-xl font-extrabold text-[#86efac]">רמות 1-3: Foundation stage</h3>
              <p className="mt-2 leading-7 text-[#c7d2ee]">מה שאפשר ללמוד דרך התוכן החינמי: לדבר נכון עם AI, להכין נכסים, ולבנות תהליכי עבודה בסיסיים.</p>
            </div>
            <div className="rounded-2xl border border-[#f5c451]/28 bg-[#f5c451]/10 p-5">
              <h3 className="text-xl font-extrabold text-[#f5c451]">רמות 4-7: Pro stage</h3>
              <p className="mt-2 leading-7 text-[#c7d2ee]">כאן הסדנה נכנסת: אוטומציות, סוכנים, מערכת, ובסוף Hermes כמטרה שמראה לאן העסק יכול להגיע.</p>
            </div>
          </div>
          <p className="mt-6 text-base leading-7 text-[#aeb9d7]">
            אם כבר עשיתם את מבחן הרמה, זה יתחבר לכם מיד. אם לא, אפשר{" "}
            <Link href="/ai-level" className="font-extrabold text-[#2dd4bf] underline-offset-4 hover:underline">
              לגלות את רמת ה-AI שלכם כאן
            </Link>
            .
          </p>
        </div>
      </div>
    </Section>
  );
}

function Includes() {
  const proPath = [
    ["רמה 4", "אוטומציות"],
    ["רמה 5", "סוכנים"],
    ["רמה 6", "מערכת"],
    ["רמה 7", "Hermes"],
  ];

  return (
    <Section tone="deep">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-black leading-tight text-[#eaf0ff] md:text-5xl" style={MF}>
          4 שבועות, כל שבוע עולים רמה
        </h2>
        <p className="mt-5 text-lg leading-8 text-[#aeb9d7]">
          זה לא סילבוס של מושגים. זה מסע שמתקדם לפי המקום שבו העסק שלכם נמצא.
        </p>
      </div>
      <div className={`${shell} mx-auto mt-10 max-w-4xl p-5`}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-extrabold text-[#eaf0ff]" style={MF}>
            המסלול בסדנה
          </h3>
          <span className="rounded-full bg-[#2dd4bf]/12 px-3 py-1 text-sm font-bold text-[#2dd4bf]">
            Pro stage
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {proPath.map(([level, label]) => (
            <div key={level} className="flex items-center gap-3 rounded-xl bg-[#070b1a]/70 p-3">
              <Check className="h-4 w-4 shrink-0 text-[#2dd4bf]" />
              <div>
                <p className="text-sm font-bold text-[#7f8aaa]">{level}</p>
                <p className="font-extrabold text-[#eaf0ff]">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {sessions.map((session) => {
          const Icon = session.icon;
          return (
            <article key={session.title} className={`${shell} p-6`}>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#4f8bff]/28 bg-[#4f8bff]/12 text-[#4f8bff]">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-[#eaf0ff]" style={MF}>
                {session.title}
              </h3>
              <p className="mt-3 leading-8 text-[#aeb9d7]">{session.body}</p>
            </article>
          );
        })}
      </div>
      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-[#2dd4bf]/24 bg-[#2dd4bf]/10 p-6 text-center">
        <MessageCircle className="mx-auto mb-3 h-7 w-7 text-[#2dd4bf]" />
        <p className="text-lg font-bold leading-8 text-[#eaf0ff]">
          בין המפגשים תקבלו תמיכה והכוונה, כדי שהיישום לא ייפול בין החיים, הלקוחות והיומן.
        </p>
      </div>
    </Section>
  );
}

function ValueStack() {
  const total = "₪6,200+";

  return (
    <Section>
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h2 className="text-3xl font-black leading-tight text-[#eaf0ff] md:text-5xl" style={MF}>
            הבונוסים שמקצרים את הדרך ליישום
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#aeb9d7]">
            המחזור הראשון יקבל סביבת עבודה רחבה יותר מהמפגשים עצמם, כדי שיהיה לכם עם מה להמשיך.
          </p>
        </div>

        <div className={`${shell} mt-10 overflow-hidden`}>
          {bonuses.map(([title, body, value]) => (
            <div key={title} className="grid gap-3 border-b border-white/8 p-5 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h3 className="text-lg font-extrabold text-[#eaf0ff]">{title}</h3>
                <p className="mt-2 leading-7 text-[#aeb9d7]">{body}</p>
              </div>
              <p className="text-xl font-black text-[#2dd4bf]" dir="ltr">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border border-[#4f8bff]/28 bg-[#4f8bff]/10 p-6 md:p-8">
          <div className="text-center md:text-right">
            <h3 className="text-2xl font-black text-[#eaf0ff]" style={MF}>ההשקעה בסדנה</h3>
            <p className="mt-2 text-base text-[#aeb9d7]">המחיר כולל את הסדנה, המפגשים וכל הבונוסים.</p>
          </div>
          <div className="flex flex-col items-center md:items-end">
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-[#7f8aaa] line-through decoration-[#f97373] decoration-2" dir="ltr">
                {total}
              </span>
              <span className="text-5xl font-black text-[#2dd4bf]" dir="ltr">
                ₪3,500
              </span>
            </div>
          </div>
        </div>
        
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-8 text-[#aeb9d7]">
          ההרשמה כרגע היא לרשימת המתנה בלבד. הפרטים הסופיים יישלחו לפני פתיחת המחזור.
        </p>
      </div>
    </Section>
  );
}

function AuthorityGuaranteeUrgency() {
  return (
    <>
      <Section tone="deep">
        <div className="grid gap-6 md:grid-cols-3">
          <article className={`${shell} p-6 md:col-span-2`}>
            <Users className="mb-5 h-8 w-8 text-[#4f8bff]" />
            <h2 className="text-3xl font-black leading-tight text-[#eaf0ff] md:text-5xl" style={MF}>
              מי שמוביל אתכם כבר 4 שנים מיישם AI בעסקים אמיתיים
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#aeb9d7]">
              BizMap מגיעה מתוך עבודה עם תהליכים, צוותים, שירות, מכירות ותפעול. הסדנה היא מחזור ראשון, אבל היישום עצמו לא מתחיל מאפס.
            </p>
          </article>
          <article className={`${shell} p-6`}>
            <ShieldCheck className="mb-5 h-8 w-8 text-[#22c55e]" />
            <h2 className="text-2xl font-black leading-tight text-[#eaf0ff]" style={MF}>
              אחריות אחרי המפגש הראשון
            </h2>
            <p className="mt-4 leading-8 text-[#aeb9d7]">
              נכנסתם למפגש הראשון ולא הרגשתם שזה בשבילכם? תקבלו החזר כספי. המטרה היא להוריד סיכון, לא ללחוץ.
            </p>
          </article>
        </div>
      </Section>

      <Section>
        <div className={`${shell} mx-auto max-w-4xl p-7 text-center md:p-10`}>
          <Clock className="mx-auto mb-5 h-9 w-9 text-[#f5c451]" />
          <h2 className="text-3xl font-black leading-tight text-[#eaf0ff] md:text-5xl" style={MF}>
            המחזור הראשון קטן בכוונה
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#aeb9d7]">
            אנחנו מגבילים את הקבוצה ל-8-15 אנשים כדי לתת תשומת לב אמיתית. הרשימה היא הדרך לקבל את הפרטים לפני פתיחת המקומות.
          </p>
          <div className="mt-8">
            <PrimaryButton>שמרו מקום ברשימת ההמתנה</PrimaryButton>
          </div>
        </div>
      </Section>
    </>
  );
}

function FAQ() {
  return (
    <Section tone="deep">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-black leading-tight text-[#eaf0ff] md:text-5xl" style={MF}>
          שאלות שעולות לפני שמצטרפים
        </h2>
        <div className="mt-10 space-y-3">
          {faqs.map((item) => (
            <details key={item.q} className={`${shell} group p-5`}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-extrabold text-[#eaf0ff]">
                {item.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-[#7f8aaa] transition group-open:rotate-180" />
              </summary>
              <p className="mt-4 leading-8 text-[#aeb9d7]">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const leadTrackedRef = useRef(false);

  const isValidPhone = (value: string) => /^05\d{8}$/.test(value.replace(/\D/g, ""));
  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "loading" || status === "success") return;

    setError("");
    if (!name.trim()) {
      setError("נא למלא שם מלא");
      return;
    }
    if (!isValidEmail(email)) {
      setError("נא להזין אימייל תקין");
      return;
    }
    if (!isValidPhone(phone)) {
      setError("נא להזין מספר טלפון תקין בפורמט 05XXXXXXXX");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.replace(/\D/g, ""),
          message: `Email: ${email.trim()}`,
          source: "workshop",
        }),
      });
      if (!res.ok) throw new Error("Lead request failed");
      setStatus("success");
      if (!leadTrackedRef.current && typeof window !== "undefined" && window.fbq) {
        leadTrackedRef.current = true;
        window.fbq("track", "Lead");
      }
    } catch {
      setStatus("error");
      setError("משהו השתבש. נסו שוב בעוד רגע או פנו אלינו ישירות.");
    }
  };

  if (status === "success") {
    return (
      <div className={`${shell} p-7 text-center md:p-10`}>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/14 text-[#22c55e]">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-black text-[#eaf0ff]" style={MF}>
          נרשמת לרשימת ההמתנה!
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-[#aeb9d7]">
          נהיה בקשר עם הפרטים הסופיים של המחזור הראשון.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`${shell} p-6 md:p-8`} noValidate>
      <div className="grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-[#eaf0ff]">שם מלא</span>
          <span className="relative">
            <User className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7f8aaa]" />
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="h-14 w-full rounded-xl border border-white/12 bg-[#070b1a]/78 pr-12 pl-4 text-base font-semibold text-[#eaf0ff] outline-none transition placeholder:text-[#7f8aaa] focus:border-[#2dd4bf]"
              placeholder="איך לפנות אליכם?"
            />
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-[#eaf0ff]">אימייל</span>
          <span className="relative">
            <Mail className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7f8aaa]" />
            <input
              type="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              dir="ltr"
              className="h-14 w-full rounded-xl border border-white/12 bg-[#070b1a]/78 pr-12 pl-4 text-right text-base font-semibold text-[#eaf0ff] outline-none transition placeholder:text-[#7f8aaa] focus:border-[#2dd4bf]"
              placeholder="name@example.com"
            />
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-[#eaf0ff]">טלפון</span>
          <span className="relative">
            <Phone className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7f8aaa]" />
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              dir="ltr"
              className="h-14 w-full rounded-xl border border-white/12 bg-[#070b1a]/78 pr-12 pl-4 text-right text-base font-semibold text-[#eaf0ff] outline-none transition placeholder:text-[#7f8aaa] focus:border-[#2dd4bf]"
              placeholder="05XXXXXXXX"
            />
          </span>
        </label>

        {error ? (
          <p className="rounded-xl border border-[#f97373]/28 bg-[#f97373]/10 px-4 py-3 text-sm font-bold text-[#fecaca]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 inline-flex h-14 items-center justify-center gap-2 rounded-xl px-6 text-base font-extrabold text-[#06101c] transition duration-200 hover:-translate-y-0.5 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            ...MF,
            background: `linear-gradient(135deg, ${C.teal}, ${C.blue})`,
            boxShadow: `0 18px 42px ${C.blue}35`,
          }}
        >
          {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          הצטרפו לרשימת ההמתנה למחזור הראשון
        </button>
      </div>
    </form>
  );
}

function ClosingCTA() {
  return (
    <Section id="workshop-signup">
      <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <div className="lg:sticky lg:top-8">
          <h2 className="text-3xl font-black leading-tight text-[#eaf0ff] md:text-5xl" style={MF}>
            רוצים להיות בין הראשונים שנכנסים למחזור הראשון?
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#aeb9d7]">
            השאירו פרטים ונחזור אליכם עם תאריך, השקעה סופית, התאמה לקבוצה והשלבים הבאים.
          </p>
          <div className="mt-7 grid gap-3 text-base font-bold text-[#c7d2ee]">
            <span className="flex items-center gap-3"><Check className="h-5 w-5 text-[#2dd4bf]" />אין תשלום עכשיו</span>
            <span className="flex items-center gap-3"><Check className="h-5 w-5 text-[#2dd4bf]" />קבוצה קטנה וליווי בין המפגשים</span>
            <span className="flex items-center gap-3"><Check className="h-5 w-5 text-[#2dd4bf]" />אחריות אחרי המפגש הראשון</span>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <SoftButton href="/webinar">עוד לא בטוחים? וובינר חינם</SoftButton>
            <SoftButton href="/ai-level">גלו את רמת ה-AI שלכם</SoftButton>
          </div>
        </div>
        <WaitlistForm />
      </div>
    </Section>
  );
}

function Nav() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "rgba(7,11,26,0.80)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 md:px-8" dir="rtl">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo.png" alt="BizMap" width={27} height={27} className="object-contain" />
          <span className="text-sm font-bold tracking-tight text-[#eaf0ff]" style={MF}>BizMap</span>
        </Link>
        <button
          onClick={scrollToSignup}
          className="rounded-lg px-4 py-2 text-xs font-bold md:text-sm transition-all duration-200"
          style={{ ...MF, background: `${C.blue}18`, color: C.blue, border: `1px solid ${C.blue}30` }}
        >
          רשימת המתנה
        </button>
      </div>
    </header>
  );
}

export function WorkshopPageClient() {
  return (
    <main className="min-h-screen bg-[#070b1a] text-[#eaf0ff]" style={IF}>
      <Nav />
      <Hero />
      <TrustStrip />
      <PainAndVision />
      <LevelsMap />
      <Includes />
      <ValueStack />
      <AuthorityGuaranteeUrgency />
      <FAQ />
      <ClosingCTA />
    </main>
  );
}
