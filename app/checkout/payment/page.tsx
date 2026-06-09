import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckoutPaymentForm } from "../CheckoutPaymentForm";

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

export default async function CheckoutPaymentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup?from=checkout");
  }

  const skipPayment = process.env.SKIP_PAYMENT === "true";

  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050510] px-5 py-8 text-white sm:px-8"
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
      </div>

      <section className="checkout-glass-card relative z-10 flex w-full max-w-lg flex-col items-center rounded-lg p-6 text-center sm:p-9">
        <Link href="/" className="flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 focus:ring-offset-[#050510]">
          <Image
            src="/logo.png"
            alt="BizMap"
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
            priority
          />
          <span className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-manrope)" }}>
            BizMap
          </span>
        </Link>

        <h1 className="mt-8 text-3xl font-black leading-tight text-white sm:text-4xl">
          השלמת תשלום לניתוח העסקי
        </h1>
        <p className="mt-4 text-base leading-7 text-indigo-100/78 sm:text-lg">
          עוד רגע אחד ונעבור לשיחה הדינמית שתבנה את הניתוח שלך.
        </p>
        <div className="mt-7 text-5xl font-black leading-none text-white">₪300</div>
        <p className="mt-2 text-sm font-medium text-white/55">תשלום חד פעמי · כולל שבוע ניסיון במערכת</p>

        <CheckoutPaymentForm skipPayment={skipPayment} />
      </section>
    </main>
  );
}
