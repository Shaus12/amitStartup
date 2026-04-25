"use client";

import { useState, useRef, useEffect } from "react";
import { Lightbulb, Send, X } from "lucide-react";

interface FeedbackWidgetProps {
  businessId: string;
}

export function FeedbackWidget({ businessId }: FeedbackWidgetProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>(() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    try { const s = localStorage.getItem("feedback-pos"); return s ? JSON.parse(s) : { x: 0, y: 0 }; } catch { return { x: 0, y: 0 }; }
  });
  const dragState = useRef<{ startX: number; startY: number; initDx: number; initDy: number } | null>(null);
  const didDrag = useRef(false);

  useEffect(() => {
    try { localStorage.setItem("feedback-pos", JSON.stringify(dragOffset)); } catch {}
  }, [dragOffset]);

  function handleFBPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, initDx: dragOffset.x, initDy: dragOffset.y };
    didDrag.current = false;
  }
  function handleFBPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag.current = true;
    if (didDrag.current) setDragOffset({ x: dragState.current.initDx + dx, y: dragState.current.initDy + dy });
  }
  function handleFBPointerUp() { dragState.current = null; }

  async function submit() {
    const trimmed = message.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, businessId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setMessage("");
      setStatus("תודה! קיבלנו את ההצעה שלך.");
      window.setTimeout(() => {
        setOpen(false);
        setStatus(null);
      }, 1200);
    } catch {
      setStatus("לא הצלחנו לשמור כרגע. נסה שוב.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {open && (
        <div
          className="bottom-20 md:bottom-5"
          style={{
            position: "fixed",
            right: 20,
            zIndex: 9998,
            width: 300,
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
            backgroundColor: "#13151d",
            border: "1px solid #282a30",
            borderRadius: 14,
            padding: 12,
            boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e2eb", fontFamily: "var(--font-inter)" }}>
              רעיון למוצר?
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close feedback"
              style={{
                background: "none",
                border: "none",
                color: "#8c909f",
                cursor: "pointer",
                padding: 2,
              }}
            >
              <X size={14} />
            </button>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="משוב לצוות BizMap..."
            maxLength={800}
            dir="rtl"
            style={{
              width: "100%",
              minHeight: 84,
              resize: "vertical",
              borderRadius: 10,
              border: "1px solid #282a30",
              backgroundColor: "#1a1c24",
              color: "#e2e2eb",
              fontSize: 12,
              fontFamily: "var(--font-inter)",
              padding: "10px 10px",
              outline: "none",
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{ fontSize: 10, color: status?.includes("תודה") ? "#34d399" : "#8c909f", fontFamily: "var(--font-inter)" }}>
              {status ?? "נשלח ישירות לצוות המוצר"}
            </span>
            <button
              onClick={submit}
              disabled={submitting || !message.trim()}
              style={{
                height: 30,
                padding: "0 10px",
                borderRadius: 8,
                border: "none",
                background: message.trim() ? "linear-gradient(135deg, #4d8eff, #adc6ff)" : "#1e1f26",
                color: message.trim() ? "#001a42" : "#424754",
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "var(--font-inter)",
                cursor: message.trim() && !submitting ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Send size={12} />
              שליחה
            </button>
          </div>
        </div>
      )}

      {!open && (
        <button
          onClick={() => { if (didDrag.current) return; setOpen(true); }}
          onPointerDown={handleFBPointerDown}
          onPointerMove={handleFBPointerMove}
          onPointerUp={handleFBPointerUp}
          title="שלח פידבק לצוות BizMap"
          className="bottom-20 md:bottom-5"
          style={{
            position: "fixed",
            right: 20,
            zIndex: 9997,
            height: 34,
            padding: "0 12px",
            borderRadius: 999,
            border: "1px solid #2a3247",
            backgroundColor: "#1a1c24",
            color: "#adc6ff",
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "var(--font-inter)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "grab",
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
            touchAction: "none",
            userSelect: "none",
          }}
        >
          <Lightbulb size={13} />
          פידבק
        </button>
      )}
    </>
  );
}
