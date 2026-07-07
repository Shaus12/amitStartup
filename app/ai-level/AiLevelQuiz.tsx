"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";

type Level = {
  n: number;
  name: string;
  unit: string;
  short: string;
  desc: string;
  pain: string;
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
    unit: "חוסך דקות",
    short: "עובד מול צ'אט בודד — שאלה, תשובה, תיקון",
    desc: "זו נקודת הפתיחה של כולם: פותחים צ'אט, שואלים, מתקנים, ומקבלים עזרה נקודתית. זה שימוש חשוב, אבל רוב בעלי העסקים נתקעים כאן ולא רואים שיש מעליהם עולם שלם של עבודה חוזרת, תהליכים ומערכות.",
    pain: "המחיר של להישאר כאן: כל תוצאה תלויה במצב הרוח ובניסוח של הרגע — אתה מתחיל מאפס כל פעם, ושום דבר לא נשמר לפעם הבאה.",
    gap: "הצעד הבא: להפסיק להתחיל מאפס בכל פעם, ולבנות נכסים חוזרים כמו פרומפטים, תבניות וצ'קליסטים שמקצרים עבודה שבוע אחרי שבוע.",
  },
  {
    n: 2,
    name: "נכסים",
    unit: "חוסך שעות בשבוע",
    short: "בונה נכסים חוזרים: פרומפטים, תבניות, Custom GPT",
    desc: "ברמה הזו AI כבר לא רק עונה לך, אלא נשען על נכסים שחוזרים לעבוד עבורך: תבניות, פרומפטים קבועים, מאגרי ידע או Custom GPT. הערך מתחיל להצטבר, כי כל שימוש חדש נשען על משהו שבנית קודם.",
    pain: "המחיר של להישאר כאן: יש לך כלים טובים, אבל אתה עדיין זה שמפעיל כל אחד מהם ידנית — התהליך לא זז בלעדיך.",
    gap: "הצעד הבא: לקחת נכסים שעובדים טוב ולחבר אותם לזרימה מלאה: קלט ברור, עיבוד מובנה, ופלט שאפשר להשתמש בו בלי להרכיב הכול ידנית.",
  },
  {
    n: 3,
    name: "זרימות",
    unit: "חוסך תהליך שלם",
    short: "משרשר צעדים לתהליך: קלט → עיבוד → פלט",
    desc: "כאן AI כבר משתתף בתהליך עסקי שלם, לא רק במשימה אחת. יש רצף: מידע נכנס, AI מנתח או כותב, ואז יוצא פלט שמשרת מכירה, שירות, תפעול או ניהול.",
    pain: "המחיר של להישאר כאן: התהליך מוגדר ועובד — אבל *אתה* עדיין צריך ללחוץ על כל שלב. זה לא קורה כשאתה בפגישה, בחופש, או ישן.",
    gap: "הצעד הבא: לחבר את הזרימה לכלים של העסק, כך שהיא לא תהיה תלויה בהעתק-הדבק ובזמן הפנוי שלך.",
  },
  {
    n: 4,
    name: "אוטומציות",
    unit: "חוסך משרה חלקית",
    short: "מחבר AI לכלים, רץ בלי יד אנושית (טריגרים)",
    desc: "ברמה הזו AI מחובר לכלים כמו מייל, CRM, טפסים, וואטסאפ או מערכות פנימיות. טריגר מפעיל תהליך, והעסק מקבל תוצאה בלי שמישהו יצטרך לזכור להפעיל את זה.",
    pain: "המחיר של להישאר כאן: דברים רצים לבד, אבל רק לפי כללים נוקשים שהגדרת — ברגע שמשהו יוצא מהתבנית, המערכת נתקעת ומחכה לך.",
    gap: "הצעד הבא: להוסיף שכבת שיקול דעת: לא רק אוטומציה קבועה, אלא סוכן שמבין מטרה, בוחר פעולה, ומתקדם גם כשיש כמה אפשרויות.",
  },
  {
    n: 5,
    name: "סוכנים",
    unit: "חוסך מחלקה שלמה",
    short: "סוכן שמקבל מטרה ומחליט לבד איך להשיג",
    desc: "ברמה הזו AI כבר מתנהג כמו בעל תפקיד: מקבל מטרה, ניגש לכלים, בוחר צעדים, בודק תוצאה וממשיך. זה כבר לא רק קיצור דרך, אלא יכולת תפעולית שמחליפה חלקים שלמים בעבודה.",
    pain: "המחיר של להישאר כאן: יש לך סוכן שמנהל תחום — אבל כל תחום עומד לבד. אין מי שמנצח על כולם יחד, ואתה עדיין הדבק שמחבר ביניהם.",
    gap: "הצעד הבא: לחבר כמה סוכנים למערכת אחת עם ניטור, מדידה, גבולות פעולה ושיפור מתמשך.",
  },
  {
    n: 6,
    name: "מערכת",
    unit: "חוסך את ניהול העסק כולו",
    short: "מנצח על מערכת סוכנים, ניטור, ROI, שיפור עצמי",
    desc: "זו הרמה שבה AI כבר טבעי בתוך העסק: כמה סוכנים, כמה תהליכים, מדידת ROI, ניטור חריגות ושיפור מתמשך. בעל העסק לא מפעיל כלי, אלא מנהל מערכת שעובדת מעל העסק כולו.",
    pain: "הגעת לפסגה. מכאן זה כבר לא שאלה של רמה, אלא של עומק — כמה טוב המערכת מודדת את עצמה, משתפרת, ויודעת מתי לבנות, לקנות, או לא להשתמש בכלל.",
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

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function isValidIsraeliPhone(phone: string) {
  return /^05\d{8}$/.test(normalizePhone(phone));
}

function renderPainText(text: string) {
  const parts = text.split(/(\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

export function AiLevelQuiz() {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [consultationOpen, setConsultationOpen] = useState(false);
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
            onOpenConsultation={() => setConsultationOpen(true)}
          />
        )}
      </section>

      <ConsultationModal
        isOpen={consultationOpen}
        level={level}
        onClose={() => setConsultationOpen(false)}
      />
    </main>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="hero-grid">
      <section className="intro-card reveal">
        <p className="eyebrow">אבחון · 8 שאלות · דקה וחצי</p>
        <h1>
          באיזו <span className="gradient-phrase">רמת גובה</span> אתה טס עם AI בעסק?
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
  onOpenConsultation,
}: {
  level: Level;
  nextLevel: Level | null;
  onRestart: () => void;
  onOpenConsultation: () => void;
}) {
  const ctaTitle =
    level.n <= 3
      ? "רוצה לעלות רמה — ולראות איך זה נראה כשזה רץ לבד?"
      : "רוצה לבנות מערכת שלמה שמנהלת את העסק?";

  return (
    <section className="result-layout reveal">
      <div className="result-card">
        <div className="score-badge">{level.n}/6</div>
        <p className="level-kicker">התוצאה שלך</p>
        <h1 className="hebrew-level-title">רמה {level.n} — {level.name}</h1>
        <span className="unit-pill">{level.unit}</span>
        <p>{level.desc}</p>
        <p className="hidden-cost">{renderPainText(level.pain)}</p>
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
        <div className="cta-copy">
          <h2>{ctaTitle}</h2>
          <p>
            בוובינר נראה איך עוברים משימוש נקודתי ב-AI למערכת שממפה את העסק, מזהה צווארי בקבוק ומפעילה תהליכים חכמים בצורה מסודרת.
          </p>
          <div className="consult-strip">
            <strong>מעוניין בשיחת יעוץ בחינם?</strong>
            <span>תשאיר פרטים ונחזור אליך</span>
          </div>
        </div>
        <div className="cta-actions">
          <Link href="/webinar" className="primary-cta">שמור מקום בוובינר החינם ←</Link>
          <button type="button" className="consult-cta" onClick={onOpenConsultation}>השאר פרטים לשיחה</button>
          <button type="button" className="secondary-cta" onClick={onRestart}>עשה את המבחן שוב</button>
        </div>
      </div>
    </section>
  );
}

function ConsultationModal({
  isOpen,
  level,
  onClose,
}: {
  isOpen: boolean;
  level: Level;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const nameValid = name.trim().length > 0;
  const phoneValid = isValidIsraeliPhone(phone);
  const showNameError = nameTouched && !nameValid;
  const showPhoneError = phoneTouched && phone.length > 0 && !phoneValid;

  function handleClose() {
    if (status === "loading") return;
    setError("");
    setStatus("idle");
    setNameTouched(false);
    setPhoneTouched(false);
    onClose();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameTouched(true);
    setPhoneTouched(true);
    setError("");

    if (!nameValid || !phoneValid || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: normalizePhone(phone),
          source: "ai_level",
          message: `AI level survey result: ${level.n}/6 - ${level.name}`,
        }),
      });

      if (!res.ok) {
        throw new Error("Lead request failed");
      }

      setStatus("success");
      setName("");
      setPhone("");
      setNameTouched(false);
      setPhoneTouched(false);
    } catch {
      setStatus("error");
      setError("משהו השתבש. נסה שוב בעוד רגע.");
    }
  }

  return (
    <div
      className="consult-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consult-modal-title"
      onClick={handleClose}
    >
      <div className="consult-modal" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="consult-close"
          onClick={handleClose}
          disabled={status === "loading"}
          aria-label="סגור"
        >
          ×
        </button>

        {status === "success" ? (
          <div className="consult-success">
            <div className="consult-success-mark">✓</div>
            <h2 id="consult-modal-title">קיבלנו, נחזור אליך בקרוב</h2>
            <p>השארת פרטים אחרי תוצאה ברמה {level.n} — {level.name}. ניצור קשר לשיחת יעוץ חינמית.</p>
            <button type="button" className="primary-cta" onClick={handleClose}>סגור</button>
          </div>
        ) : (
          <>
            <p className="eyebrow">שיחת יעוץ חינמית</p>
            <h2 id="consult-modal-title">מעוניין להבין איך לעלות מהרמה שלך?</h2>
            <p className="consult-modal-copy">
              תשאיר שם וטלפון, ונחזור אליך עם כיוון ראשוני שמתאים לתוצאה שקיבלת.
            </p>

            <form className="consult-form" onSubmit={submit}>
              <label htmlFor="consult-name">שם מלא</label>
              <input
                id="consult-name"
                type="text"
                autoComplete="name"
                placeholder="ישראל ישראלי"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                onBlur={() => setNameTouched(true)}
                disabled={status === "loading"}
              />
              {showNameError && <span className="field-error">יש להזין שם מלא</span>}

              <label htmlFor="consult-phone">טלפון</label>
              <input
                id="consult-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0501234567"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setError("");
                }}
                onBlur={() => setPhoneTouched(true)}
                disabled={status === "loading"}
              />
              {showPhoneError && <span className="field-error">יש להזין מספר נייד ישראלי תקין</span>}

              {error && <span className="field-error">{error}</span>}

              <button type="submit" className="primary-cta" disabled={status === "loading"}>
                {status === "loading" ? "שולח..." : "חזור אליי לשיחת יעוץ ←"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function LevelMiniMap({ current, intro = false }: { current: number; intro?: boolean }) {
  return (
    <section className={intro ? "map-card intro-map reveal" : "map-card"}>
      <div className="map-head">
        <p className="eyebrow">מפת 6 הרמות</p>
        <h2>מהקרקע ועד מערכת AI מלאה</h2>
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

.gradient-phrase {
  display: inline-block;
  white-space: nowrap;
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

.map-head h2 {
  margin: 0;
  color: var(--ink);
  font-size: 15px;
  line-height: 1.35;
  font-weight: 900;
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

.hebrew-level-title {
  max-width: 100%;
  overflow-wrap: normal;
  text-align: right;
  font-size: clamp(42px, 6vw, 74px);
  line-height: 1.05;
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

.result-card .hidden-cost {
  margin-top: 18px;
  padding: 16px 18px;
  border-right: 3px solid var(--accent-2);
  border-radius: 14px;
  background: rgba(255,178,87,0.08);
  color: var(--ink);
  font-weight: 800;
}

.hidden-cost em {
  color: var(--accent-2);
  font-style: normal;
  font-weight: 900;
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
  grid-template-columns: minmax(0, 1fr) minmax(240px, auto);
  gap: clamp(24px, 5vw, 56px);
  align-items: center;
}

.cta-copy {
  min-width: 0;
  max-width: 780px;
}

.cta-copy p {
  margin-bottom: 0;
}

.consult-strip {
  display: grid;
  gap: 4px;
  margin-top: 22px;
  padding: 16px 18px;
  border: 1px solid rgba(95,212,196,0.26);
  border-radius: 16px;
  background: rgba(95,212,196,0.07);
}

.consult-strip strong {
  color: var(--ink);
  font-size: 18px;
}

.consult-strip span {
  color: var(--ink-dim);
  font-size: 15px;
}

.cta-actions {
  display: grid;
  gap: 12px;
  justify-items: stretch;
}

.cta-actions .primary-cta,
.cta-actions .secondary-cta,
.cta-actions .consult-cta {
  width: 100%;
  min-height: 62px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.consult-cta {
  width: 100%;
  border: 1px solid rgba(95,212,196,0.38);
  border-radius: 999px;
  padding: 14px 22px;
  color: var(--ink);
  background: rgba(95,212,196,0.1);
  cursor: pointer;
  font: inherit;
  font-weight: 900;
}

.consult-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(3,7,18,0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.consult-modal {
  position: relative;
  width: min(100%, 480px);
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(13,21,48,0.96);
  box-shadow: 0 32px 100px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06);
  padding: 28px;
  text-align: right;
  animation: riseIn 220ms ease both;
}

.consult-close {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 36px;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--ink-dim);
  background: rgba(255,255,255,0.05);
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
}

.consult-modal h2 {
  margin: 0;
  padding-left: 36px;
  color: var(--ink);
  font-size: clamp(26px, 4vw, 36px);
  line-height: 1.12;
  font-weight: 900;
}

.consult-modal-copy {
  margin: 14px 0 0;
  color: var(--ink-dim);
  line-height: 1.65;
}

.consult-form {
  display: grid;
  gap: 10px;
  margin-top: 24px;
}

.consult-form label {
  color: var(--ink);
  font-size: 14px;
  font-weight: 900;
}

.consult-form input {
  width: 100%;
  height: 52px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(255,255,255,0.055);
  color: var(--ink);
  padding: 0 16px;
  text-align: right;
  font: inherit;
  font-weight: 700;
  outline: none;
}

.consult-form input:focus {
  border-color: rgba(95,212,196,0.72);
  box-shadow: 0 0 0 3px rgba(95,212,196,0.14);
}

.consult-form input::placeholder {
  color: rgba(234,240,255,0.32);
}

.consult-form .primary-cta,
.consult-success .primary-cta {
  width: 100%;
  margin-top: 8px;
}

.consult-form .primary-cta:disabled {
  cursor: wait;
  opacity: 0.68;
}

.field-error {
  color: #fca5a5;
  font-size: 13px;
  font-weight: 800;
}

.consult-success {
  display: grid;
  gap: 14px;
  justify-items: center;
  padding: 10px 0 4px;
  text-align: center;
}

.consult-success-mark {
  width: 62px;
  height: 62px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #06101d;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  font-size: 32px;
  font-weight: 900;
}

.consult-success h2 {
  padding-left: 0;
}

.consult-success p {
  margin: 0;
  color: var(--ink-dim);
  line-height: 1.65;
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
.ai-level-page a:focus-visible,
.ai-level-page input:focus-visible {
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

  .intro-card h1 {
    font-size: clamp(38px, 12vw, 58px);
    line-height: 1.05;
  }

  .hebrew-level-title {
    font-size: clamp(34px, 10vw, 56px);
    line-height: 1.08;
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

  .consult-modal {
    padding: 24px 18px;
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
