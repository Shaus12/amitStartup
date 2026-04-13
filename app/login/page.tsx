"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, Lock, Network } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}
          >
            <Network className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-base font-semibold" style={{ color: "#e2e2eb", fontFamily: "var(--font-manrope)" }}>
            BizView
          </span>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #13141a 0%, #1a1c25 100%)", border: "1px solid #2a2d3a", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}
        >
          <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)" }} />

          <div className="p-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#e2e2eb", fontFamily: "var(--font-manrope)" }}>
              {t.login.welcome}
            </h1>
            <p className="text-sm mb-7" style={{ color: "#6b6f7e" }}>
              {t.login.subtitle}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#424754" }} />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoFocus
                  placeholder={t.login.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg pl-10 pr-4 py-3 text-sm outline-none transition-all"
                  style={{ background: "#0f1016", border: "1px solid #2a2d3a", color: "#e2e2eb", fontFamily: "var(--font-inter)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2d3a")}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#424754" }} />
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder={t.login.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg pl-10 pr-4 py-3 text-sm outline-none transition-all"
                  style={{ background: "#0f1016", border: "1px solid #2a2d3a", color: "#e2e2eb", fontFamily: "var(--font-inter)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "#2a2d3a")}
                />
              </div>

              {error && <p className="text-xs px-1" style={{ color: "#f87171" }}>{error}</p>}

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-[0.98] mt-1"
                style={{
                  background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: loading ? "rgba(255,255,255,0.5)" : "#ffffff",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-inter)",
                }}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{t.login.signingIn}</>
                ) : (
                  t.login.signIn
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: "#33343b" }}>
          {t.login.noAccount}{" "}
          <a href="/" style={{ color: "#424754", textDecoration: "underline" }}>
            {t.login.homepage}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
