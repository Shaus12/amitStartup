"use client";

import { useMemo, useState } from "react";
import { Check, Clock, DollarSign, Loader2, Play, Star, X } from "lucide-react";
import { AiOpportunityItem } from "@/lib/types/opportunities";

type OpportunityStatus = "suggested" | "backlog" | "in_progress" | "done";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  suggested: { label: "ממתין", color: "#8c909f", bg: "#282a30", border: "#33343b" },
  backlog: { label: "ממתין", color: "#8c909f", bg: "#282a30", border: "#33343b" },
  in_progress: { label: "בביצוע", color: "#4d8eff", bg: "rgba(77,142,255,0.13)", border: "rgba(77,142,255,0.32)" },
  done: { label: "הושלם", color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)" },
};

const STATUS_OPTIONS: OpportunityStatus[] = ["suggested", "in_progress", "done"];

const C = {
  bg: "#111319",
  s1: "#191b22",
  s2: "#1e1f26",
  s3: "#282a30",
  s4: "#33343b",
  outline: "#424754",
  muted: "#8c909f",
  sub: "#c2c6d6",
  text: "#e2e2eb",
  blue: "#4d8eff",
  green: "#34d399",
  amber: "#fbbf24",
};

function robotColor(impactType: string): string {
  if (impactType === "time" || impactType === "time_savings") return "#60a5fa";
  if (impactType === "money" || impactType === "cost_savings") return "#34d399";
  if (impactType === "growth" || impactType === "revenue") return "#fbbf24";
  if (impactType === "quality") return "#c084fc";
  return C.blue;
}

function getStatus(opp: AiOpportunityItem): OpportunityStatus {
  return (opp.roadmapStatus || "suggested") as OpportunityStatus;
}

function statusConfig(opp: AiOpportunityItem) {
  return STATUS_CONFIG[getStatus(opp)] ?? STATUS_CONFIG.suggested;
}

function oneLine(text: string): string {
  if (text.length <= 60) return text;
  return `${text.slice(0, 57).trim()}...`;
}

function splitSentences(text: string): string {
  const parts = text.split(/(?<=[.!?؟])\s+/).filter(Boolean).slice(0, 3);
  return parts.join(" ") || text;
}

function extractTools(opp: AiOpportunityItem): string[] {
  const text = [opp.agentTools, opp.description, opp.title].filter(Boolean).join(" ");
  const knownTools = [
    "Zapier",
    "Make",
    "ChatGPT",
    "ChatGPT Plus",
    "Claude",
    "Airtable",
    "Notion",
    "Slack",
    "Gmail",
    "Google Sheets",
    "Google Calendar",
    "HubSpot",
    "Monday",
    "Asana",
    "Trello",
    "ClickUp",
    "Fireflies.ai",
    "Instantly.ai",
    "Calendly",
    "WhatsApp Business",
    "Typeform",
    "Jotform",
    "Mailchimp",
    "Canva",
  ];

  const fromKnown = knownTools.filter((tool) => text.toLowerCase().includes(tool.toLowerCase()));
  const fromAgentTools = (opp.agentTools ?? "").split(",").map((tool) => tool.trim()).filter(Boolean);
  return Array.from(new Set([...fromAgentTools, ...fromKnown])).slice(0, 6);
}

function implementationSteps(opp: AiOpportunityItem): string[] {
  const tools = extractTools(opp);
  const tool = tools[0] ?? "כלי ה-AI המתאים";
  return [
    "ממפים את התהליך הידני, נקודות הכאב ומדד הצלחה אחד ברור.",
    `מגדירים את ${tool} ומחברים אותו למידע או למערכת שבה הצוות כבר משתמש.`,
    "מריצים בדיקה על תרחיש אמיתי, מתקנים חריגות ומעבירים לשימוש שוטף.",
  ];
}

function defaultTasks(opp: AiOpportunityItem): string[] {
  const tool = extractTools(opp)[0] ?? "כלי ה-AI";
  return [
    `מיפוי התהליך: ${opp.title}`,
    `הגדרת ${tool} וחיבור למערכות הקיימות`,
    "בדיקה עם תרחיש אמיתי והטמעה בצוות",
  ];
}

