"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Star,
  Flame,
  Trophy,
  ArrowLeft,
  Clock,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  business_id: string;
  title: string;
  description?: string | null;
  status: "todo" | "in_progress" | "done";
  estimated_hours?: number | null;
  department_name?: string | null;
  department_color?: string | null;
  opportunity_id?: string | null;
  parent_task_id?: string | null;
  completed_at?: string | null;
  created_at: string;
}

interface XpAnimation {
  id: number;
  x: number;
  y: number;
}

// ── XP constants ──────────────────────────────────────────────────────────────

const XP_PER_TASK = 50;
const XP_THRESHOLDS = [0, 100, 250, 500, 1000];

function getLevel(xp: number): number {
  let level = 1;
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
}

function xpToNextLevel(xp: number): { current: number; next: number; pct: number } {
  const level = getLevel(xp);
  const current = XP_THRESHOLDS[level - 1] ?? 0;
  const next = XP_THRESHOLDS[level] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  const pct = next === current ? 100 : Math.min(100, ((xp - current) / (next - current)) * 100);
  return { current, next, pct };
}

// ── Department colour map ──────────────────────────────────────────────────────

const DEPT_COLORS: Record<string, { bg: string; text: string; border: string }> = {};
const COLOR_PALETTE = [
  { bg: "#4d8eff15", text: "#4d8eff", border: "#4d8eff30" },
  { bg: "#34d39915", text: "#34d399", border: "#34d39930" },
  { bg: "#fbbf2415", text: "#fbbf24", border: "#fbbf2430" },
  { bg: "#c084fc15", text: "#c084fc", border: "#c084fc30" },
  { bg: "#f8717115", text: "#f87171", border: "#f8717130" },
  { bg: "#60a5fa15", text: "#60a5fa", border: "#60a5fa30" },
  { bg: "#fb923c15", text: "#fb923c", border: "#fb923c30" },
];
let colorIndex = 0;

function getDeptColor(name: string) {
  if (!name) return COLOR_PALETTE[0];
  if (!DEPT_COLORS[name]) {
    DEPT_COLORS[name] = COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];
    colorIndex++;
  }
  return DEPT_COLORS[name];
}

// ── Column definitions ────────────────────────────────────────────────────────

const COLUMNS = [
  { id: "todo", label: "לביצוע", color: "#fbbf24", bg: "#fbbf2408" },
  { id: "in_progress", label: "בתהליך", color: "#4d8eff", bg: "#4d8eff08" },
  { id: "done", label: "הושלם", color: "#34d399", bg: "#34d39908" },
] as const;

// ── Subtask Row ───────────────────────────────────────────────────────────────

