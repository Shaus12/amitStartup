"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";

type Level = {
  n: number;
  name: string;
  en: string;
  unit: string;
  short: string;
  desc: string;
  gap: string;
};

type Answer = {
  text: string;
  lvl: number;
};

type Question = {
  q: string;
  answers: Answer[];
};

const levels: Level[] = [
  {
    n: 1,
    name: "שיחה",
    en: "Conversational",
    unit: "חוסך דקות",
    short: "עובד מול צ'אט בודד — שאלה, תשובה, תיקון",
    desc: "זו נקודת הפתיחה של כולם: פותחים צ'אט, שואלים, מתקנים, ומקבלים עזרה נקודתית. זה שימוש חשוב, אבל רוב בעלי העסקים נתקעים כאן ולא רואים שיש מעליהם עולם שלם של עבודה חוזרת, תהליכים ומערכות.",
    gap: "הצעד הבא: להפסיק להתחיל מאפס בכל פעם, ולבנות נכסים חוזרים כמו פרומפטים, תבניות וצ'קליסטים שמקצרים עבודה שבוע אחרי שבוע.",
  },
  {
    n: 2,
    name: "נכסים",
    en: "Assets",
    unit: "חוסך שעות בשבוע",
    short: "בונה נכסים חוזרים: פרומפטים, תבניות, Custom GPT",
    desc: "ברמה הזו AI כבר לא רק עונה לך, אלא נשען על נכסים שחוזרים לעבוד עבורך: תבניות, פרומפטים קבועים, מאגרי ידע או Custom GPT. הערך מתחיל להצטבר, כי כל שימוש חדש נשען על משהו שבנית קודם.",
    gap: "הצעד הבא: לקחת נכסים שעובדים טוב ולחבר אותם לזרימה מלאה: קלט ברור, עיבוד מובנה, ופלט שאפשר להשתמש בו בלי להרכיב הכול ידנית.",
  },
  {
    n: 3,
    name: "זרימות",
    en: "Workflows",
    unit: "חוסך תהליך שלם",
    short: "משרשר צעדים לתהליך: קלט → עיבוד → פלט",
    desc: "כאן AI כבר משתתף בתהליך עסקי שלם, לא רק במשימה אחת. יש רצף: מידע נכנס, AI מנתח או כותב, ואז יוצא פלט שמשרת מכירה, שירות, תפעול או ניהול.",
    gap: "הצעד הבא: לחבר את הזרימה לכלים של העסק, כך שהיא לא תהיה תלויה בהעתק-הדבק ובזמן הפנוי שלך.",
  },
  {
    n: 4,
    name: "אוטומציות",
    en: "Automations",
    unit: "חוסך משרה חלקית",
    short: "מחבר AI לכלים, רץ בלי יד אנושית (טריגרים)",
    desc: "ברמה הזו AI מחובר לכלים כמו מייל, CRM, טפסים, וואטסאפ או מערכות פנימיות. טריגר מפעיל תהליך, והעסק מקבל תוצאה בלי שמישהו יצטרך לזכור להפעיל את זה.",
    gap: "הצעד הבא: להוסיף שכבת שיקול דעת: לא רק אוטומציה קבועה, אלא סוכן שמבין מטרה, בוחר פעולה, ומתקדם גם כשיש כמה אפשרויות.",
  },
  {
    n: 5,
    name: "סוכנים",
    en: "Agents",
    unit: "חוסך מחלקה שלמה",
    short: "סוכן שמקבל מטרה ומחליט לבד איך להשיג",
    desc: "ברמה הזו AI כבר מתנהג כמו בעל תפקיד: מקבל מטרה, ניגש לכלים, בוחר צעדים, בודק תוצאה וממשיך. זה כבר לא רק קיצור דרך, אלא יכולת תפעולית שמחליפה חלקים שלמים בעבודה.",
    gap: "הצעד הבא: לחבר כמה סוכנים למערכת אחת עם ניטור, מדידה, גבולות פעולה ושיפור מתמשך.",
  },
  {
    n: 6,
    name: "מערכת",
    en: "System / Native",
    unit: "חוסך את ניהול העסק כולו",
    short: "מנצח על מערכת סוכנים, ניטור, ROI, שיפור עצמי",
    desc: "זו הרמה שבה AI כבר טבעי בתוך העסק: כמה סוכנים, כמה תהליכים, מדידת ROI, ניטור חריגות ושיפור מתמשך. בעל העסק לא מפעיל כלי, אלא מנהל מערכת שעובדת מעל העסק כולו.",
    gap: "הצעד הבא: לשמור על בקרה, איכות וגבולות ברורים כדי שהמערכת תמשיך להשתפר בלי לאבד אמינות או שליטה ניהולית.",
  },
];