function RobotSVG({ color, active }: { color: string; active: boolean }) {
  const glow = `${color}60`;
  return (
    <svg
      width="66"
      height="80"
      viewBox="0 0 90 110"
      style={{
        filter: active ? `drop-shadow(0 0 12px ${glow})` : "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
        transition: "filter 0.25s",
        animation: active ? "bv-float 3s ease-in-out infinite" : undefined,
      }}
    >
      <rect x="42" y="6" width="6" height="14" rx="3" fill={color} opacity={0.7} />
      <circle cx="45" cy="5" r="5" fill={color} />
      <circle cx="45" cy="5" r="3" fill="white" opacity={0.6} />
      <rect x="18" y="20" width="54" height="36" rx="10" fill={C.s1} stroke={color} strokeWidth={1.8} />
      <circle cx="33" cy="36" r="7" fill={color} opacity={0.25} />
      <circle cx="33" cy="36" r="5" fill={color} />
      <circle cx="35" cy="34" r="2" fill="white" opacity={0.7} />
      <circle cx="57" cy="36" r="7" fill={color} opacity={0.25} />
      <circle cx="57" cy="36" r="5" fill={color} />
      <circle cx="59" cy="34" r="2" fill="white" opacity={0.7} />
      <path d="M34 48 Q45 54 56 48" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.8} />
      <rect x="39" y="56" width="12" height="8" rx="3" fill="#1e2030" stroke={color} strokeWidth={1.2} opacity={0.7} />
      <rect x="12" y="64" width="66" height="38" rx="12" fill={C.s1} stroke={color} strokeWidth={1.8} />
      <rect x="28" y="72" width="34" height="22" rx="6" fill={color} opacity={0.08} stroke={color} strokeWidth={1} />
      <circle cx="45" cy="83" r="8" fill={color} opacity={0.15} />
      <circle cx="45" cy="83" r="5" fill={color} opacity={0.3} />
      <circle cx="45" cy="83" r="3" fill={color} />
      <rect x="1" y="68" width="10" height="26" rx="5" fill={C.s1} stroke={color} strokeWidth={1.5} />
      <circle cx="6" cy="96" r="4" fill={color} opacity={0.4} />
      <rect x="79" y="68" width="10" height="26" rx="5" fill={C.s1} stroke={color} strokeWidth={1.5} />
      <circle cx="84" cy="96" r="4" fill={color} opacity={0.4} />
      <rect x="22" y="103" width="16" height="7" rx="3.5" fill={C.s1} stroke={color} strokeWidth={1.4} />
      <rect x="52" y="103" width="16" height="7" rx="3.5" fill={C.s1} stroke={color} strokeWidth={1.4} />
    </svg>
  );
}

function StatusBadge({ opp }: { opp: AiOpportunityItem }) {
  const cfg = statusConfig(opp);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        minWidth: 70,
        fontSize: 11,
        fontWeight: 800,
        padding: "4px 10px",
        borderRadius: 99,
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontFamily: "var(--font-inter)",
      }}
    >
      {cfg.label}
    </span>
  );
}

