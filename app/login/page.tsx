"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { useT } from "@/lib/i18n";

function getPasswordStrength(password: string) {
  return [
    { label: "לפחות 8 תווים", ok: password.length >= 8 },
    { label: "אות גדולה (A-Z)", ok: /[A-Z]/.test(password) },
    { label: "אות קטנה (a-z)", ok: /[a-z]/.test(password) },
    { label: "מספר (0-9)", ok: /\d/.test(password) },
    { label: "תו מיוחד (!@#$...)", ok: /[^A-Za-z0-9]/.test(password) },
  ];
}

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signedUp, setSignedUp] = useState(false);

  const checks = getPasswordStrength(password);
  const passwordValid = checks.every((c) => c.ok);
  const showChecks = mode === "signup" && password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "signup" && !passwordValid) {
      setError("הסיסמה אינה עומדת בדרישות");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      setSignedUp(true);
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "#0b0c11" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "linear-gradient(#1e1f2a 1px, transparent 1px), linear-gradient(90deg, #1e1f2a 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative w-full max-w-sm mx-4">
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="/logo.png" alt="BizMap Logo" className="w-10 h-10 object-contain" />
          <span className="text-base font-semibold" style={{ color: "var(--bv-text-1)", fontFamily: "var(--font-manrope)" }}>
            BizMap
          </span>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #13141a 0%, #1a1c25 100%)", border: "1px solid var(--bv-border)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}
        >
          <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)" }} />

          {/* Mode toggle */}
          <div className="flex border-b border-[var(--bv-border)]/60">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(""); setSignedUp(false); }}
                className="flex-1 py-3 text-sm font-semibold transition-colors"
                style={{
                  color: mode === m ? "var(--bv-text-1)" : "#6b6f7e",
                  borderBottom: mode === m ? "2px solid #6366f1" : "2px solid transparent",
                  background: "transparent",
                }}
              >
                {m === "signin" ? "כניסה" : "הרשמה"}
              </button>
            ))}
          </div>

          <div className="p-8">
            {signedUp ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✉️</div>
                <h2 className="text-white font-bold text-lg mb-2">בדוק את המייל שלך</h2>
                <p className="text-sm" style={{ color: "#6b6f7e" }}>
                  שלחנו לך קישור אימות לכתובת <span className="text-indigo-400">{email}</span>
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--bv-text-1)", fontFamily: "var(--font-manrope)" }}>
                  {mode === "signin" ? t.login.welcome : "יצירת חשבון"}
                </h1>
                <p className="text-sm mb-7" style={{ color: "#6b6f7e" }}>
                  {mode === "signin" ? t.login.subtitle : "הרשם כדי להתחיל"}
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--bv-muted)" }} />
                    <input
                      type="email"
                      required
                      autoFocus
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder={t.login.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-lg pl-10 pr-4 py-3 text-sm outline-none transition-all"
                      style={{ background: "var(--bv-surface)", border: "1px solid var(--bv-border)", color: "var(--bv-text-1)" }}
                      onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--bv-border)")}
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--bv-muted)" }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder={mode === "signup" ? "סיסמה חזקה" : t.login.passwordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-lg pl-10 pr-10 py-3 text-sm outline-none transition-all"
                      style={{ background: "var(--bv-surface)", border: "1px solid var(--bv-border)", color: "var(--bv-text-1)" }}
                      onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--bv-border)")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--bv-muted)" }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password strength checklist */}
                  {showChecks && (
                    <ul className="space-y-1.5 px-1 pb-1">
                      {checks.map((c) => (
                        <li key={c.label} className="flex items-center gap-2 text-xs">
                          {c.ok
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                            : <XCircle className="w-3.5 h-3.5 text-[var(--bv-muted)] flex-shrink-0" />}
                          <span style={{ color: c.ok ? "#86efac" : "#6b6f7e" }}>{c.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {error && <p className="text-xs px-1" style={{ color: "#f87171" }}>{error}</p>}

                  <button
                    type="submit"
                    disabled={loading || (mode === "signup" && !passwordValid)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-[0.98] mt-1"
                    style={{
                      background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: loading ? "rgba(255,255,255,0.5)" : "#ffffff",
                      cursor: loading || (mode === "signup" && !passwordValid) ? "not-allowed" : "pointer",
                      opacity: mode === "signup" && !passwordValid && password.length > 0 ? 0.5 : 1,
                    }}
                  >
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" />{mode === "signin" ? t.login.signingIn : "נרשם..."}</>
                      : mode === "signin" ? t.login.signIn : "צור חשבון"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: "var(--bv-border-subtle)" }}>
          {t.login.noAccount}{" "}
          <Link href="/" style={{ color: "var(--bv-muted)", textDecoration: "underline" }}>
            {t.login.homepage}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
