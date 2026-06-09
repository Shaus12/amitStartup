import Link from "next/link";
import Image from "next/image";
import { Check, Gift, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUserRoute } from "@/lib/user-routing";
import { redirect } from "next/navigation";

const includedItems = [
  "ניתוח עסקי מלא ומותאם אישית בדיוק לעסק שלך",
  "זיהוי 5-8 הזדמנויות קונקרטיות לחיסכון בזמן ובכסף",
  "ציון בשלות דיגיטלית מפורט ב-5 צירים",
  "השוואה (Benchmark) מול עסקים דומים בענף שלך",
  "תוכנית פעולה צעד אחר צעד ל-90 הימים הקרובים",
  "ציטוטים וניתוח עומק מהשיחה הדינמית",
];

const pageStyles = `
  @keyframes checkoutBlob1 {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -46px) scale(1.08); }
    66% { transform: translate(-22px, 24px) scale(0.92); }
    100% { transform: translate(0, 0) scale(1); }
  }

  @keyframes checkoutBlob2 {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-34px, 48px) scale(1.16); }
    66% { transform: translate(18px, -24px) scale(0.86); }
    100% { transform: translate(0, 0) scale(1); }
  }

  @keyframes checkoutBlob3 {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(38px, 18px) scale(0.92); }
    66% { transform: translate(-42px, -18px) scale(1.1); }
    100% { transform: translate(0, 0) scale(1); }
  }

  .checkout-aurora-blob {
    position: absolute;
    filter: blur(80px);
    opacity: 0.16;
    pointer-events: none;
  }

  .checkout-glass-card {
    background: rgba(255, 255, 255, 0.055);
    backdrop-filter: blur(22px);
    border: 1px solid rgba(255, 255, 255, 0.11);
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
  }

  .checkout-cta {
    position: relative;
    overflow: hidden;
  }

  .checkout-cta::after {
    content: "";
    position: absolute;
    top: 0;
    left: -80%;
    width: 46%;
    height: 100%;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.34), transparent);
    transform: skewX(-20deg);
    transition: left 0.55s ease;
  }

  .checkout-cta:hover::after {
    left: 135%;
  }
`;

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const route = await getUserRoute(supabaseAdmin, user.id);
    if (route !== "/checkout") {
      redirect(route);
    }
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#050510] px-5 py-8 text-white sm:px-8 sm:py-10"
    >
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="absolute inset-0 overflow-hidden">
        <div
          className="checkout-aurora-blob left-[-160px] top-[-150px] h-[520px] w-[520px] rounded-full sm:h-[650px] sm:w-[650px]"
          style={{
            background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)",
            animation: "checkoutBlob1 8s infinite alternate",
          }}
        />
        <div
          className="checkout-aurora-blob bottom-[8%] right-[-130px] h-[470px] w-[470px] rounded-full sm:h-[560px] sm:w-[560px]"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
            animation: "checkoutBlob2 12s infinite alternate",
          }}
        />
        <div
          className="checkout-aurora-blob left-[14%] top-[34%] h-[360px] w-[360px] rounded-full sm:h-[440px] sm:w-[440px]"
          style={{
            background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)",
            animation: "checkoutBlob3 10s infinite alternate",
          }}
        />
      </div>

      <Link
        href="/"
        className="relative z-20 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/12 bg-white/[0.055] px-4 py-2 text-sm font-bold text-white/78 backdrop-blur-xl transition hover:bg-white/[0.09] hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 focus:ring-offset-[#050510]"
      >
        <Home className="h-4 w-4" aria-hidden="true" />
        חזרה לדף הבית
      </Link>

      <section className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center">
        <header className="flex w-full flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 focus:ring-offset-[#050510]">
            <Image
              src="/logo.png"
              alt="BizMap"
              width={56}
              height={56}
              className="h-12 w-12 object-contain sm:h-14 sm:w-14"
              priority
            />
            <span
              className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              BizMap
            </span>
          </Link>

          <h1 className="mt-9 max-w-3xl text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl md:text-6xl">
            הניתוח העסקי המלא של BizMap
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-indigo-100/82 sm:text-xl">
            ניתוח מעמיק ומותאם אישית של העסק שלך — שיראה לך איפה לחסוך זמן וכסף
          </p>
        </header>

        <div className="mt-10 grid w-full gap-5 sm:mt-12">
          <article className="checkout-glass-card rounded-lg p-5 sm:p-7">
            <h2 className="text-2xl font-bold text-white">מה תקבל בניתוח:</h2>
            <ul className="mt-5 space-y-4">
              {includedItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-base leading-7 text-white/86 sm:text-lg">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/14 text-emerald-300 ring-1 ring-emerald-300/25">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-lg border border-amber-300/22 bg-[linear-gradient(135deg,rgba(124,58,237,0.28),rgba(245,158,11,0.17))] p-5 shadow-[0_24px_80px_rgba(88,28,135,0.22)] backdrop-blur-2xl sm:p-7">
            <div className="flex items-center gap-3 text-2xl font-black text-white">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-300/16 text-amber-200 ring-1 ring-amber-200/28">
                <Gift className="h-5 w-5" />
              </span>
              <h2>בונוס: שבוע חינם במערכת המלאה</h2>
            </div>
            <p className="mt-4 text-base leading-8 text-amber-50/88 sm:text-lg">
              תוכל ליישם את הניתוח עם המפה הדיגיטלית, יועץ AI אישי, ולוח משימות מותאם — חינם לשבוע
              מלא, בלי כרטיס אשראי.
            </p>
          </article>
        </div>

        <section className="mt-10 flex w-full flex-col items-center text-center">
          <div className="text-6xl font-black leading-none text-white sm:text-7xl">₪300</div>
          <p className="mt-3 text-base font-medium text-indigo-100/78 sm:text-lg">
            תשלום חד פעמי · כולל שבוע ניסיון במערכת
          </p>

          <Link
            href="/signup?from=checkout"
            className="checkout-cta mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-lg bg-gradient-to-l from-indigo-500 via-violet-500 to-sky-500 px-7 py-4 text-lg font-black text-white shadow-[0_18px_48px_rgba(79,70,229,0.38)] transition duration-200 hover:scale-[1.01] hover:shadow-[0_22px_58px_rgba(79,70,229,0.48)] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 focus:ring-offset-[#050510] sm:w-auto sm:min-w-[360px]"
          >
            המשך להרשמה
          </Link>

          <p className="mt-5 text-sm font-medium leading-6 text-white/58 sm:text-base">
            תשלום מאובטח · ביטול תוך 14 יום · החזר כספי מלא
          </p>
        </section>
      </section>
    </main>
  );
}
