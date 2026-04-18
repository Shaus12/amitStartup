"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "מה ההזדמנות הכי טובה שלי?",
  "איפה אני מבזבז הכי הרבה זמן?",
  "מה אני צריך לעשות ראשון?",
];

export function FloatingAgent({ businessId }: { businessId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "שלום! אני ARIA, הסוכן ה-AI שלך 🤖\nשאל אותי כל שאלה על העסק שלך — חיסכון בזמן, הזדמנויות, סדר עדיפויות.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen]);

  // Listen for external trigger (from tasks page "open agent" button)
  useEffect(() => {
    function handler(e: Event) {
      const ce = e as CustomEvent<{ message: string }>;
      setIsOpen(true);
      if (ce.detail?.message) {
        setTimeout(() => {
          setInput(ce.detail.message);
          inputRef.current?.focus();
        }, 150);
      }
    }
    window.addEventListener("bm-open-agent", handler);
    return () => window.removeEventListener("bm-open-agent", handler);
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "מצטערת, נתקלתי בבעיה. נסה שוב." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "שגיאת חיבור. בדוק את החיבור ונסה שוב." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            left: 24,
            bottom: 88,
            zIndex: 9998,
            width: 340,
            height: 470,
            backgroundColor: "#13151d",
            border: "1px solid #282a30",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(77,142,255,0.12)",
            animation: "agent-slide-up 0.32s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 14px",
              borderBottom: "1px solid #1e2030",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(135deg, #4d8eff, #adc6ff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(77,142,255,0.35)",
              }}
            >
              <Bot size={18} style={{ color: "#001a42" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#e2e2eb",
                  fontFamily: "var(--font-manrope)",
                }}
              >
                ARIA
              </div>
              <div
                style={{ fontSize: 10, color: "#34d399", fontFamily: "var(--font-inter)" }}
              >
                ● פעיל עכשיו
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#424754",
                padding: 4,
                display: "flex",
                borderRadius: 6,
                transition: "color 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#e2e2eb")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#424754")}
            >
              <X size={15} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-start" : "flex-end",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "8px 12px",
                    borderRadius:
                      msg.role === "user"
                        ? "14px 14px 14px 4px"
                        : "14px 14px 4px 14px",
                    backgroundColor:
                      msg.role === "user"
                        ? "#1e1f26"
                        : "rgba(77,142,255,0.10)",
                    border: `1px solid ${
                      msg.role === "user"
                        ? "#282a30"
                        : "rgba(77,142,255,0.20)"
                    }`,
                    fontSize: 12,
                    color: "#e2e2eb",
                    lineHeight: 1.55,
                    fontFamily: "var(--font-inter)",
                    direction: "rtl",
                    textAlign: "right",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "14px 14px 4px 14px",
                    backgroundColor: "rgba(77,142,255,0.08)",
                    border: "1px solid rgba(77,142,255,0.16)",
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((j) => (
                    <div
                      key={j}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        backgroundColor: "#4d8eff",
                        animation: `bv-pulse-dot 1.2s ease-in-out ${j * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div
            style={{
              padding: "0 14px 8px",
              display: "flex",
              gap: 5,
              flexWrap: "wrap",
              flexShrink: 0,
            }}
          >
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                style={{
                  fontSize: 10,
                  padding: "3px 9px",
                  borderRadius: 99,
                  cursor: "pointer",
                  backgroundColor: "#1a1c24",
                  border: "1px solid #282a30",
                  color: "#8c909f",
                  fontFamily: "var(--font-inter)",
                  direction: "rtl",
                  transition: "all 0.12s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(77,142,255,0.3)";
                  e.currentTarget.style.color = "#4d8eff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#282a30";
                  e.currentTarget.style.color = "#8c909f";
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              padding: "0 12px 12px",
              display: "flex",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="שאל שאלה..."
              dir="rtl"
              style={{
                flex: 1,
                height: 38,
                borderRadius: 10,
                border: "1px solid #282a30",
                backgroundColor: "#1a1c24",
                color: "#e2e2eb",
                fontSize: 12,
                padding: "0 12px",
                outline: "none",
                fontFamily: "var(--font-inter)",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(77,142,255,0.4)")
              }
              onBlur={(e) => (e.currentTarget.style.borderColor = "#282a30")}
            />
            <button
              onClick={send}
              disabled={isLoading || !input.trim()}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "none",
                background:
                  input.trim() && !isLoading
                    ? "linear-gradient(135deg, #4d8eff, #adc6ff)"
                    : "#1e1f26",
                cursor:
                  input.trim() && !isLoading ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              {isLoading ? (
                <Loader2
                  size={14}
                  style={{
                    color: "#424754",
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                <Send
                  size={14}
                  style={{ color: input.trim() ? "#001a42" : "#424754" }}
                />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        title={isOpen ? "סגור" : "שוחח עם ARIA"}
        style={{
          position: "fixed",
          left: 20,
          bottom: 20,
          zIndex: 9999,
          width: 56,
          height: 56,
          borderRadius: 16,
          background: isOpen
            ? "#1e1f26"
            : "linear-gradient(135deg, #4d8eff 0%, #adc6ff 100%)",
          border: isOpen ? "1px solid #282a30" : "none",
          boxShadow: isOpen
            ? "0 4px 12px rgba(0,0,0,0.4)"
            : "0 8px 28px rgba(77,142,255,0.45), 0 0 0 1px rgba(77,142,255,0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.22s cubic-bezier(0.16,1,0.3,1)",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <div
          style={{
            transition: "transform 0.22s, opacity 0.15s",
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          {isOpen ? (
            <X size={22} style={{ color: "#8c909f" }} />
          ) : (
            <Bot size={24} style={{ color: "#001a42" }} />
          )}
        </div>
      </button>
    </>
  );
}