function OpportunityCard({
  opp,
  index,
  selected,
  onSelect,
  onPin,
  onDismiss,
}: {
  opp: AiOpportunityItem;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onPin: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const color = robotColor(opp.impactType);
  const animDelay = index * 0.04;

  return (
    <button
      onClick={onSelect}
      className="group"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        minHeight: 285,
        width: "100%",
        padding: "18px 16px 16px",
        borderRadius: 16,
        border: selected ? `1.5px solid ${color}55` : "1.5px solid #282a30",
        backgroundColor: selected ? `${color}08` : C.s1,
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
        animation: `bv-fade-up 0.5s cubic-bezier(0.16,1,0.3,1) ${animDelay}s both`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}55`;
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = selected ? `${color}55` : C.s3;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {opp.isQuickWin && (
        <span
          aria-label="ניצחון מהיר"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 26,
            height: 26,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 99,
            backgroundColor: "rgba(251,191,36,0.15)",
            color: C.amber,
            border: "1px solid rgba(251,191,36,0.32)",
            fontSize: 13,
          }}
        >
          ⚡
        </span>
      )}

      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          display: "flex",
          gap: 4,
          opacity: 0,
          transition: "opacity 0.15s",
        }}
        className="group-hover:opacity-100"
      >
        <span
          role="button"
          tabIndex={0}
          aria-label={opp.pinned ? "הסר נעיצה" : "נעץ"}
          onClick={(e) => { e.stopPropagation(); onPin(opp.id); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onPin(opp.id);
            }
          }}
          style={{ color: opp.pinned ? C.amber : C.outline, padding: 4 }}
        >
          <Star className={opp.pinned ? "fill-current" : ""} size={15} />
        </span>
        <span
          role="button"
          tabIndex={0}
          aria-label="התעלם"
          onClick={(e) => { e.stopPropagation(); onDismiss(opp.id); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onDismiss(opp.id);
            }
          }}
          style={{ color: C.outline, padding: 4 }}
        >
          <X size={15} />
        </span>
      </div>

      <RobotSVG color={color} active={selected} />

      <h3
        style={{
          color: C.text,
          fontFamily: "var(--font-manrope)",
          fontSize: 18,
          fontWeight: 900,
          lineHeight: 1.25,
          minHeight: 46,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {opp.title}
      </h3>

      <p
        style={{
          color: C.muted,
          fontFamily: "var(--font-inter)",
          fontSize: 12,
          lineHeight: 1.45,
          minHeight: 34,
          direction: "rtl",
        }}
      >
        {oneLine(opp.notificationHook || opp.description || "")}
      </p>

      <StatusBadge opp={opp} />

      <div
        style={{
          marginTop: "auto",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          paddingTop: 12,
          borderTop: `1px solid ${C.s3}`,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#60a5fa", fontSize: 11, fontWeight: 800, fontFamily: "var(--font-inter)" }}>
          <Clock size={13} />
          {opp.estimatedHoursSaved ?? 0} שע׳/שבוע
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: C.green, fontSize: 11, fontWeight: 800, fontFamily: "var(--font-inter)" }}>
          <DollarSign size={13} />
          ₪{Math.round(opp.estimatedCostSaved ?? 0).toLocaleString()}/חודש
        </span>
      </div>
    </button>
  );
}

function DetailPanel({
  opp,
  isUpdating,
  onClose,
  onStatusChange,
}: {
  opp: AiOpportunityItem;
  isUpdating: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: OpportunityStatus) => void;
  onTaskToggle?: (taskId: string, isDone: boolean) => void;
}) {
  const tools = extractTools(opp);
  const steps = implementationSteps(opp);
  const tasks = opp.tasks && opp.tasks.length > 0
    ? opp.tasks
    : defaultTasks(opp).map((title) => ({ id: title, title, description: null, status: "todo" as const, estimated_hours: null, opportunity_id: opp.id }));
  const currentStatus = getStatus(opp);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backgroundColor: "rgba(7,8,12,0.72)",
        animation: "reveal-overlay-fade 0.2s ease-out both",
      }}
      onClick={onClose}
    >
      <aside
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 680,
          maxHeight: "85vh",
          backgroundColor: C.s1,
          border: `1px solid ${C.s3}`,
          borderRadius: 16,
          boxShadow: "0 24px 70px rgba(0,0,0,0.42)",
          padding: 24,
          overflowY: "auto",
          animation: "reveal-card-enter 0.24s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <button
          onClick={onClose}
          aria-label="סגור"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            color: C.muted,
            padding: 6,
            borderRadius: 8,
            backgroundColor: C.s2,
            border: `1px solid ${C.s3}`,
          }}
        >
          <X size={18} />
        </button>

        <div className="flex items-start justify-between gap-4 mb-5" style={{ paddingRight: 42 }}>
          <div>
            <h2 style={{ color: C.text, fontFamily: "var(--font-manrope)", fontSize: 26, fontWeight: 900, lineHeight: 1.18 }}>
              {opp.title}
            </h2>
            <div className="mt-3"><StatusBadge opp={opp} /></div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24 }}>
          {STATUS_OPTIONS.map((status) => {
            const cfg = STATUS_CONFIG[status];
            const active = currentStatus === status || (status === "suggested" && currentStatus === "backlog");
            return (
              <button
                key={status}
                onClick={() => onStatusChange(opp.id, status)}
                disabled={isUpdating || active}
                style={{
                  padding: "9px 8px",
                  borderRadius: 10,
                  backgroundColor: active ? cfg.bg : C.s2,
                  border: active ? `1px solid ${cfg.border}` : `1px solid ${C.s3}`,
                  color: active ? cfg.color : C.muted,
                  fontFamily: "var(--font-inter)",
                  fontSize: 12,
                  fontWeight: 800,
                  opacity: isUpdating && !active ? 0.55 : 1,
                }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        <DetailSection title="הבעיה שזה פותר">
          <p style={{ color: C.sub, fontFamily: "var(--font-inter)", fontSize: 13, lineHeight: 1.75 }}>
            {splitSentences(opp.description)}
          </p>
        </DetailSection>

        <DetailSection title="איך זה יעבוד">
          <ol style={{ display: "grid", gap: 10, padding: 0, margin: 0, listStyle: "none" }}>
            {steps.map((step, index) => (
              <li key={step} style={{ display: "flex", gap: 10, color: C.sub, fontSize: 13, lineHeight: 1.6, fontFamily: "var(--font-inter)" }}>
                <span style={{ width: 22, height: 22, borderRadius: 99, backgroundColor: "rgba(77,142,255,0.12)", color: C.blue, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </DetailSection>

        <DetailSection title="כלים שצריך">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(tools.length > 0 ? tools : ["ChatGPT", "Zapier או Make"]).map((tool) => (
              <span key={tool} style={{ padding: "7px 10px", borderRadius: 99, backgroundColor: C.s2, border: `1px solid ${C.s3}`, color: C.sub, fontSize: 12, fontWeight: 700, fontFamily: "var(--font-inter)" }}>
                {tool}
              </span>
            ))}
          </div>
        </DetailSection>

        <DetailSection title="משימות לביצוע">
          {(currentStatus === "suggested" || currentStatus === "backlog") ? (
            <>
              <div style={{ display: "grid", gap: 9 }}>
                {tasks.map((task) => (
                  <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, backgroundColor: C.s2, border: `1px solid ${C.s3}`, opacity: 0.6 }}>
                    <span style={{ width: 18, height: 18, borderRadius: 5, border: `1px solid ${C.outline}`, backgroundColor: "transparent", color: C.green, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}></span>
                    <span style={{ color: C.sub, fontFamily: "var(--font-inter)", fontSize: 13, lineHeight: 1.45 }}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, textAlign: "center", color: C.muted, fontSize: 13, fontFamily: "var(--font-inter)" }}>
                לחץ על ׳התחל יישום׳ כדי להוסיף למשימות שלך
              </div>
            </>
          ) : (
            <div style={{ display: "grid", gap: 9 }}>
              {(() => {
                const allTasks = opp.tasks || [];
                const mainTasks = allTasks.filter(t => t.parent_task_id === null || t.parent_task_id === undefined);
                const subtasks = allTasks.filter(t => t.parent_task_id !== null && t.parent_task_id !== undefined);

                const renderInteractiveTask = (task: any, isSubtask: boolean) => {
                  const done = task.status === "done";
                  return (
                    <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, backgroundColor: isSubtask ? "rgba(30,31,38,0.5)" : C.s2, border: `1px solid ${C.s3}`, cursor: "pointer", transition: "all 0.2s" }} onClick={() => onTaskToggle?.(task.id, !done)}>
                      <span style={{ width: 18, height: 18, borderRadius: 5, border: `1px solid ${done ? C.green : C.outline}`, backgroundColor: done ? "rgba(52,211,153,0.14)" : "transparent", color: C.green, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                        {done && <Check size={13} />}
                      </span>
                      <span style={{ color: done ? C.muted : C.sub, textDecoration: done ? "line-through" : "none", fontFamily: "var(--font-inter)", fontSize: 13, lineHeight: 1.45, transition: "all 0.2s" }}>
                        {task.title}
                      </span>
                    </div>
                  );
                };

                if (mainTasks.length === 0 && allTasks.length > 0) {
                  return allTasks.map(task => renderInteractiveTask(task, false));
                }

                if (allTasks.length === 0) {
                  return <div style={{ color: C.muted, fontSize: 13 }}>אין משימות.</div>;
                }

                return mainTasks.map(main => (
                  <div key={main.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {renderInteractiveTask(main, false)}
                    {subtasks.filter(sub => sub.parent_task_id === main.id).map(sub => (
                      <div key={sub.id} style={{ paddingRight: 24 }}>
                        {renderInteractiveTask(sub, true)}
                      </div>
                    ))}
                  </div>
                ));
              })()}
            </div>
          )}

          {currentStatus === "in_progress" && (opp.tasks || []).length > 0 && (opp.tasks || []).every(t => t.status === "done") && (
            <div style={{ marginTop: 24, padding: 16, borderRadius: 12, backgroundColor: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", textAlign: "center", animation: "bv-fade-up 0.3s ease-out both" }}>
              <div style={{ color: C.green, fontFamily: "var(--font-manrope)", fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
                כל המשימות הושלמו — סמן הזדמנות כהושלמה?
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button
                  onClick={() => onStatusChange(opp.id, "done")}
                  disabled={isUpdating}
                  style={{ padding: "8px 16px", borderRadius: 8, backgroundColor: C.green, color: "#000", fontSize: 13, fontWeight: 800, fontFamily: "var(--font-inter)" }}
                >
                  {isUpdating ? <Loader2 size={15} className="animate-spin inline mr-1" /> : null}
                  כן, הושלם
                </button>
              </div>
            </div>
          )}
        </DetailSection>

        {(currentStatus === "suggested" || currentStatus === "backlog") && (
          <button
            onClick={() => onStatusChange(opp.id, "in_progress")}
            disabled={isUpdating}
            style={{
              width: "100%",
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "13px 16px",
              borderRadius: 12,
              backgroundColor: "rgba(77,142,255,0.16)",
              border: "1px solid rgba(77,142,255,0.36)",
              color: C.blue,
              fontFamily: "var(--font-inter)",
              fontSize: 14,
              fontWeight: 900,
            }}
          >
            {isUpdating ? <Loader2 size={17} className="animate-spin" /> : <Play size={17} />}
            התחל יישום
          </button>
        )}
      </aside>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: "18px 0", borderTop: `1px solid ${C.s3}` }}>
      <h3 style={{ color: C.text, fontFamily: "var(--font-manrope)", fontSize: 15, fontWeight: 900, marginBottom: 10 }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

interface RobotGalleryProps {
  opportunities: AiOpportunityItem[];
  onPin: (id: string) => void;
  onDismiss: (id: string) => void;
  onStatusChange: (id: string, status: OpportunityStatus) => void;
  updatingStatusId?: string | null;
  onTaskToggle?: (taskId: string, isDone: boolean) => void;
}

export function RobotGallery({ opportunities, onPin, onDismiss, onStatusChange, updatingStatusId, onTaskToggle }: RobotGalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const ordered = useMemo(() => {
    const pinned = opportunities.filter((o) => o.pinned);
    const unpinned = opportunities.filter((o) => !o.pinned);
    return [...pinned, ...unpinned];
  }, [opportunities]);
  const selected = ordered.find((opp) => opp.id === selectedId) ?? null;

  if (opportunities.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: C.s4,
          fontFamily: "var(--font-inter)",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
        <div style={{ fontSize: 14, color: C.outline, marginBottom: 6, fontFamily: "var(--font-manrope)", fontWeight: 700 }}>
          אין הזדמנויות עדיין
        </div>
        <div style={{ fontSize: 12 }}>הפעל ניתוח AI</div>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {ordered.map((opp, index) => (
          <OpportunityCard
            key={opp.id}
            opp={opp}
            index={index}
            selected={selectedId === opp.id}
            onSelect={() => setSelectedId(opp.id)}
            onPin={onPin}
            onDismiss={onDismiss}
          />
        ))}
      </div>

      {selected && (
        <DetailPanel
          opp={selected}
          isUpdating={updatingStatusId === selected.id}
          onClose={() => setSelectedId(null)}
          onStatusChange={onStatusChange}
          onTaskToggle={onTaskToggle}
        />
      )}
    </>
  );
}