const questions: Question[] = [
  {
    q: "כשאתה משתמש ב-AI בעסק, זה נראה הכי הרבה כמו…",
    answers: [
      { text: "בקושי משתמש, ניסיתי פעם-פעמיים וזה לא באמת עזר לי", lvl: 1 },
      { text: "פותח צ'אט, שואל שאלה, מתקן קצת ומעתיק את התשובה", lvl: 1 },
      { text: "יש לי כמה פרומפטים או תבניות שאני חוזר אליהם", lvl: 2 },
      { text: "יש לי תהליך די קבוע: מכניס מידע ומקבל פלט שימושי", lvl: 3 },
      { text: "יש דברים שרצים לבד ברקע אחרי טריגר מסוים", lvl: 4 },
    ],
  },
  {
    q: "כשיש לך משימה חוזרת…",
    answers: [
      { text: "אני עושה אותה ידנית כל פעם מחדש", lvl: 1 },
      { text: "אני נעזר בצ'אט, אבל עדיין מנהל את כל השלבים בעצמי", lvl: 1 },
      { text: "אני משתמש בתבנית או פרומפט קבוע כדי לקצר אותה", lvl: 2 },
      { text: "יש לי רצף פעולות ברור שמוביל לתוצאה", lvl: 3 },
      { text: "זה קורה אוטומטית כשמשהו מפעיל את התהליך", lvl: 4 },
    ],
  },
  {
    q: "עד כמה ה-AI מחובר לכלים של העסק (מייל, CRM, וואטסאפ)?",
    answers: [
      { text: "בכלל לא, הכול קורה בצ'אט נפרד", lvl: 1 },
      { text: "אני מעתיק ידנית מידע מתוך הכלים לתוך AI", lvl: 1 },
      { text: "יש לי קבצים או ידע מסודר שה-AI יודע להיעזר בהם", lvl: 2 },
      { text: "חלק מהתהליכים מחוברים לכלים דרך טפסים או אינטגרציות", lvl: 3 },
      { text: "AI מחובר לכלים ומבצע פעולות כשיש טריגר", lvl: 4 },
      { text: "סוכן ניגש לכלים, בודק מצב ומחליט לבד מה לעשות", lvl: 5 },
    ],
  },
  {
    q: "מי מקבל החלטות בתהליכי ה-AI שלך?",
    answers: [
      { text: "אני על כל צעד, AI רק עוזר לי לחשוב או לנסח", lvl: 1 },
      { text: "אני בוחר את התבנית הנכונה ו-AI ממלא אותה", lvl: 2 },
      { text: "התהליך מכתיב את הצעד הבא, אבל אני עדיין מאשר הרבה", lvl: 3 },
      { text: "האוטומציה מקבלת החלטות פשוטות לפי חוקים שהגדרתי", lvl: 4 },
      { text: "אני נותן מטרה והסוכן מחליט איך להתקדם", lvl: 5 },
    ],
  },
  {
    q: "אם AI היה עובד בעסק, איזה תפקיד הוא ממלא?",
    answers: [
      { text: "יועץ שעוזר לי כשאני נתקע", lvl: 1 },
      { text: "עוזר אישי עם תבניות מוכנות למשימות חוזרות", lvl: 2 },
      { text: "מבצע תהליכים קבועים כמו כתיבה, ניתוח או סיכום", lvl: 3 },
      { text: "עובד תפעולי שמטפל במשימות כשהן נכנסות", lvl: 4 },
      { text: "מנהל תחום קטן שמקדם מטרות ומדווח לי", lvl: 5 },
      { text: "מערכת ניהול עם כמה סוכנים שעובדים על כל העסק", lvl: 6 },
    ],
  },
  {
    q: "כשמשהו נשבר / נותן תוצאה גרועה, מה קורה?",
    answers: [
      { text: "אני מוותר ועושה את זה ידנית", lvl: 1 },
      { text: "אני משנה קצת את הפרומפט ומנסה שוב", lvl: 2 },
      { text: "אני יודע באיזה שלב בתהליך הבעיה קרתה ומתקן אותו", lvl: 3 },
      { text: "יש התראה או עצירה כשמשהו לא נראה תקין", lvl: 4 },
      { text: "הסוכן מנסה מסלול אחר או מבקש אישור כשצריך", lvl: 5 },
      { text: "המערכת מזהה חריגות, מטפלת לבד ומשפרת את הכללים", lvl: 6 },
    ],
  },
  {
    q: "עד כמה אתה מודד את הערך ש-AI מייצר?",
    answers: [
      { text: "בכלל לא, אני בעיקר מרגיש אם זה עזר או לא", lvl: 1 },
      { text: "אני יודע בערך אילו משימות זה מקצר לי", lvl: 2 },
      { text: "אני מודד זמן שנחסך בתהליכים מסוימים", lvl: 3 },
      { text: "אני עוקב אחרי מדדים כמו זמן תגובה, נפח עבודה או עלות", lvl: 4 },
      { text: "אני מודד ביצועים של סוכנים מול מטרות עסקיות", lvl: 5 },
      { text: "יש לי מדידת ROI שיטתית ושיפור לפי הנתונים", lvl: 6 },
    ],
  },
  {
    q: "כשנכנס תהליך חדש לעסק, איך אתה חושב עליו?",
    answers: [
      { text: "אני לא חושב על AI, קודם פשוט עושים את העבודה", lvl: 1 },
      { text: "אני שואל אם יש פרומפט שיכול לעזור לי בזה", lvl: 2 },
      { text: "אני מפרק אותו לשלבים ובודק איפה AI יכול להשתלב", lvl: 3 },
      { text: "אני מחפש איך לחבר אותו לכלים ולטריגרים קיימים", lvl: 4 },
      { text: "אני בודק איזה סוכן יכול לקחת עליו אחריות", lvl: 5 },
      { text: "אני מתכנן AI-first מהרגע הראשון כחלק מהמערכת העסקית", lvl: 6 },
    ],
  },
];

