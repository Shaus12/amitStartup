"use client";

import { useState, useEffect, useRef } from "react";
import { Brain, X } from "lucide-react";

interface KnowledgeRequest {
  id: string;
  question: string;
  business_id: string;
}

interface Props {
  businessId: string;
}

type Phase = "hidden" | "visible" | "thank-you" | "done";

export function KnowledgeRequestPopup({ businessId }: Props) {
  const [request, setRequest] = useState<KnowledgeRequest | null>(null);
  const [phase, setPhase] = useState<Phase>("hidden");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Fetch after 3 seconds
    showTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/knowledge-requests/next?businessId=${businessId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.popup) {
          setRequest(data.popup);
          setPhase("visible");
          // Auto-dismiss after 30 seconds
          dismissTimer.current = setTimeout(() => dismiss(), 30000);
        }
      } catch {
        // silently fail — non-critical feature
      }
    }, 3000);

    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  function dismiss() {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setPhase("done");
  }

  async function handleSave() {
    if (!answer.trim() || !request) return;
    setSaving(true);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    try {
      await fetch("/api/knowledge-requests/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: request.business_id,
          requestId: request.id,
          question: request.question,
          answer,
        }),
      });
      setPhase("thank-you");
      setTimeout(() => setPhase("done"), 2200);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  if (phase === "done" || !request) return null;

  const isVisible = phase === "visible" || phase === "thank-you";
  const isThankYou = phase === "thank-you";

  return (
    <>
      <style>{`
        @keyframes kr-slide-in {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes kr-thank-you {
          0%   { opacity: 1; transform: scale(1); }
          40%  { opacity: 1; transform: scale(1.04); }
          100% { opacity: 0; transform: scale(0.95) translateY(10px); }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          bottom: 88,
          left: 20,
          zIndex: 9990,
          width: 300,
          backgroundColor: "#13151d",
          border: "1px solid #282a30",
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(168,139,250,0.1)",
          fontFamily: "var(--font-inter)",
          direction: "rtl",
          overflow: "hidden",
          animation: isThankYou
            ? "kr-thank-you 2.2s cubic-bezier(0.16,1,0.3,1) forwards"
            : "kr-slide-in 0.35s cubic-bezier(0.16,1,0.3,1) both",
          pointerEvents: isVisible ? "all" : "none",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: 3,
            background: "linear-gradient(90deg, transparent, #a78bfa, transparent)",
            boxShadow: "0 0 10px #a78bfa80",
          }}
        />

        {isThankYou ? (
          /* Thank-you state */
          <div
            style={{
              padding: "20px 18px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32 }}>🙏</div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#a78bfa",
                fontFamily: "var(--font-manrope)",
              }}
            >
              תודה רבה!
            </p>
            <p style={{ fontSize: 12, color: "#8c909f" }}>
              ה-AI שלך עודכן עם המידע החדש.
            </p>
          </div>
        ) : (
          /* Question state */
          <>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px 10px",
                borderBottom: "1px solid #1e2030",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 4px 10px rgba(167,139,250,0.35)",
                  }}
                >
                  <Brain size={14} style={{ color: "white" }} />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#a78bfa",
                    fontFamily: "var(--font-manrope)",
                    letterSpacing: "0.01em",
                  }}
                >
                  🧠 שאלה אחת
                </span>
              </div>
              <button
                onClick={dismiss}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#424754",
                  padding: 2,
                  display: "flex",
                  borderRadius: 6,
                  transition: "color 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#8c909f")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#424754")}
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "12px 14px 14px" }}>
              {/* Question text */}
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#e2e2eb",
                  lineHeight: 1.5,
                  marginBottom: 10,
                  fontFamily: "var(--font-manrope)",
                }}
              >
                {request.question}
              </p>

              {/* Text input */}
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
                }}
                placeholder="הכנס תשובה קצרה..."
                dir="rtl"
                rows={2}
                style={{
                  width: "100%",
                  resize: "none",
                  borderRadius: 8,
                  border: "1px solid #282a30",
                  backgroundColor: "#1a1c24",
                  color: "#e2e2eb",
                  fontSize: 12,
                  padding: "8px 10px",
                  outline: "none",
                  fontFamily: "var(--font-inter)",
                  lineHeight: 1.5,
                  transition: "border-color 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#282a30")}
              />

              {/* Action buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 8,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={dismiss}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "5px 12px",
                    borderRadius: 7,
                    border: "1px solid #282a30",
                    backgroundColor: "transparent",
                    color: "#424754",
                    cursor: "pointer",
                    fontFamily: "var(--font-inter)",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1e1f26";
                    e.currentTarget.style.color = "#8c909f";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#424754";
                  }}
                >
                  אחר כך
                </button>
                <button
                  onClick={handleSave}
                  disabled={!answer.trim() || saving}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 14px",
                    borderRadius: 7,
                    border: "1px solid rgba(167,139,250,0.4)",
                    background:
                      answer.trim() && !saving
                        ? "linear-gradient(135deg, #7c3aed, #a78bfa)"
                        : "#1e1f26",
                    color: answer.trim() && !saving ? "white" : "#424754",
                    cursor: answer.trim() && !saving ? "pointer" : "not-allowed",
                    fontFamily: "var(--font-inter)",
                    transition: "all 0.15s",
                  }}
                >
                  {saving ? "שומר..." : "שמור"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
