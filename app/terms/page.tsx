import Link from "next/link";

export default function TermsPage() {
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
            תנאי שימוש — BizMap
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
            <h2 className="mb-2 text-lg font-bold">1. קבלת התנאים</h2>
            <p>השימוש בשירות BizMap מהווה הסכמה לתנאים אלו. אם אינך מסכים לתנאים, אנא הפסק את השימוש בשירות.</p>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">2. תיאור השירות</h2>
            <p>BizMap היא פלטפורמה לניתוח עסקי המסייעת לבעלי עסקים קטנים ובינוניים לזהות הזדמנויות לייעול ואוטומציה בעזרת AI. השירות כולל: מיפוי עסקי, המלצות AI, ניהול משימות ואסיסטנט עסקי חכם (ARIA).</p>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">3. חשבון משתמש</h2>
            <ul className="space-y-1">
              <li>- עליך להיות מעל גיל 18 לשימוש בשירות</li>
              <li>- אתה אחראי לשמירה על סודיות פרטי הכניסה שלך</li>
              <li>- אתה אחראי לכל פעילות שמתבצעת תחת חשבונך</li>
              <li>- אנו שומרים לעצמנו את הזכות להשעות חשבונות שמפרים את התנאים</li>
            </ul>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">4. שימוש מותר</h2>
            <ul className="space-y-1">
              <li>- השירות מיועד לשימוש עסקי לגיטימי בלבד</li>
              <li>- אין להשתמש בשירות לפעילות בלתי חוקית</li>
              <li>- אין לנסות לפרוץ, להאט או לפגוע בשירות</li>
              <li>- אין לנסות לגשת לנתונים של משתמשים אחרים</li>
            </ul>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">5. תוכן המשתמש</h2>
            <ul className="space-y-1">
              <li>- המידע העסקי שאתה מזין שייך לך</li>
              <li>- אתה מאשר ל-BizMap להשתמש במידע זה לצורך מתן השירות בלבד</li>
              <li>- אנו לא נשתמש במידע העסקי שלך לצרכי פרסום או שיתוף עם צדדים שלישיים</li>
            </ul>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">6. המלצות AI</h2>
            <ul className="space-y-1">
              <li>- ההמלצות שמספק השירות הן לצורך מידע בלבד</li>
              <li>- BizMap אינה אחראית להחלטות עסקיות שהתקבלו על בסיס ההמלצות</li>
              <li>- אין לראות בהמלצות ייעוץ מקצועי (משפטי, פיננסי, חשבונאי)</li>
            </ul>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">7. תשלום וביטול</h2>
            <ul className="space-y-1">
              <li>- גרסת ה-MVP הנוכחית ניתנת בחינם</li>
              <li>- תנאי תשלום לגרסאות פרימיום יפורסמו בנפרד</li>
              <li>- ניתן לבטל את החשבון בכל עת</li>
            </ul>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">8. הגבלת אחריות</h2>
            <p>BizMap מסופקת "כפי שהיא" (AS IS). אנו לא ערבים לזמינות מלאה של השירות ולא נישא באחריות לנזקים עקיפים שנגרמו כתוצאה מהשימוש בשירות.</p>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">9. קניין רוחני</h2>
            <ul className="space-y-1">
              <li>- כל הטכנולוגיה, העיצוב והתוכן של BizMap הם קניין של החברה</li>
              <li>- אין להעתיק, לשכפל או להפיץ חלקים מהשירות ללא אישור מפורש</li>
            </ul>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">10. שינויים בשירות</h2>
            <p>אנו שומרים לעצמנו את הזכות לשנות, להשעות או להפסיק חלקים מהשירות בכל עת.</p>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">11. דין חל</h2>
            <p>תנאים אלו כפופים לחוק הישראלי. סכסוכים יידונו בבתי המשפט המוסמכים בישראל.</p>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: "#282a30", backgroundColor: "#191b22" }}>
            <h2 className="mb-2 text-lg font-bold">12. יצירת קשר</h2>
            <p>לשאלות בנושא תנאי השימוש: legal@bizmapai.com</p>
          </section>
        </div>
      </div>
    </main>
  );
}
