"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

export function CheckoutPaymentForm({ skipPayment = false }: { skipPayment?: boolean }) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedPhone = phone.replace(/\D/g, "");
  const phoneIsValid = /^05\d{8}$/.test(normalizedPhone);
  const fullNameIsValid = fullName.trim().length > 0;
  const showPhoneError = phoneTouched && phone.length > 0 && !phoneIsValid;
  const showFullNameError = fullNameTouched && !fullNameIsValid;

  function handleOpen() {
    setError(null);
    setOpen(true);
  }

  function handleClose() {
    if (loading) return;
    setOpen(false);
    setPhoneTouched(false);
  }

  async function handlePayment() {
    setPhoneTouched(true);
    setFullNameTouched(true);
    setError(null);

    if (!phoneIsValid || !fullNameIsValid) return;

    if (skipPayment) {
      window.location.href = "/payment-simulation";
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/analysis/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone, fullName }),
      });
      const data = (await res.json()) as { payment_url?: unknown; error?: string };

      if (res.status === 401) {
        window.location.href = "/signup?from=checkout";
        return;
      }

      if (!res.ok || typeof data.payment_url !== "string") {
        throw new Error(data.error ?? "Payment request failed");
      }

      window.location.href = data.payment_url;
    } catch (err) {
      console.error("[CheckoutPaymentForm] payment error:", err);
      setError("אירעה שגיאה ביצירת התשלום. נסה שוב בעוד רגע.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="checkout-cta mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-lg bg-gradient-to-l from-indigo-500 via-violet-500 to-sky-500 px-7 py-4 text-lg font-black text-white shadow-[0_18px_48px_rgba(79,70,229,0.38)] transition duration-200 hover:scale-[1.01] hover:shadow-[0_22px_58px_rgba(79,70,229,0.48)] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 focus:ring-offset-[#050510] sm:w-auto sm:min-w-[360px]"
      >
        שלם עכשיו
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" dir="rtl">
          <div className="relative w-full max-w-sm rounded-lg border border-white/12 bg-[#111322]/95 p-6 text-right text-white shadow-2xl backdrop-blur-2xl">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-50"
              aria-label="סגור"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="mb-5 pl-8">
              <h2 className="text-xl font-extrabold text-white">רגע לפני התשלום 📱</h2>
              <p className="mt-2 text-sm leading-6 text-white/58">
                נדרש שם מלא ומספר טלפון לצורך קבלת חשבונית ועדכוני תשלום
              </p>
            </div>

            <label className="mb-2 block text-sm font-bold text-indigo-100/82" htmlFor="analysis-full-name">
              שם מלא
            </label>
            <input
              id="analysis-full-name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                setError(null);
              }}
              onBlur={() => setFullNameTouched(true)}
              disabled={loading}
              placeholder="ישראל ישראלי"
              className="mb-4 h-12 w-full rounded-lg border border-white/12 bg-white/[0.055] px-4 text-right text-base font-medium text-white outline-none transition placeholder:text-white/30 focus:border-indigo-300/70 focus:ring-2 focus:ring-indigo-300/20 disabled:cursor-not-allowed disabled:opacity-60"
              aria-invalid={showFullNameError}
            />
            {showFullNameError && (
              <p className="-mt-2 mb-3 text-sm font-medium text-red-300">
                יש להזין שם מלא
              </p>
            )}

            <label className="mb-2 block text-sm font-bold text-indigo-100/82" htmlFor="analysis-phone">
              מספר טלפון
            </label>
            <input
              id="analysis-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setError(null);
              }}
              onBlur={() => setPhoneTouched(true)}
              disabled={loading}
              placeholder="0501234567"
              className="h-12 w-full rounded-lg border border-white/12 bg-white/[0.055] px-4 text-right text-base font-medium text-white outline-none transition placeholder:text-white/30 focus:border-indigo-300/70 focus:ring-2 focus:ring-indigo-300/20 disabled:cursor-not-allowed disabled:opacity-60"
              aria-invalid={showPhoneError}
            />
            {showPhoneError && (
              <p className="mt-2 text-sm font-medium text-red-300">
                יש להזין מספר ישראלי תקין שמתחיל ב-05
              </p>
            )}
            {error && <p className="mt-2 text-sm font-medium text-red-300">{error}</p>}

            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-gradient-to-l from-indigo-500 via-violet-500 to-sky-500 px-6 py-3 text-base font-black text-white shadow-[0_18px_48px_rgba(79,70,229,0.32)] transition duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 focus:ring-offset-[#111322] disabled:pointer-events-none disabled:opacity-70"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  מעביר לעמוד התשלום...
                </span>
              ) : (
                "המשך לעמוד התשלום ←"
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