function computeLevel(answers: Record<number, number>) {
  const vals = Object.values(answers);
  if (vals.length === 0) return 1;
  const counts: Record<number, number> = {};
  vals.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
  // הרמה הגבוהה ביותר שהופיעה לפחות פעמיים
  let consistent = 1;
  for (let l = 6; l >= 1; l--) {
    if ((counts[l] || 0) >= 2) { consistent = l; break; }
  }
  // ממוצע מעוגל למטה — עוגן יושרה
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
  const floored = Math.max(1, Math.floor(avg));
  const level = Math.max(floored, Math.min(consistent, floored + 1));
  return Math.min(6, Math.max(1, level));
}

export function AiLevelQuiz() {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDone = Object.keys(answers).length === questions.length;
  const progress = isDone ? 100 : started ? ((current + 1) / questions.length) * 100 : 0;
  const levelNumber = computeLevel(answers);
  const level = levels[levelNumber - 1];
  const nextLevel = levels[levelNumber] || null;

  function chooseAnswer(lvl: number, index: number) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSelected(index);

    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 260;
    timeoutRef.current = setTimeout(() => {
      setAnswers((prev) => ({ ...prev, [current]: lvl }));
      setSelected(null);
      setCurrent((prev) => Math.min(prev + 1, questions.length - 1));
    }, delay);
  }

  function restart() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStarted(false);
    setCurrent(0);
    setAnswers({});
    setSelected(null);
  }

  return (
    <main className="ai-level-page" dir="rtl">
      <style>{styles}</style>
      <div className="ai-stars" aria-hidden="true" />
      <div className="ai-glow ai-glow-top" aria-hidden="true" />
      <div className="ai-glow ai-glow-side" aria-hidden="true" />

      <aside className="altimeter" aria-hidden="true">
        <span>גובה AI</span>
        <div className="altimeter-track">
          <div className="altimeter-fill" style={{ height: `${progress}%` }} />
        </div>
        <strong>{Math.round(progress)}%</strong>
      </aside>

      <section className="ai-shell">
        <nav className="ai-nav" aria-label="ניווט">
          <Link href="/" className="brand-link">
            <Image src="/logo.png" alt="BizMap" width={34} height={34} priority />
            <span>BizMap</span>
          </Link>
          <Link href="/webinar" className="webinar-link">וובינר חינם</Link>
        </nav>

        {!started && (
          <IntroScreen onStart={() => setStarted(true)} />
        )}

        {started && !isDone && (
          <QuestionScreen
            current={current}
            selected={selected}
            onChoose={chooseAnswer}
          />
        )}

        {started && isDone && (
          <ResultScreen
            level={level}
            nextLevel={nextLevel}
            onRestart={restart}
          />
        )}
      </section>
    </main>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="hero-grid">
      <section className="intro-card reveal">
        <p className="eyebrow">אבחון · 8 שאלות · דקה וחצי</p>
        <h1>
          באיזו <span>רמת גובה</span> אתה טס עם AI בעסק?
        </h1>
        <p className="intro-copy">
          רוב בעלי העסקים משתמשים ב-AI בלי לדעת שהם על הקרקע — בזמן שהמתחרים כבר טסים מעל. ענה על 8 שאלות קצרות וגלה איפה אתה במפה, ומה מפריד אותך מהרמה הבאה.
        </p>
        <button className="primary-cta" type="button" onClick={onStart}>
          גלה את הרמה שלי ←
        </button>
      </section>

      <LevelMiniMap current={1} intro />
    </div>
  );
}

