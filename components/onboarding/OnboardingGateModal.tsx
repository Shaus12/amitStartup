"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { Loader2, Mail, Lock, X } from "lucide-react";
type Mode = "signup" | "login";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Body for POST /api/onboarding (full answers or { ...answers, quickMode: true }) */
  onboardingPayload: Record<string, unknown>;
}

export function OnboardingGateModal({ open, onClose, onboardingPayload }: Props) {
  const router = useRouter();
  const resetStore = useOnboardingStore((s) => s.reset);
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);

  if (!open) return null;

  async function saveOnboardingAndGo() {
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(onboardingPayload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.details || body.message || body.error || "שמירת הנתונים נכשלה");
    }
    const businessId = body.businessId as string;
    // Navigate before resetting the wizard store, otherwise the persisted step jumps to 0
    // for a frame under the gate modal (visible flash of onboarding start).
    router.push(`/loading?businessId=${encodeURIComponent(businessId)}`);
    router.refresh();
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptedLegal) {
      setError("יש לאשר את תנאי השימוש ומדיניות הפרטיות");
      return;
    }
    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("יצירת החשבון נכשלה. נסה שוב.");

      if (!data.session) {
        setPendingConfirm(true);
        setLoading(false);
        return;
      }

      await saveOnboardingAndGo();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "משהו השתבש. נסה שוב.";
      setError(msg);
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const statusRes = await fetch("/api/auth/business-status");
      const statusBody = await statusRes.json().catch(() => ({}));
      if (!statusRes.ok) throw new Error(statusBody.error || "בדיקת חשבון נכשלה");

      if (statusBody.hasBusiness && statusBody.businessId) {
        router.push("/dashboard");
        router.refresh();
        queueMicrotask(() => resetStore());
        return;
      }

      await saveOnboardingAndGo();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ההתחברות נכשלה.";
      setError(msg);
      setLoading(false);
    }
  }

  if (pendingConfirm) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md">
        <div
          className="w-full max-w-md mx-4 rounded-2xl p-8 text-center relative"
          style={{
            background: "linear-gradient(135deg, #13141a 0%, #1a1c25 100%)",
            border: "1px solid #2a2d3a",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setPendingConfirm(false);
              setLoading(false);
              onClose();
            }}
            className="absolute top-3 right-3 p-2 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"
            aria-label="סגור"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-bold text-white mb-2">בדוק את האימייל שלך</h2>
          <p className="text-sm" style={{ color: "#8c909f" }}>
            שלחנו קישור לאימות לכתובת <strong className="text-white">{email}</strong>. לאחר האימות תוכל להתחבר ולהמשיך.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md">
      <div
        className="w-full max-w-md mx-4 rounded-2xl overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #13141a 0%, #1a1c25 100%)",
          border: "1px solid #2a2d3a",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"
          aria-label="חזרה לסיכום"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)" }} />

        <div className="p-8 pt-12" dir="rtl">
          <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-manrope)" }}>
            כמעט שם! שמור את המפה שלך
          </h2>
          <p className="text-sm mb-6" style={{ color: "#6b6f7e" }}>
            צור חשבון חינמי כדי לראות את המפה העסקית המלאה שלך
          </p>

          <form onSubmit={mode === "signup" ? handleSignup : handleLogin} className="space-y-3">
            <div className="relative">
              <Mail
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "#424754" }}
              />
              <input
                type="email"
                required
                placeholder="האימייל שלך"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg pr-10 pl-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "#0f1016",
                  border: "1px solid #2a2d3a",
                  color: "#e2e2eb",
                  fontFamily: "var(--font-inter)",
                }}
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "#424754" }}
              />
              <input
                type="password"
                required
                placeholder="סיסמה (מינימום 6 תווים)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                minLength={mode === "signup" ? 6 : undefined}
                className="w-full rounded-lg pr-10 pl-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "#0f1016",
                  border: "1px solid #2a2d3a",
                  color: "#e2e2eb",
                  fontFamily: "var(--font-inter)",
                }}
              />
            </div>

            {error && (
              <p className="text-xs px-1" style={{ color: "#f87171" }}>
                {error}
              </p>
            )}

            {mode === "signup" && (
              <label className="flex items-start gap-2 px-1 text-xs" style={{ color: "#8c909f", fontFamily: "var(--font-inter)" }}>
                <input
                  type="checkbox"
                  checked={acceptedLegal}
                  onChange={(e) => setAcceptedLegal(e.target.checked)}
                  disabled={loading}
                  className="mt-0.5"
                  required
                />
                <span>
                  אני מסכים/ה ל
                  <Link href="/terms" target="_blank" className="underline text-zinc-300 mx-1">
                    תנאי השימוש
                  </Link>
                  ול
                  <Link href="/privacy" target="_blank" className="underline text-zinc-300 mx-1">
                    מדיניות הפרטיות
                  </Link>
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading || (mode === "signup" && !acceptedLegal)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
              style={{
                background: loading || (mode === "signup" && !acceptedLegal) ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: loading || (mode === "signup" && !acceptedLegal) ? "rgba(255,255,255,0.5)" : "#ffffff",
                cursor: loading || (mode === "signup" && !acceptedLegal) ? "not-allowed" : "pointer",
                fontFamily: "var(--font-inter)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === "signup" ? "יוצר חשבון…" : "מתחבר…"}
                </>
              ) : mode === "signup" ? (
                "צור חשבון וראה את המפה ←"
              ) : (
                "התחבר ←"
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-xs" style={{ color: "#6b6f7e" }}>
            {mode === "signup" ? (
              <>
                כבר יש לך חשבון?{" "}
                <button
                  type="button"
                  className="underline text-zinc-400 hover:text-zinc-200"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                >
                  התחבר
                </button>
              </>
            ) : (
              <>
                אין לך חשבון?{" "}
                <button
                  type="button"
                  className="underline text-zinc-400 hover:text-zinc-200"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                >
                  צור חשבון
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
