import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main
      dir="rtl"
      className="min-h-[100dvh] px-5 py-10 md:px-8 md:py-14"
      style={{ backgroundColor: "#111319", color: "#e2e2eb" }}
    >
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <h1
            className="text-2xl font-bold md:text-3xl"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            מדיניות פרטיות — BizMap
          </h1>
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm font-semibold"
            style={{
              backgroundColor: "#1e1f26",
              border: "1px solid #282a30",
              color: "#8c909f",
              textDecoration: "none",
              fontFamily: "var(--font-inter)",
            }}
          >
            חזרה לדף הבית
          </Link>
        </div>

        <p className="mb-8 text-sm" style={{ color: "#8c909f", fontFamily: "var(--font-inter)" }}>
          עודכן לאחרונה: אפריל 2026
        </p>

        <div className="space-y-6">
          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">1. כללי</h2>
            <p>BizMap ("אנחנו", "השירות") מחויבת להגנה על פרטיות המשתמשים שלה. מדיניות זו מסבירה אילו מידע אנו אוספים, כיצד אנו משתמשים בו ואילו זכויות עומדות לרשותך.</p>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">2. מידע שאנו אוספים</h2>
            <ul className="space-y-1">
              <li>- פרטי חשבון: כתובת אימייל וסיסמה בעת ההרשמה</li>
              <li>- מידע עסקי: פרטים שהוזנו במהלך ה-onboarding — שם העסק, תחום עיסוק, מחלקות, תהליכים, כלים ויעדים עסקיים</li>
              <li>- היסטוריית שיחות: שיחות עם סוכן ה-AI (ARIA) נשמרות כדי לאפשר המשכיות</li>
              <li>- נתוני שימוש: אנו משתמשים ב-Google Analytics לאיסוף נתונים אנונימיים על אופן השימוש בשירות (עמודים שנצפו, זמן שהייה וכו')</li>
              <li>- עוגיות (Cookies): אנו משתמשים בעוגיות לצורך התחברות, אבטחה וניתוח שימוש</li>
            </ul>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">3. כיצד אנו משתמשים במידע</h2>
            <ul className="space-y-1">
              <li>- לצורך הפעלת השירות ומתן המלצות AI מותאמות אישית</li>
              <li>- שיפור השירות על בסיס נתוני שימוש אנונימיים</li>
              <li>- שליחת עדכונים חשובים הקשורים לחשבונך</li>
              <li>- אנו לא מוכרים ולא משתפים מידע אישי עם צדדים שלישיים למטרות שיווק</li>
            </ul>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">4. שיתוף מידע עם צדדים שלישיים</h2>
            <p>אנו משתמשים בספקי שירות הבאים:</p>
            <ul className="mt-2 space-y-1">
              <li>- Supabase: אחסון נתונים ואימות זהות (שרתים באסיה)</li>
              <li>- Anthropic (Claude): עיבוד נתוני העסק שלך לצורך יצירת המלצות AI. המידע שנשלח ל-Anthropic כפוף למדיניות הפרטיות שלהם</li>
              <li>- Google Analytics: ניתוח שימוש אנונימי</li>
            </ul>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">5. אבטחת מידע</h2>
            <ul className="space-y-1">
              <li>- כל הנתונים מוצפנים בהעברה (HTTPS/TLS)</li>
              <li>- גישה לנתונים מוגבלת לצוות BizMap בלבד</li>
              <li>- אנו משתמשים במנגנוני Row Level Security של Supabase כדי להבטיח שכל משתמש רואה רק את הנתונים שלו</li>
            </ul>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">6. שמירת מידע</h2>
            <p>אנו שומרים את המידע שלך כל עוד החשבון פעיל. ניתן לבקש מחיקת החשבון והנתונים בכל עת על ידי פנייה אלינו.</p>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">7. זכויות המשתמש</h2>
            <p className="mb-2">בהתאם לחוק הגנת הפרטיות הישראלי, עומדות לך הזכויות הבאות:</p>
            <ul className="space-y-1">
              <li>- עיון במידע השמור עליך</li>
              <li>- תיקון מידע שגוי</li>
              <li>- מחיקת חשבונך ונתוניך</li>
              <li>- לפנייה: privacy@bizmapai.com</li>
            </ul>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">8. שינויים במדיניות</h2>
            <p>אנו עשויים לעדכן מדיניות זו מעת לעת. במקרה של שינויים מהותיים נודיע לך באימייל.</p>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">9. יצירת קשר</h2>
            <p>לשאלות בנושא פרטיות: privacy@bizmapai.com</p>
          </section>
        </div>
      </div>
    </main>
  );
}
