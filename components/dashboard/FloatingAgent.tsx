"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, X, Send, Loader2, History, Pencil, Trash2 } from "lucide-react";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface ChatSession {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  last_message_preview?: string;
  last_message_at?: string;
}

const ARIA_GREETING =
  "שלום! אני ARIA, הסוכן ה-AI שלך 🤖\nשאל אותי כל שאלה על העסק שלך — חיסכון בזמן, הזדמנויות, סדר עדיפויות.";

const QUICK_PROMPTS = [
  "מה ההזדמנות הכי טובה שלי?",
  "איפה אני מבזבז הכי הרבה זמן?",
  "מה אני צריך לעשות ראשון?",
];

function makeSessionTitle(text: string) {
  return text
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join(" ");
}

function formatSessionDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function sortSessions(items: ChatSession[]) {
  return [...items].sort((a, b) => {
    const aDate = new Date(a.last_message_at || a.updated_at).getTime();
    const bDate = new Date(b.last_message_at || b.updated_at).getTime();
    return bDate - aDate;
  });
}

export function FloatingAgent({ businessId }: { businessId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"sessions" | "chat">("sessions");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsLoadError, setSessionsLoadError] = useState(false);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [confirmDeleteSessionId, setConfirmDeleteSessionId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>(() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    try { const s = localStorage.getItem("aria-pos"); return s ? JSON.parse(s) : { x: 0, y: 0 }; } catch { return { x: 0, y: 0 }; }
  });
  const dragState = useRef<{ startX: number; startY: number; initDx: number; initDy: number } | null>(null);
  const didDrag = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsLoadError(false);
    try {
      const res = await fetch(`/api/chat-sessions?businessId=${encodeURIComponent(businessId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load sessions");
      setSessions(sortSessions(data.sessions || []));
    } catch {
      setSessionsLoadError(true);
    } finally {
      setSessionsLoading(false);
    }
  }, [businessId]);

  const loadSessionMessages = useCallback(async (session: ChatSession) => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/chat-sessions/${session.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load messages");
      setActiveSession({ ...session, ...data.session });
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const startDraftChat = useCallback(() => {
    setView("chat");
    setInput("");
    setActiveSession(null);
    setMessages([{ role: "assistant", content: ARIA_GREETING }]);
    setEditingSessionId(null);
    setEditingTitle("");
    setConfirmDeleteSessionId(null);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;
    startDraftChat();
    setHoveredSessionId(null);
    setDeletingSessionId(null);

    const init = async () => {
      await loadSessions();
      if (isCancelled) return;
    };

    void init();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, loadSessions, startDraftChat]);

  useEffect(() => {
    if (isOpen && view === "chat") {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen, view]);

  async function openSession(session: ChatSession) {
    setView("chat");
    setActiveSession(session);
    await loadSessionMessages(session);
  }

  async function updateSessionTitle(sessionId: string, title: string) {
    try {
      const res = await fetch(`/api/chat-sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update title");
      const updated = data.session;

      setActiveSession((prev) => (prev && prev.id === sessionId ? { ...prev, ...updated } : prev));
      setSessions((prev) =>
        sortSessions(prev.map((s) => (s.id === sessionId ? { ...s, ...updated } : s)))
      );
    } catch {
      // Keep UI responsive even if title update fails.
    }
  }

  async function saveEditedSessionTitle(session: ChatSession) {
    const nextTitle = editingTitle.trim();
    setEditingSessionId(null);
    setEditingTitle("");
    await updateSessionTitle(session.id, nextTitle);
  }

  async function deleteSession(sessionId: string) {
    setDeletingSessionId(sessionId);
    setConfirmDeleteSessionId(null);
    try {
      const res = await fetch(`/api/chat-sessions/${sessionId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete session");

      window.setTimeout(() => {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setDeletingSessionId(null);
        setHoveredSessionId((prev) => (prev === sessionId ? null : prev));
        if (activeSession?.id === sessionId) {
          setActiveSession(null);
          setMessages([]);
          setView("sessions");
        }
      }, 200);
    } catch {
      setDeletingSessionId(null);
    }
  }

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

  useEffect(() => {
    try { localStorage.setItem("aria-pos", JSON.stringify(dragOffset)); } catch {}
  }, [dragOffset]);

  function handleBtnPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, initDx: dragOffset.x, initDy: dragOffset.y };
    didDrag.current = false;
  }
  function handleBtnPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag.current = true;
    if (didDrag.current) setDragOffset({ x: dragState.current.initDx + dx, y: dragState.current.initDy + dy });
  }
  function handleBtnPointerUp() { dragState.current = null; }

  async function send() {
    const text = input.trim();
    if (!text || isLoading) return;

    let session = activeSession;
    const hadUserMessage = messages.some((m) => m.role === "user");
    const proposedTitle = !hadUserMessage ? makeSessionTitle(text) : "";
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, message: text, session_id: session?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");

      const assistantText = data.response || "מצטערת, נתקלתי בבעיה. נסה שוב.";
      const updatedAt = new Date().toISOString();
      const effectiveSession: ChatSession | null = data.session
        ? {
            ...data.session,
            last_message_preview: assistantText.slice(0, 60),
            last_message_at: data.message?.created_at || updatedAt,
          }
        : data.session_id
          ? {
              id: data.session_id,
              title: null,
              created_at: updatedAt,
              updated_at: updatedAt,
              last_message_preview: assistantText.slice(0, 60),
              last_message_at: data.message?.created_at || updatedAt,
            }
          : null;

      setMessages((prev) => [...prev, { role: "assistant", content: assistantText }]);
      if (effectiveSession) {
        session = effectiveSession;
        setActiveSession(effectiveSession);

        setSessions((prev) => {
          const exists = prev.some((s) => s.id === effectiveSession.id);
          if (!exists) {
            return sortSessions([effectiveSession, ...prev]);
          }
          return sortSessions(
            prev.map((s) =>
              s.id === effectiveSession.id
                ? {
                    ...s,
                    ...effectiveSession,
                    updated_at: updatedAt,
                    last_message_at: data.message?.created_at || updatedAt,
                    last_message_preview: assistantText.slice(0, 60),
                  }
                : s
            )
          );
        });

        if (!hadUserMessage && !effectiveSession.title && proposedTitle) {
          void updateSessionTitle(effectiveSession.id, proposedTitle);
        }
      }
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
          className="bottom-[148px] md:bottom-[88px]"
          style={{
            position: "fixed",
            left: 24,
            zIndex: 9998,
            width: 340,
            height: 470,
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
            backgroundColor: "#13151d",
            border: "1px solid #282a30",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(77,142,255,0.12)",
            animation: "agent-slide-up 0.32s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {view === "sessions" ? (
            <>
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
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#e2e2eb",
                    fontFamily: "var(--font-manrope)",
                  }}
                >
                  ARIA — השיחות שלך
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

              <div style={{ padding: "12px 14px 8px", flexShrink: 0 }}>
                <button
                  onClick={() => {
                    startDraftChat();
                  }}
                  style={{
                    width: "100%",
                    height: 36,
                    borderRadius: 10,
                    border: "1px solid rgba(77,142,255,0.25)",
                    background: "rgba(77,142,255,0.12)",
                    color: "#adc6ff",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  שיחה חדשה +
                </button>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "0 14px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {sessionsLoading ? (
                  <div style={{ color: "#8c909f", fontSize: 12, paddingTop: 10 }}>טוען שיחות...</div>
                ) : sessionsLoadError ? (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "10px 12px",
                      borderRadius: 10,
                      backgroundColor: "rgba(248,113,113,0.08)",
                      border: "1px solid rgba(248,113,113,0.25)",
                    }}
                  >
                    <p style={{ color: "#f87171", fontSize: 12, fontFamily: "var(--font-inter)", marginBottom: 8 }}>
                      שגיאה בטעינת השיחות
                    </p>
                    <button
                      type="button"
                      onClick={() => void loadSessions()}
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "var(--font-inter)",
                        color: "#f87171",
                        background: "transparent",
                        border: "1px solid rgba(248,113,113,0.4)",
                        borderRadius: 8,
                        padding: "6px 12px",
                        cursor: "pointer",
                      }}
                    >
                      נסה שוב
                    </button>
                  </div>
                ) : sessions.length === 0 ? (
                  <div style={{ color: "#8c909f", fontSize: 12, paddingTop: 10 }}>
                    עדיין אין שיחות — התחל שיחה חדשה
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => {
                        if (editingSessionId === session.id || confirmDeleteSessionId === session.id) {
                          return;
                        }
                        void openSession(session);
                      }}
                      onMouseEnter={() => setHoveredSessionId(session.id)}
                      onMouseLeave={() => setHoveredSessionId((prev) => (prev === session.id ? null : prev))}
                      style={{
                        width: "100%",
                        textAlign: "right",
                        backgroundColor: "#1a1c24",
                        border: "1px solid #282a30",
                        borderRadius: 12,
                        padding: "10px 11px",
                        cursor: "pointer",
                        color: "#e2e2eb",
                        fontFamily: "var(--font-inter)",
                        transition: "opacity 0.2s ease, transform 0.2s ease",
                        opacity: deletingSessionId === session.id ? 0 : 1,
                        transform: deletingSessionId === session.id ? "translateX(8px)" : "translateX(0)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        {editingSessionId === session.id ? (
                          <input
                            autoFocus
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onBlur={() => {
                              void saveEditedSessionTitle(session);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
                              }
                              if (e.key === "Escape") {
                                setEditingSessionId(null);
                                setEditingTitle("");
                              }
                            }}
                            style={{
                              flex: 1,
                              minWidth: 0,
                              height: 24,
                              borderRadius: 6,
                              border: "1px solid rgba(77,142,255,0.35)",
                              backgroundColor: "#11141d",
                              color: "#e2e2eb",
                              fontSize: 12,
                              fontWeight: 700,
                              padding: "0 8px",
                              outline: "none",
                              direction: "rtl",
                              fontFamily: "var(--font-inter)",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              direction: "rtl",
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            {session.title || "שיחה חדשה"}
                          </span>
                        )}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            opacity:
                              hoveredSessionId === session.id ||
                              editingSessionId === session.id ||
                              confirmDeleteSessionId === session.id
                                ? 1
                                : 0,
                            transition: "opacity 0.12s ease",
                            pointerEvents:
                              hoveredSessionId === session.id ||
                              editingSessionId === session.id ||
                              confirmDeleteSessionId === session.id
                                ? "auto"
                                : "none",
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSessionId(session.id);
                              setEditingTitle(session.title || "");
                              setConfirmDeleteSessionId(null);
                            }}
                            title="Rename"
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 6,
                              border: "1px solid #2b2f3c",
                              background: "#171a24",
                              color: "#8c909f",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Pencil size={11} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteSessionId((prev) =>
                                prev === session.id ? null : session.id
                              );
                              setEditingSessionId(null);
                              setEditingTitle("");
                            }}
                            title="Delete"
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 6,
                              border: "1px solid #3a2328",
                              background: "#1f1518",
                              color: "#b47d87",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                        <span style={{ fontSize: 10, color: "#8c909f", flexShrink: 0 }}>
                          {formatSessionDate(session.last_message_at || session.updated_at)}
                        </span>
                      </div>
                      {confirmDeleteSessionId === session.id ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            marginBottom: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 8,
                            backgroundColor: "#18131a",
                            border: "1px solid #33222a",
                            borderRadius: 8,
                            padding: "6px 8px",
                          }}
                        >
                          <span style={{ fontSize: 11, color: "#d2a8b1" }}>למחוק את השיחה?</span>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void deleteSession(session.id);
                              }}
                              style={{
                                border: "1px solid #4f2832",
                                background: "#2b171d",
                                color: "#f2c9d1",
                                borderRadius: 6,
                                fontSize: 10,
                                padding: "2px 8px",
                                cursor: "pointer",
                              }}
                            >
                              כן
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteSessionId(null);
                              }}
                              style={{
                                border: "1px solid #2b2f3c",
                                background: "#171a24",
                                color: "#8c909f",
                                borderRadius: 6,
                                fontSize: 10,
                                padding: "2px 8px",
                                cursor: "pointer",
                              }}
                            >
                              לא
                            </button>
                          </div>
                        </div>
                      ) : null}
                      {session.last_message_preview ? (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#8c909f",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            direction: "rtl",
                          }}
                        >
                          {session.last_message_preview}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
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
                <button
                  onClick={() => setView("sessions")}
                  title="History"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#8c909f",
                    padding: "2px 6px",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11,
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  <History size={14} />
                  <span>History</span>
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "#e2e2eb",
                      fontFamily: "var(--font-manrope)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      direction: "rtl",
                      textAlign: "right",
                    }}
                  >
                    {activeSession?.title || "שיחה חדשה"}
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
                {messagesLoading ? (
                  <div style={{ color: "#8c909f", fontSize: 12 }}>טוען היסטוריה...</div>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={msg.id || `${msg.role}-${i}`}
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
                            msg.role === "user" ? "#1e1f26" : "rgba(77,142,255,0.10)",
                          border: `1px solid ${
                            msg.role === "user" ? "#282a30" : "rgba(77,142,255,0.20)"
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
                  ))
                )}

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
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(77,142,255,0.4)")}
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
                    cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
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
            </>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        id="tour-aria-button"
        onClick={() => { if (didDrag.current) return; setIsOpen((o) => !o); }}
        onPointerDown={handleBtnPointerDown}
        onPointerMove={handleBtnPointerMove}
        onPointerUp={handleBtnPointerUp}
        title={isOpen ? "סגור" : "שוחח עם ARIA"}
        className="bottom-20 md:bottom-5"
        style={{
          position: "fixed",
          left: 20,
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
          cursor: "grab",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s",
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
          touchAction: "none",
          userSelect: "none",
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
