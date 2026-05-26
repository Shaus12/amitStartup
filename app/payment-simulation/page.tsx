"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

const welcomeSteps = [
  {
    icon: "💬",
    title: "שיחה דינמית עם BizMap",
    description: "תנהל איתנו שיחה חכמה של 5-10 דקות. נכיר את העסק שלך לעומק — לא טופס, לא שאלון. שיחה אמיתית.",
  },
  {
    icon: "📊",
    title: "ניתוח עסקי מעמיק",
    description: "נכין לך ניתוח מותאם אישית עם הזדמנויות לחיסכון, השוואה לעסקים דומים, ותוכנית פעולה ל-90 יום.",
  },
  {
    icon: "🚀",
    title: "שבוע חינם במערכת",
    description: "תקבל גישה מלאה למערכת עם מפת עסק דיגיטלית, יועץ AI אישי, ולוח משימות — חינם לשבוע.",
  },
];

const pageStyles = `
  @keyframes paymentBlob1 {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -46px) scale(1.08); }
    66% { transform: translate(-22px, 24px) scale(0.92); }
    100% { transform: translate(0, 0) scale(1); }
  }

  @keyframes paymentBlob2 {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-34px, 48px) scale(1.16); }
    66% { transform: translate(18px, -24px) scale(0.86); }
    100% { transform: translate(0, 0) scale(1); }
  }

  @keyframes paymentBlob3 {
    0% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(38px, 18px) scale(0.92); }
    66% { transform: translate(-42px, -18px) scale(1.1); }
    100% { transform: translate(0, 0) scale(1); }
  }

  .payment-aurora-blob {
    position: absolute;
    filter: blur(80px);
    opacity: 0.16;
    pointer-events: none;
  }

  .payment-glass-card {
    background: rgba(255, 255, 255, 0.055);
    backdrop-filter: blur(22px);
    border: 1px solid rgba(255, 255, 255, 0.11);
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
  }

  @keyframes modalFadeIn {
    from { opacity: 0; transform: translateY(14px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes stepFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes ctaPulse {
    0%, 100% { transform: scale(1); box-shadow: 0 18px 48px rgba(79,70,229,0.38); }
    50% { transform: scale(1.015); box-shadow: 0 22px 64px rgba(79,70,229,0.55); }
  }

  .welcome-modal {
    animation: modalFadeIn 520ms ease both;
  }

  .welcome-step {
    opacity: 0;
    animation: stepFadeIn 460ms ease both;
  }

  .welcome-cta {
    animation: ctaPulse 2.4s ease-in-out infinite;
  }
`;

export default function PaymentSimulationPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"processing" | "success" | "welcome">("processing");

  useEffect(() => {
    const successTimer = window.setTimeout(() => setPhase("success"), 3000);
    const welcomeTimer = window.setTimeout(() => setPhase("welcome"), 4000);

    return () => {
      window.clearTimeout(successTimer);
      window.clearTimeout(welcomeTimer);
    };
  }, []);

  const isSuccess = phase === "success";
  const isWelcome = phase === "welcome";

  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050510] px-5 py-8 text-white"
    >
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <div className="absolute inset-0 overflow-hidden">
        <div
          className="payment-aurora-blob left-[-160px] top-[-150px] h-[520px] w-[520px] rounded-full sm:h-[650px] sm:w-[650px]"
          style={{
            background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)",
            animation: "paymentBlob1 8s infinite alternate",
          }}
        />
        <div
          className="payment-aurora-blob bottom-[8%] right-[-130px] h-[470px] w-[470px] rounded-full sm:h-[560px] sm:w-[560px]"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
            animation: "paymentBlob2 12s infinite alternate",
          }}
        />
        <div
          className="payment-aurora-blob left-[14%] top-[34%] h-[360px] w-[360px] rounded-full sm:h-[440px] sm:w-[440px]"
          style={{
            background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)",
            animation: "paymentBlob3 10s infinite alternate",
          }}
        />
      </div>

      {isWelcome ? (
        <section className="payment-glass-card welcome-modal relative z-10 w-full max-w-[600px] rounded-lg p-5 text-center sm:p-8">
          <div className="text-5xl sm:text-6xl">🎉</div>
          <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
            ברוכים הבאים ל-BizMap!
          </h1>
          <p className="mt-3 text-base leading-7 text-indigo-100/78 sm:text-lg">
            התשלום שלך התקבל. בואו נראה מה הולך לקרות עכשיו:
          </p>

          <div className="mt-7 grid gap-3 text-right">
            {welcomeSteps.map((step, index) => (
              <article
                key={step.title}
                className="welcome-step rounded-lg border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl sm:flex sm:items-start sm:gap-4"
                style={{ animationDelay: `${180 + index * 140}ms` }}
              >
                <div className="mb-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-400/12 text-2xl ring-1 ring-indigo-200/18 sm:mb-0">
                  {step.icon}
                </div>
                <div>
                  <h2 className="text-base font-black text-white sm:text-lg">{step.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-white/68 sm:text-base">{step.description}</p>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            onClick={() => router.push("/onboarding-chat")}
            className="welcome-cta mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-lg bg-gradient-to-l from-indigo-500 via-violet-500 to-sky-500 px-7 py-4 text-lg font-black text-white transition duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 focus:ring-offset-[#050510] sm:w-auto sm:min-w-[300px]"
          >
            בואו נתחיל ←
          </button>
          <p className="mt-4 text-sm text-white/52">הכל יקח בערך 10-15 דקות</p>
        </section>
      ) : (
        <section className="payment-glass-card relative z-10 flex w-full max-w-md flex-col items-center rounded-lg p-8 text-center sm:p-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-400/14 text-indigo-200 ring-1 ring-indigo-200/25">
            {isSuccess ? <Check className="h-8 w-8" strokeWidth={3} /> : <Loader2 className="h-8 w-8 animate-spin" />}
          </div>

          <h1 className="mt-6 text-2xl font-black text-white sm:text-3xl">
            {isSuccess ? "✓ התשלום בוצע בהצלחה!" : "מעבד תשלום..."}
          </h1>
          <p className="mt-3 text-base leading-7 text-indigo-100/78">
            {isSuccess ? "מעבירים אותך לניתוח..." : "(זוהי הדמיה — לא מתבצע חיוב בפועל)"}
          </p>
        </section>
      )}
    </main>
  );
}
