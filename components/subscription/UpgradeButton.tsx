"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Plan = "pro" | "business";

type UpgradeButtonProps = {
  plan: Plan;
  label: string;
};

export function UpgradeButton({ plan, label }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedPhone = phone.replace(/\D/g, "");
  const phoneIsValid = /^05\d{8}$/.test(normalizedPhone);
  const showPhoneError = phoneTouched && phone.length > 0 && !phoneIsValid;

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
    if (!phoneIsValid) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Not authenticated");
      }

      const res = await fetch("/api/subscription/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId: user.id, phone: normalizedPhone }),
      });
      const data = (await res.json()) as { payment_url?: unknown; error?: string };

      if (!res.ok || typeof data.payment_url !== "string") {
        throw new Error(data.error ?? "Payment request failed");
      }

      window.location.href = data.payment_url;
    } catch (err) {
      console.error("[UpgradeButton] payment error:", err);
      setError("אירעה שגיאה, נסה שנית");
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-2" dir="rtl">
      <Button
        type="button"
        onClick={handleOpen}
        className="h-11 w-full rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.18)] hover:bg-blue-500"
      >
        {label}
      </Button>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-sm rounded-2xl border border-[var(--bv-border)] bg-[var(--bv-bg)] p-6 text-right shadow-2xl">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="absolute left-3 top-3 inline-flex size-8 items-center justify-center rounded-full text-[var(--bv-muted)] transition-colors hover:bg-[var(--bv-surface)] hover:text-white disabled:pointer-events-none disabled:opacity-50"
              aria-label="סגור"
            >
              <X className="size-4" aria-hidden="true" />
            </button>

            <div className="mb-5 pr-1">
              <h2 className="text-xl font-extrabold text-white">רגע אחד לפני התשלום 📱</h2>
              <p className="mt-2 text-sm text-[var(--bv-text-3)]">נדרש מספר טלפון לצורך קבלת חשבונית</p>
            </div>

            <label className="mb-2 block text-sm font-bold text-[var(--bv-text-2)]" htmlFor={`upgrade-phone-${plan}`}>
              מספר טלפון
            </label>
            <input
              id={`upgrade-phone-${plan}`}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setError(null);
              }}
              onBlur={() => setPhoneTouched(true)}
              placeholder="05X-XXXXXXX"
              className="h-11 w-full rounded-xl border border-[var(--bv-border)] bg-[var(--bv-surface)] px-4 text-right text-white outline-none transition-colors placeholder:text-[var(--bv-muted)] focus:border-blue-500"
              aria-invalid={showPhoneError}
            />
            {showPhoneError && (
              <p className="mt-2 text-sm font-medium text-red-400">נא להזין מספר טלפון ישראלי תקין</p>
            )}

            <Button
              type="button"
              onClick={handlePayment}
              disabled={!phoneIsValid || loading}
              aria-busy={loading}
              className="mt-5 h-11 w-full bg-blue-600 text-base font-bold hover:bg-blue-500"
            >
              {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
              {loading ? "מעבד..." : "המשך לתשלום ←"}
            </Button>

            <p className="mt-3 text-center text-xs font-medium text-[var(--bv-muted)]">לא נשלח אליך ספאם 🔒</p>
          </div>
        </div>
      )}
    </div>
  );
}