function SubtaskRow({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: (id: string, done: boolean) => void;
}) {
  const isDone = task.status === "done";
  return (
    <div
      className="flex items-center gap-2 py-1.5 px-2 rounded-lg"
      style={{
        backgroundColor: isDone ? "#34d39908" : "#1a1c24",
        border: `1px solid ${isDone ? "#34d39930" : "#282a30"}`,
      }}
    >
      <button
        onClick={() => onToggle(task.id, !isDone)}
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: `1.5px solid ${isDone ? "#34d399" : "#424754"}`,
          backgroundColor: isDone ? "#34d399" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        {isDone && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span
        style={{
          fontSize: 12,
          color: isDone ? "#424754" : "#c2c6d6",
          textDecoration: isDone ? "line-through" : "none",
          fontFamily: "var(--font-inter)",
          flex: 1,
        }}
      >
        {task.title}
      </span>
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  subtasks,
  onStatusChange,
  onSubtaskToggle,
  onAddSubtask,
  isDragging,
  xpButtonRef,
}: {
  task: Task;
  subtasks: Task[];
  onStatusChange: (id: string, newStatus: Task["status"], ref?: React.RefObject<HTMLButtonElement | null>) => void;
  onSubtaskToggle: (id: string, done: boolean) => void;
  onAddSubtask: (parentId: string, title: string) => Promise<void>;
  isDragging: boolean;
  xpButtonRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDone = task.status === "done";
  const isInProgress = task.status === "in_progress";
  const deptColor = task.department_color
    ? {
        bg: `${task.department_color}15`,
        text: task.department_color,
        border: `${task.department_color}30`,
      }
    : getDeptColor(task.department_name ?? "");
  const completedSubtasks = subtasks.filter((s) => s.status === "done").length;

  useEffect(() => {
    if (addingSubtask && inputRef.current) inputRef.current.focus();
  }, [addingSubtask]);

  async function handleAddSubtask() {
    const title = subtaskInput.trim();
    if (!title) return;
    setSubmitting(true);
    try {
      await onAddSubtask(task.id, title);
      setSubtaskInput("");
      setAddingSubtask(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: isDone ? "#13151d" : "#191b22",
        border: `1px solid ${isDone ? "#34d39920" : isDragging ? "#4d8eff60" : "#282a30"}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: isDragging
          ? "0 20px 50px rgba(0,0,0,0.7), 0 0 20px rgba(77,142,255,0.2)"
          : "0 2px 8px rgba(0,0,0,0.3)",
        transition: "border-color 0.15s, box-shadow 0.15s, opacity 0.15s",
        opacity: isDone ? 0.7 : 1,
        userSelect: "none",
      }}
    >
      {/* Top accent bar */}
      {!isDone && (
        <div
          style={{
            height: 2,
            background: isInProgress
              ? "linear-gradient(90deg, transparent, #4d8eff, transparent)"
              : "linear-gradient(90deg, transparent, #fbbf24, transparent)",
          }}
        />
      )}
      {isDone && (
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #34d399, transparent)" }} />
      )}

      <div style={{ padding: "12px 14px" }}>
        {/* Header row */}
        <div className="flex items-start gap-2 mb-2">
          {isDone && (
            <CheckCircle2
              size={15}
              style={{ color: "#34d399", flexShrink: 0, marginTop: 1 }}
            />
          )}
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: isDone ? "#424754" : "#e2e2eb",
              fontFamily: "var(--font-manrope)",
              lineHeight: 1.4,
              flex: 1,
              textDecoration: isDone ? "line-through" : "none",
            }}
          >
            {task.title}
          </p>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {task.department_name && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 999,
                backgroundColor: deptColor.bg,
                color: deptColor.text,
                border: `1px solid ${deptColor.border}`,
                fontFamily: "var(--font-inter)",
                whiteSpace: "nowrap",
              }}
            >
              {task.department_name}
            </span>
          )}
          {task.estimated_hours && (
            <span
              className="flex items-center gap-1"
              style={{ fontSize: 10, color: "#424754", fontFamily: "var(--font-inter)" }}
            >
              <Clock size={9} />~{task.estimated_hours} שעות
            </span>
          )}
          {subtasks.length > 0 && (
            <span style={{ fontSize: 10, color: "#424754", fontFamily: "var(--font-inter)" }}>
              {completedSubtasks}/{subtasks.length} תת-משימות
            </span>
          )}
        </div>

        {/* Action buttons row */}
        <div className="flex items-center justify-between gap-2">
          {/* Status button */}
          {!isDone && (
            <button
              ref={btnRef}
              onClick={() =>
                onStatusChange(
                  task.id,
                  isInProgress ? "done" : "in_progress",
                  isInProgress ? btnRef : undefined
                )
              }
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "5px 12px",
                borderRadius: 7,
                border: `1px solid ${isInProgress ? "#34d39940" : "#fbbf2440"}`,
                backgroundColor: isInProgress ? "#34d39910" : "#fbbf2410",
                color: isInProgress ? "#34d399" : "#fbbf24",
                cursor: "pointer",
                fontFamily: "var(--font-inter)",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isInProgress ? "#34d39920" : "#fbbf2420";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isInProgress ? "#34d39910" : "#fbbf2410";
              }}
            >
              {isInProgress ? "✓ סיים" : "▶ התחל"}
            </button>
          )}

          {isDone && (
            <span
              style={{
                fontSize: 11,
                color: "#34d399",
                fontWeight: 700,
                fontFamily: "var(--font-inter)",
              }}
            >
              ✓ הושלם
            </span>
          )}

          {/* Open agent button */}
          <button
            onClick={() => {
              const msg = `בוא נתחיל לעבוד על המשימה: "${task.title}"${task.department_name ? ` (מחלקת ${task.department_name})` : ""}${task.description ? `\n\n${task.description}` : ""}`;
              window.dispatchEvent(new CustomEvent("bm-open-agent", { detail: { message: msg } }));
            }}
            title="פתח סוכן AI להתחלת המשימה"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10,
              color: "#424754",
              background: "transparent",
              border: "1px solid #282a30",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: 6,
              fontFamily: "var(--font-inter)",
              transition: "all 0.12s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(77,142,255,0.35)";
              e.currentTarget.style.color = "#4d8eff";
              e.currentTarget.style.backgroundColor = "rgba(77,142,255,0.08)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#282a30";
              e.currentTarget.style.color = "#424754";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Bot size={11} />
            סוכן
          </button>

          {/* Expand subtasks */}
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10,
              color: "#424754",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 6px",
              borderRadius: 6,
              fontFamily: "var(--font-inter)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#8c909f")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#424754")}
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {subtasks.length > 0 ? `תתי-משימות (${subtasks.length})` : "תתי-משימות"}
          </button>
        </div>
      </div>

      {/* Expanded subtasks */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid #1e2030",
            padding: "10px 14px 12px",
            backgroundColor: "#111319",
          }}
        >
          {subtasks.length > 0 && (
            <div className="flex flex-col gap-1.5 mb-2">
              {subtasks.map((sub) => (
                <SubtaskRow key={sub.id} task={sub} onToggle={onSubtaskToggle} />
              ))}
            </div>
          )}

          {addingSubtask ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSubtask();
                  if (e.key === "Escape") setAddingSubtask(false);
                }}
                placeholder="כותרת תת-משימה..."
                style={{
                  flex: 1,
                  fontSize: 12,
                  padding: "5px 10px",
                  borderRadius: 7,
                  border: "1px solid #4d8eff40",
                  backgroundColor: "#1a1c24",
                  color: "#e2e2eb",
                  fontFamily: "var(--font-inter)",
                  outline: "none",
                  direction: "rtl",
                }}
              />
              <button
                onClick={handleAddSubtask}
                disabled={submitting}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "5px 10px",
                  borderRadius: 7,
                  border: "1px solid #4d8eff40",
                  backgroundColor: "#4d8eff15",
                  color: "#4d8eff",
                  cursor: "pointer",
                  fontFamily: "var(--font-inter)",
                }}
              >
                {submitting ? "..." : "שמור"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingSubtask(true)}
              className="flex items-center gap-1.5"
              style={{
                fontSize: 11,
                color: "#424754",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "2px 0",
                fontFamily: "var(--font-inter)",
                marginTop: subtasks.length > 0 ? 4 : 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#8c909f")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#424754")}
            >
              <Plus size={11} />
              הוסף תת-משימה
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Column component ──────────────────────────────────────────────────────────

function KanbanColumn({
  col,
  tasks,
  allTasks,
  onStatusChange,
  onSubtaskToggle,
  onAddSubtask,
}: {
  col: (typeof COLUMNS)[number];
  tasks: Task[];
  allTasks: Task[];
  onStatusChange: (id: string, newStatus: Task["status"], ref?: React.RefObject<HTMLButtonElement | null>) => void;
  onSubtaskToggle: (id: string, done: boolean) => void;
  onAddSubtask: (parentId: string, title: string) => Promise<void>;
}) {
  return (
    <div
      className="flex flex-col"
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: col.bg,
        borderRadius: 16,
        border: `1px solid ${col.color}20`,
      }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${col.color}20` }}
      >
        <div className="flex items-center gap-2">
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: col.color }} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: col.color,
              fontFamily: "var(--font-manrope)",
            }}
          >
            {col.label}
          </span>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 999,
            backgroundColor: `${col.color}15`,
            color: col.color,
            fontFamily: "var(--font-inter)",
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={col.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              flex: 1,
              padding: "10px 10px 10px",
              minHeight: 100,
              backgroundColor: snapshot.isDraggingOver ? `${col.color}08` : "transparent",
              transition: "background-color 0.15s",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 16px",
                  color: "#33343b",
                  fontSize: 12,
                  fontStyle: "italic",
                  fontFamily: "var(--font-inter)",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>
                  {col.id === "todo" ? "📋" : col.id === "in_progress" ? "⚡" : "🏆"}
                </div>
                אין משימות עדיין
              </div>
            )}

            {tasks.map((task, index) => {
              const subtasks = allTasks.filter((t) => t.parent_task_id === task.id);
              return (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      data-task-id={task.id}
                    >
                      <TaskCard
                        task={task}
                        subtasks={subtasks}
                        onStatusChange={onStatusChange}
                        onSubtaskToggle={onSubtaskToggle}
                        onAddSubtask={onAddSubtask}
                        isDragging={snapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

// ── XP Floating Animation ─────────────────────────────────────────────────────

function XpFloater({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        zIndex: 9999,
        pointerEvents: "none",
        animation: "xp-float 1.2s cubic-bezier(0.16,1,0.3,1) forwards",
        fontFamily: "var(--font-manrope)",
        fontSize: 16,
        fontWeight: 900,
        color: "#34d399",
        textShadow: "0 0 12px #34d39980",
        whiteSpace: "nowrap",
      }}
    >
      +{XP_PER_TASK} XP ✨
    </div>
  );
}

// ── Main TasksClient ──────────────────────────────────────────────────────────

interface TasksClientProps {
  businessId: string;
  initialXp: number;
  initialLevel: number;
}

export function TasksClient({ businessId, initialXp, initialLevel }: TasksClientProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [xp, setXp] = useState(initialXp);
  const [level, setLevel] = useState(initialLevel);
  const [xpAnimations, setXpAnimations] = useState<XpAnimation[]>([]);
  const animIdRef = useRef(0);
  const streak = 3; // placeholder — could be fetched from DB

  // ── Fetch tasks ──────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks?businessId=${businessId}`);
      if (!res.ok) return;
      const data: Task[] = await res.json();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ── Update task status ────────────────────────────────────────────────────
  const updateStatus = useCallback(
    async (
      id: string,
      newStatus: Task["status"],
      buttonRef?: React.RefObject<HTMLButtonElement | null>
    ) => {
      const prev = tasks.find((t) => t.id === id);
      if (!prev || prev.status === newStatus) return;

      // Optimistic update
      setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));

      // XP animation when completing
      if (newStatus === "done" && prev.status !== "done") {
        const rect = buttonRef?.current?.getBoundingClientRect();
        const x = rect ? rect.left + rect.width / 2 - 40 : window.innerWidth / 2 - 40;
        const y = rect ? rect.top - 10 : window.innerHeight / 2;

        const animId = ++animIdRef.current;
        setXpAnimations((prev) => [...prev, { id: animId, x, y }]);

        const newXp = xp + XP_PER_TASK;
        const newLevel = getLevel(newXp);
        setXp(newXp);
        if (newLevel > level) {
          setLevel(newLevel);
          toast.success(`עלית רמה! 🎉 רמה ${newLevel}`, {
            duration: 4000,
            style: {
              background: "#1a1c24",
              border: "1px solid #fbbf2430",
              color: "#fbbf24",
              fontFamily: "var(--font-manrope)",
            },
          });
        }
        
        // Auto-scroll / highlight related tasks
        const oppId = prev.opportunity_id;
        if (oppId) {
          const remainingTasks = tasks.filter(t => t.opportunity_id === oppId && t.status !== "done" && t.id !== id);
          if (remainingTasks.length > 0) {
            toast.custom((tId) => (
              <div 
                style={{
                  background: "#1a1c24",
                  border: "1px solid #4d8eff30",
                  color: "#e2e2eb",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontFamily: "var(--font-inter)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  direction: "rtl"
                }}
              >
                <span style={{ fontSize: 13 }}>יש עוד {remainingTasks.length} משימות בהזדמנות זו &larr;</span>
                <button 
                  onClick={() => {
                    toast.dismiss(tId);
                    // scroll to the first remaining task
                    const el = document.querySelector(`[data-task-id="${remainingTasks[0].id}"]`);
                    if (el) {
                       el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                       
                       // Flash effect
                       const originalShadow = (el as HTMLElement).style.boxShadow;
                       (el as HTMLElement).style.transition = "box-shadow 0.3s ease";
                       (el as HTMLElement).style.boxShadow = "0 0 0 2px #4d8eff, 0 0 24px rgba(77,142,255,0.6)";
                       setTimeout(() => {
                         (el as HTMLElement).style.boxShadow = originalShadow;
                       }, 2000);
                    }
                  }}
                  style={{
                    background: "rgba(77,142,255,0.15)",
                    border: "1px solid rgba(77,142,255,0.3)",
                    color: "#4d8eff",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 700
                  }}
                >
                  הראה לי
                </button>
              </div>
            ), { duration: 5000 });
          }
        }
      }

      // API call
      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error("failed");
      } catch {
        // Rollback
        setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: prev.status } : t)));
        toast.error("שגיאה בעדכון המשימה");
      }
    },
    [tasks, xp, level]
  );

  // ── Drag & drop ──────────────────────────────────────────────────────────
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;

      const newStatus = destination.droppableId as Task["status"];
      updateStatus(draggableId, newStatus);
    },
    [updateStatus]
  );

  // ── Subtask toggle ────────────────────────────────────────────────────────
  const handleSubtaskToggle = useCallback(
    async (id: string, done: boolean) => {
      const newStatus: Task["status"] = done ? "done" : "todo";
      setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
      try {
        await fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch {
        toast.error("שגיאה בעדכון תת-המשימה");
      }
    },
    []
  );

  // ── Add subtask ───────────────────────────────────────────────────────────
  const handleAddSubtask = useCallback(
    async (parentId: string, title: string) => {
      const parent = tasks.find((t) => t.id === parentId);
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId,
            title,
            parent_task_id: parentId,
            department_name: parent?.department_name ?? null,
          }),
        });
        if (!res.ok) throw new Error("failed");
        const newTask: Task = await res.json();
        setTasks((ts) => [newTask, ...ts]);
      } catch {
        toast.error("שגיאה בהוספת תת-משימה");
      }
    },
    [businessId, tasks]
  );

  // ── Derived data ──────────────────────────────────────────────────────────
  const rootTasks = tasks.filter((t) => !t.parent_task_id);
  const columns = COLUMNS.map((col) => ({
    ...col,
    tasks: rootTasks.filter((t) => t.status === col.id),
  }));

  const { pct: xpPct, next: xpNext } = xpToNextLevel(xp);

  // ── Empty check (no tasks at all) ─────────────────────────────────────────
  const noTasks = rootTasks.length === 0 && !loading;

  return (
    <div
      dir="rtl"
      className="flex flex-col h-full"
      style={{ backgroundColor: "#111319", fontFamily: "var(--font-inter)" }}
    >
      {/* XP float animations */}
      {xpAnimations.map((anim) => (
        <XpFloater
          key={anim.id}
          x={anim.x}
          y={anim.y}
          onDone={() => setXpAnimations((prev) => prev.filter((a) => a.id !== anim.id))}
        />
      ))}

      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <header
        className="shrink-0 flex items-center justify-between px-6"
        style={{
          backgroundColor: "#191b22",
          borderBottom: "1px solid #282a30",
          height: 64,
          gap: 16,
        }}
      >
        {/* Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "#424754",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={14} />
          </Link>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "linear-gradient(135deg, #4d8eff, #c084fc)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ✓
          </div>
          <div>
            <h1
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "#e2e2eb",
                fontFamily: "var(--font-manrope)",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              משימות
            </h1>
            <p style={{ fontSize: 10, color: "#424754", marginTop: 2 }}>
              {rootTasks.length} משימות • {rootTasks.filter((t) => t.status === "done").length} הושלמו
            </p>
          </div>
        </div>

        {/* XP + Gamification bar */}
        <div className="flex items-center gap-5">
          {/* Streak */}
          <div className="flex items-center gap-1.5">
            <Flame size={14} style={{ color: "#fb923c" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fb923c", fontFamily: "var(--font-inter)" }}>
              {streak}
            </span>
            <span style={{ fontSize: 10, color: "#424754" }}>ימים רצופים</span>
          </div>

          <div style={{ width: 1, height: 20, backgroundColor: "#282a30" }} />

          {/* Level */}
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "linear-gradient(135deg, #fbbf24, #fb923c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trophy size={13} style={{ color: "white" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", lineHeight: 1 }}>
                רמה {level}
              </div>
              <div style={{ fontSize: 9, color: "#424754", marginTop: 1 }}>
                {xp} / {xpNext} XP
              </div>
            </div>
          </div>

          {/* XP progress bar */}
          <div
            style={{
              width: 120,
              height: 6,
              borderRadius: 999,
              backgroundColor: "#1e2030",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${xpPct}%`,
                borderRadius: 999,
                background: "linear-gradient(90deg, #4d8eff, #c084fc)",
                transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          </div>

          {/* Total XP badge */}
          <div
            className="flex items-center gap-1.5"
            style={{
              padding: "4px 12px",
              borderRadius: 8,
              backgroundColor: "#4d8eff10",
              border: "1px solid #4d8eff30",
            }}
          >
            <Star size={11} style={{ color: "#4d8eff" }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: "#4d8eff", fontFamily: "var(--font-manrope)" }}>
              {xp} XP
            </span>
          </div>
        </div>
      </header>

      {/* ── Kanban board ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto" style={{ padding: "20px 24px" }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: "3px solid #282a30",
                  borderTopColor: "#4d8eff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 12px",
                }}
              />
              <p style={{ fontSize: 12, color: "#424754" }}>טוען משימות...</p>
            </div>
          </div>
        ) : noTasks ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-xs">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: "#1a1c24",
                  border: "1px solid #282a30",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  margin: "0 auto 16px",
                }}
              >
                📋
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#8c909f", fontFamily: "var(--font-manrope)", marginBottom: 6 }}>
                אין משימות עדיין
              </p>
              <p style={{ fontSize: 12, color: "#33343b", marginBottom: 16 }}>
                צור משימות מהמפה ← לחץ על מחלקה ואז "צור משימה"
              </p>
              <Link
                href="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "8px 16px",
                  borderRadius: 8,
                  backgroundColor: "#4d8eff15",
                  border: "1px solid #4d8eff40",
                  color: "#4d8eff",
                  textDecoration: "none",
                }}
              >
                ← עבור למפת העסק
              </Link>
            </div>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full" style={{ alignItems: "flex-start" }}>
              {columns.map((col) => (
                <KanbanColumn
                  key={col.id}
                  col={col}
                  tasks={col.tasks}
                  allTasks={tasks}
                  onStatusChange={updateStatus}
                  onSubtaskToggle={handleSubtaskToggle}
                  onAddSubtask={handleAddSubtask}
                />
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Global keyframe styles */}
      <style>{`
        @keyframes xp-float {
          0%   { opacity: 0; transform: translateY(0) scale(0.8); }
          20%  { opacity: 1; transform: translateY(-8px) scale(1.1); }
          80%  { opacity: 1; transform: translateY(-36px) scale(1); }
          100% { opacity: 0; transform: translateY(-52px) scale(0.9); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