function QuestionScreen({
  current,
  selected,
  onChoose,
}: {
  current: number;
  selected: number | null;
  onChoose: (lvl: number, index: number) => void;
}) {
  const question = questions[current];

  return (
    <section className="quiz-card reveal" aria-live="polite">
      <div className="quiz-top">
        <p>שאלה {current + 1} מתוך {questions.length}</p>
        <div className="dots" aria-hidden="true">
          {questions.map((item, index) => (
            <span
              key={item.q}
              className={index <= current ? "active" : ""}
            />
          ))}
        </div>
      </div>

      <div className="progress-track" aria-hidden="true">
        <div style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      <h2>{question.q}</h2>
      <div className="answers">
        {question.answers.map((answer, index) => (
          <button
            key={answer.text}
            type="button"
            className={selected === index ? "answer selected" : "answer"}
            onClick={() => onChoose(answer.lvl, index)}
          >
            <span>{answer.text}</span>
            <small>רמה {answer.lvl}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function ResultScreen({
  level,
  nextLevel,
  onRestart,
}: {
  level: Level;
  nextLevel: Level | null;
  onRestart: () => void;
}) {
  const ctaTitle =
    level.n <= 3
      ? "רוצה לעלות רמה — ולראות איך זה נראה כשזה רץ לבד?"
      : "רוצה לבנות מערכת שלמה שמנהלת את העסק?";

  return (
    <section className="result-layout reveal">
      <div className="result-card">
        <div className="score-badge">{level.n}/6</div>
        <p className="level-kicker">רמה {level.n} — {level.name}</p>
        <h1>{level.en}</h1>
        <span className="unit-pill">{level.unit}</span>
        <p>{level.desc}</p>
      </div>

      <LevelMiniMap current={level.n} />

      <div className="roadmap-card">
        <p className="eyebrow">מפת דרך אישית</p>
        <h2>מה מפריד אותך מהרמה הבאה?</h2>
        <p>{level.gap}</p>
        <div className="next-card">
          {nextLevel ? (
            <>
              <small>הרמה הבאה</small>
              <strong>רמה {nextLevel.n} — {nextLevel.name}</strong>
              <span>{nextLevel.short}</span>
            </>
          ) : (
            <>
              <small>אתה בקצה המפה</small>
              <strong>רמה 6 — מערכת</strong>
              <span>עכשיו האתגר הוא בקרה, מדידה ושיפור מתמשך.</span>
            </>
          )}
        </div>
      </div>

      <div className="cta-card">
        <h2>{ctaTitle}</h2>
        <p>
          בוובינר נראה איך עוברים משימוש נקודתי ב-AI למערכת שממפה את העסק, מזהה צווארי בקבוק ומפעילה תהליכים חכמים בצורה מסודרת.
        </p>
        <div className="cta-actions">
          <Link href="/webinar" className="primary-cta">שמור מקום בוובינר החינם ←</Link>
          <button type="button" className="secondary-cta" onClick={onRestart}>עשה את המבחן שוב</button>
        </div>
      </div>
    </section>
  );
}

function LevelMiniMap({ current, intro = false }: { current: number; intro?: boolean }) {
  return (
    <section className={intro ? "map-card intro-map reveal" : "map-card"}>
      <div className="map-head">
        <p className="eyebrow">מפת 6 הרמות</p>
        <strong>מהקרקע ועד מערכת AI מלאה</strong>
      </div>
      <ol className="level-map">
        {levels.map((item) => {
          const passed = !intro && item.n < current;
          const active = item.n === current;
          const locked = !intro && item.n > current;
          return (
            <li
              key={item.n}
              className={[
                passed ? "passed" : "",
                active ? "current" : "",
                locked ? "locked" : "",
              ].filter(Boolean).join(" ")}
            >
              <div className="node">{passed ? "✓" : item.n}</div>
              <div>
                <strong>{item.name}</strong>
                <span>{item.unit}</span>
                {active && !intro && <em>אתה כאן</em>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const styles = `
.ai-level-page {
  --bg-0:#070b1a;
  --bg-1:#0d1530;
  --ink:#eaf0ff;
  --ink-dim:#9aa8cf;
  --line:rgba(150,175,255,0.14);
  --card:rgba(18,26,54,0.72);
  --accent:#5fd4c4;
  --accent-2:#ffb257;
  --glow:rgba(95,212,196,0.35);
  min-height: 100dvh;
  position: relative;
  overflow: hidden;
  background: radial-gradient(120% 90% at 50% -10%, #12224e, var(--bg-1) 40%, var(--bg-0));
  color: var(--ink);
  font-family: var(--font-heebo), var(--font-inter), system-ui, sans-serif;
}

.ai-level-page * {
  box-sizing: border-box;
}

.ai-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle, rgba(255,255,255,0.45) 1px, transparent 1px),
    radial-gradient(circle, rgba(95,212,196,0.28) 1px, transparent 1px);
  background-position: 0 0, 26px 34px;
  background-size: 78px 78px, 118px 118px;
  opacity: 0.25;
  mask-image: linear-gradient(to bottom, black, transparent 78%);
}

.ai-glow {
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
  filter: blur(40px);
}

.ai-glow-top {
  width: 520px;
  height: 220px;
  top: -90px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,178,87,0.16);
}

.ai-glow-side {
  width: 360px;
  height: 360px;
  right: -120px;
  top: 34%;
  background: var(--glow);
}

.ai-shell {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  position: relative;
  z-index: 1;
  padding: 24px 0 64px;
}

.ai-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 44px;
}

.brand-link,
.webinar-link,
.primary-cta,
.secondary-cta {
  text-decoration: none;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--ink);
  font-weight: 800;
}

.brand-link img {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.webinar-link {
  color: var(--ink);
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.05);
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 700;
}

.hero-grid,
.result-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 24px;
  align-items: stretch;
}

.intro-card,
.quiz-card,
.map-card,
.result-card,
.roadmap-card,
.cta-card {
  border: 1px solid var(--line);
  background: var(--card);
  backdrop-filter: blur(20px) saturate(1.35);
  -webkit-backdrop-filter: blur(20px) saturate(1.35);
  border-radius: 20px;
  box-shadow: 0 28px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
}

.intro-card {
  min-height: 560px;
  padding: clamp(28px, 5vw, 64px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.eyebrow {
  margin: 0 0 14px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
}

.intro-card h1,
.result-card h1 {
  margin: 0;
  font-size: clamp(42px, 7vw, 82px);
  line-height: 0.98;
  font-weight: 900;
  letter-spacing: 0;
}

.intro-card h1 span,
.score-badge {
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.intro-copy {
  max-width: 720px;
  margin: 24px 0 34px;
  color: var(--ink-dim);
  font-size: clamp(18px, 2.3vw, 22px);
  line-height: 1.65;
}

.primary-cta,
.secondary-cta {
  width: fit-content;
  border: 0;
  cursor: pointer;
  border-radius: 999px;
  padding: 14px 22px;
  font: inherit;
  font-weight: 900;
}

.primary-cta {
  color: #06101d;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  box-shadow: 0 16px 46px rgba(95,212,196,0.24);
}

.secondary-cta {
  color: var(--ink);
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--line);
}

.intro-map {
  min-height: 560px;
}

.map-card {
  padding: 24px;
}

.map-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.map-head strong {
  color: var(--ink);
  font-size: 15px;
}

.level-map {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.level-map li {
  display: grid;
  grid-template-columns: 46px 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: rgba(255,255,255,0.035);
  color: var(--ink-dim);
}

.level-map li.passed {
  border-color: rgba(95,212,196,0.34);
  color: var(--ink);
}

.level-map li.current {
  border-color: rgba(95,212,196,0.78);
  box-shadow: 0 0 0 1px rgba(95,212,196,0.18), 0 0 34px rgba(95,212,196,0.18);
  color: var(--ink);
  animation: pulseGlow 2.2s ease-in-out infinite;
}

.level-map li.locked {
  opacity: 0.48;
  filter: grayscale(0.65);
}

.node {
  width: 46px;
  height: 46px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: var(--ink);
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--line);
  font-weight: 900;
}

.passed .node {
  color: #06101d;
  background: var(--accent);
}

.current .node {
  color: #06101d;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
}

.level-map strong,
.level-map span,
.level-map em {
  display: block;
}

.level-map strong {
  color: inherit;
  font-size: 16px;
}

.level-map span {
  margin-top: 2px;
  font-size: 13px;
}

.level-map em {
  margin-top: 6px;
  color: var(--accent);
  font-style: normal;
  font-size: 12px;
  font-weight: 900;
}

.quiz-card {
  max-width: 860px;
  margin: 0 auto;
  padding: clamp(22px, 4vw, 44px);
}

.quiz-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  color: var(--ink-dim);
  font-weight: 800;
}

.quiz-top p {
  margin: 0;
}

.dots {
  display: flex;
  gap: 7px;
}

.dots span {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: rgba(255,255,255,0.16);
}

.dots span.active {
  background: var(--accent);
}

.progress-track {
  height: 7px;
  background: rgba(255,255,255,0.08);
  border-radius: 999px;
  overflow: hidden;
  margin: 18px 0 34px;
}

.progress-track div {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  transition: width 220ms ease;
}

.quiz-card h2 {
  margin: 0 0 28px;
  font-size: clamp(28px, 4.2vw, 46px);
  line-height: 1.12;
  font-weight: 900;
}

.answers {
  display: grid;
  gap: 12px;
}

.answer {
  min-height: 72px;
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: rgba(255,255,255,0.045);
  color: var(--ink);
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  padding: 16px 18px;
  text-align: right;
  cursor: pointer;
  font: inherit;
  transition: transform 180ms ease, border-color 180ms ease, background-color 180ms ease;
}

.answer span {
  font-size: 16px;
  line-height: 1.4;
  font-weight: 700;
}

.answer small {
  flex: 0 0 auto;
  color: var(--accent);
  font-weight: 900;
}

.answer:hover,
.answer.selected {
  transform: translateX(-4px);
  border-color: rgba(95,212,196,0.72);
  background: rgba(95,212,196,0.09);
}

.result-layout {
  grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
}

.result-card,
.roadmap-card,
.cta-card {
  padding: clamp(24px, 4vw, 42px);
}

.result-card {
  min-height: 430px;
}

.score-badge {
  font-size: clamp(72px, 11vw, 132px);
  line-height: 0.9;
  font-weight: 900;
}

.level-kicker {
  margin: 24px 0 8px;
  color: var(--accent);
  font-weight: 900;
}

.unit-pill {
  display: inline-flex;
  margin: 18px 0 22px;
  padding: 9px 13px;
  border: 1px solid rgba(255,178,87,0.35);
  border-radius: 999px;
  color: var(--accent-2);
  background: rgba(255,178,87,0.08);
  font-weight: 900;
}

.result-card p,
.roadmap-card p,
.cta-card p {
  color: var(--ink-dim);
  font-size: 17px;
  line-height: 1.7;
}

.roadmap-card,
.cta-card {
  grid-column: 1 / -1;
}

.roadmap-card h2,
.cta-card h2 {
  margin: 0;
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.12;
  font-weight: 900;
}

.next-card {
  margin-top: 22px;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid rgba(95,212,196,0.28);
  background: rgba(95,212,196,0.08);
}

.next-card small,
.next-card strong,
.next-card span {
  display: block;
}

.next-card small {
  color: var(--accent);
  font-weight: 900;
}

.next-card strong {
  margin-top: 6px;
  color: var(--ink);
  font-size: 20px;
}

.next-card span {
  margin-top: 6px;
  color: var(--ink-dim);
}

.cta-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
}

.cta-card p {
  margin-bottom: 0;
}

.cta-actions {
  display: grid;
  gap: 12px;
  justify-items: start;
}

.altimeter {
  position: fixed;
  top: 50%;
  left: 28px;
  z-index: 2;
  transform: translateY(-50%);
  display: grid;
  justify-items: center;
  gap: 10px;
  color: var(--ink-dim);
  font-size: 12px;
  font-weight: 900;
}

.altimeter-track {
  width: 10px;
  height: 260px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.06);
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.altimeter-fill {
  width: 100%;
  border-radius: inherit;
  background: linear-gradient(to top, var(--accent), var(--accent-2));
  transition: height 260ms ease;
}

.reveal {
  animation: riseIn 520ms ease both;
}

.ai-level-page button:focus-visible,
.ai-level-page a:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 4px;
}

@keyframes riseIn {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 1px rgba(95,212,196,0.18), 0 0 24px rgba(95,212,196,0.12); }
  50% { box-shadow: 0 0 0 1px rgba(95,212,196,0.38), 0 0 44px rgba(95,212,196,0.28); }
}

@media (max-width: 900px) {
  .ai-shell {
    width: min(100% - 24px, 680px);
    padding-top: 16px;
  }

  .hero-grid,
  .result-layout,
  .cta-card {
    grid-template-columns: 1fr;
  }

  .intro-card,
  .intro-map {
    min-height: auto;
  }

  .intro-card {
    padding: 32px 22px;
  }

  .map-card {
    padding: 18px;
  }

  .level-map {
    gap: 9px;
  }

  .level-map li {
    grid-template-columns: 38px 1fr;
    padding: 10px;
  }

  .node {
    width: 38px;
    height: 38px;
  }

  .altimeter {
    display: none;
  }

  .answer {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .cta-actions {
    justify-items: stretch;
  }

  .primary-cta,
  .secondary-cta {
    width: 100%;
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .level-map li.current {
    animation: none;
  }

  .answer,
  .progress-track div,
  .altimeter-fill {
    transition: none;
  }

  .answer:hover,
  .answer.selected {
    transform: none;
  }
}
`;
