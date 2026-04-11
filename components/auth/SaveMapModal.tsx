"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, MapPin, Lock, Mail, CheckCircle } from "lucide-react";

interface Props {
  businessId: string;
  businessName: string;
}

export function SaveMapModal({ businessId, businessName }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingConfirm, setPendingConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // 1. Create Supabase auth user + sign in
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Account creation failed. Please try again.");

      // 2. If email confirmation is required, show pending state
      if (!data.session) {
        setPendingConfirm(true);
        setLoading(false);
        return;
      }

      // 3. Link the business to the new user
      const claimRes = await fetch("/api/auth/claim-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      if (!claimRes.ok) throw new Error("Failed to link account to business.");

      // 4. Clear the onboarding cookie — session now handles access
      document.cookie =
        "onboarding_just_completed=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";

      // 5. Refresh — server re-renders with session, modal disappears
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  // ── Email confirmation pending state ──────────────────────────────
  if (pendingConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
        <div
          className="w-full max-w-md mx-4 rounded-2xl p-8 text-center"
          style={{
            background: "linear-gradient(135deg, #13141a 0%, #1a1c25 100%)",
            border: "1px solid #2a2d3a",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}
          >
            <CheckCircle className="w-6 h-6" style={{ color: "#6366f1" }} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-sm" style={{ color: "#8c909f" }}>
            We sent a confirmation link to <strong className="text-white">{email}</strong>.
            Click it to activate your account and return to your map.
          </p>
        </div>
      </div>
    );
  }

  // ── Main modal ────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
      <div
        className="w-full max-w-md mx-4 rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #13141a 0%, #1a1c25 100%)",
          border: "1px solid #2a2d3a",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Top accent bar */}
        <div
          className="h-0.5 w-full"
          style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)" }}
        />

        <div className="p-8">
          {/* Icon + headline */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
              }}
            >
              <MapPin className="w-5 h-5" style={{ color: "#6366f1" }} />
            </div>
            <div>
              <h2
                className="text-xl font-bold leading-tight"
                style={{ color: "#e2e2eb", fontFamily: "var(--font-manrope)" }}
              >
                Save your business map
              </h2>
              <p className="mt-1 text-sm" style={{ color: "#6b6f7e" }}>
                Create a free account to access{" "}
                <span style={{ color: "#9ca0b0" }}>{businessName}</span> from any device.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "#424754" }}
              />
              <input
                id="save-map-email"
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg pl-10 pr-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "#0f1016",
                  border: "1px solid #2a2d3a",
                  color: "#e2e2eb",
                  fontFamily: "var(--font-inter)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "#2a2d3a")}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: "#424754" }}
              />
              <input
                id="save-map-password"
                type="password"
                required
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg pl-10 pr-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "#0f1016",
                  border: "1px solid #2a2d3a",
                  color: "#e2e2eb",
                  fontFamily: "var(--font-inter)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "#2a2d3a")}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs px-1" style={{ color: "#f87171" }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              id="save-map-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
              style={{
                background: loading
                  ? "rgba(99,102,241,0.4)"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: loading ? "rgba(255,255,255,0.5)" : "#ffffff",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-inter)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Save my map →"
              )}
            </button>
          </form>

          {/* Fine print */}
          <p className="mt-4 text-center text-xs" style={{ color: "#424754" }}>
            Free forever · No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
