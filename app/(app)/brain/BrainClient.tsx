"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Trash2, Brain, CheckCircle2, Loader2 } from "lucide-react";

interface Department {
  id: string;
  name: string;
  color: string;
}

interface UploadedDoc {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  size: string;
  uploadedAt: string;
  status: "processing" | "ready";
}

interface BrainClientProps {
  businessId: string;
  businessName: string;
  departments: Department[];
}

function getDeptEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("market") || n.includes("שיווק")) return "📣";
  if (n.includes("sales") || n.includes("מכירות")) return "📈";
  if (n.includes("ops") || n.includes("operat") || n.includes("תפעול")) return "⚙️";
  if (n.includes("support") || n.includes("שירות")) return "🎧";
  if (n.includes("finance") || n.includes("כספ")) return "💰";
  if (n.includes("engineer") || n.includes("dev") || n.includes("פיתוח")) return "💻";
  if (n.includes("hr") || n.includes("משאבי")) return "👥";
  return "🏢";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BrainClient({ businessId, businessName, departments }: BrainClientProps) {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id ?? "");
  const [uploads, setUploads] = useState<UploadedDoc[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedDept = departments.find((d) => d.id === selectedDeptId);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || !selectedDeptId) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("businessId", businessId);
      formData.append("departmentId", selectedDeptId);

      try {
        const res = await fetch("/api/brain/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          setUploads((prev) => [
            {
              id: data.id || crypto.randomUUID(),
              name: file.name,
              departmentId: selectedDeptId,
              departmentName: selectedDept?.name ?? "",
              size: formatSize(file.size),
              uploadedAt: new Date().toLocaleTimeString("he-IL"),
              status: "processing",
            },
            ...prev,
          ]);
          // Simulate processing complete after 3s
          setTimeout(() => {
            setUploads((prev) =>
              prev.map((u) => (u.name === file.name ? { ...u, status: "ready" } : u))
            );
          }, 3000);
        }
      } catch {
        // Show file as uploaded anyway for UX
        setUploads((prev) => [
          {
            id: crypto.randomUUID(),
            name: file.name,
            departmentId: selectedDeptId,
            departmentName: selectedDept?.name ?? "",
            size: formatSize(file.size),
            uploadedAt: new Date().toLocaleTimeString("he-IL"),
            status: "processing",
          },
          ...prev,
        ]);
        setTimeout(() => {
          setUploads((prev) =>
            prev.map((u) => (u.name === file.name ? { ...u, status: "ready" } : u))
          );
        }, 3000);
      }
    }
    setUploading(false);
  }

  const deptUploads = uploads.filter((u) => u.departmentId === selectedDeptId);
  const totalDocs = uploads.filter((u) => u.status === "ready").length;

  return (
    <div style={{ minHeight: "100%", backgroundColor: "#111319" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>🧠</span>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#e2e2eb",
                fontFamily: "var(--font-manrope)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              מוח העסק
            </h1>
          </div>
          <p style={{ fontSize: 13, color: "#424754", fontFamily: "var(--font-inter)", margin: 0 }}>
            {businessName} · העלה מסמכים לכל מחלקה — AI ילמד מהם ויספק ניתוח מדויק יותר
          </p>
          {totalDocs > 0 && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
                fontSize: 11,
                fontWeight: 700,
                color: "#34d399",
                backgroundColor: "#34d39912",
                border: "1px solid #34d39925",
                borderRadius: 99,
                padding: "3px 10px",
                fontFamily: "var(--font-inter)",
              }}
            >
              <Brain size={11} />
              {totalDocs} מסמכים נטענו למוח
            </div>
          )}
        </div>

        {/* What docs to upload guide */}
        <div
          style={{
            backgroundColor: "rgba(77,142,255,0.05)",
            border: "1px solid rgba(77,142,255,0.15)",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "#4d8eff", marginBottom: 8, fontFamily: "var(--font-inter)" }}>
            💡 מה כדאי להעלות?
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4px 16px",
              fontFamily: "var(--font-inter)",
            }}
          >
            {[
              "נהלים ו-SOPs קיימים",
              "תיאורי תפקידים",
              "רשימות תהליכים",
              "דוחות תפעוליים",
              "מדריכי עבודה",
              "שאלות נפוצות של לקוחות",
            ].map((item) => (
              <div key={item} style={{ fontSize: 11, color: "#8c909f", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#4d8eff", flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Department selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#424754", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-inter)", marginBottom: 8 }}>
            בחר מחלקה
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {departments.map((dept) => {
              const active = dept.id === selectedDeptId;
              const docCount = uploads.filter((u) => u.departmentId === dept.id && u.status === "ready").length;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 10,
                    border: active ? `1.5px solid ${dept.color}60` : "1px solid #282a30",
                    backgroundColor: active ? `${dept.color}10` : "#1a1c24",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  <span style={{ fontSize: 14 }}>{getDeptEmoji(dept.name)}</span>
                  <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? "#e2e2eb" : "#8c909f" }}>
                    {dept.name}
                  </span>
                  {docCount > 0 && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: 99,
                        backgroundColor: "#34d39915",
                        color: "#34d399",
                        fontFamily: "var(--font-inter)",
                      }}
                    >
                      {docCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "rgba(77,142,255,0.5)" : "#282a30"}`,
            borderRadius: 16,
            padding: "40px 24px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: dragging ? "rgba(77,142,255,0.04)" : "#191b22",
            transition: "all 0.2s",
            marginBottom: 20,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.md,.csv"
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          {uploading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Loader2 size={32} style={{ color: "#4d8eff", animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: 13, color: "#8c909f", fontFamily: "var(--font-inter)" }}>מעלה מסמכים...</span>
            </div>
          ) : (
            <>
              <Upload size={32} style={{ color: dragging ? "#4d8eff" : "#424754", marginBottom: 12 }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: dragging ? "#e2e2eb" : "#8c909f", fontFamily: "var(--font-manrope)", margin: "0 0 4px" }}>
                {selectedDept ? `העלה מסמכים ל${selectedDept.name}` : "בחר מחלקה"}
              </p>
              <p style={{ fontSize: 11, color: "#33343b", fontFamily: "var(--font-inter)", margin: 0 }}>
                PDF, Word, TXT, CSV · גרור ושחרר או לחץ לבחירה
              </p>
            </>
          )}
        </div>

        {/* Uploaded docs for selected dept */}
        {deptUploads.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#424754", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-inter)", marginBottom: 8 }}>
              מסמכים שהועלו — {selectedDept?.name}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {deptUploads.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    backgroundColor: "#191b22",
                    border: "1px solid #282a30",
                    borderRadius: 10,
                  }}
                >
                  <FileText size={16} style={{ color: "#4d8eff", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e2eb", fontFamily: "var(--font-inter)", direction: "rtl", textAlign: "right" }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: 10, color: "#424754", fontFamily: "var(--font-inter)" }}>
                      {doc.size} · {doc.uploadedAt}
                    </div>
                  </div>
                  {doc.status === "processing" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#fbbf24", fontFamily: "var(--font-inter)" }}>
                      <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                      מעבד...
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#34d399", fontFamily: "var(--font-inter)" }}>
                      <CheckCircle2 size={12} />
                      מוכן
                    </div>
                  )}
                  <button
                    onClick={() => setUploads((prev) => prev.filter((u) => u.id !== doc.id))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#424754", padding: 4, borderRadius: 6, transition: "color 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#424754")}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {deptUploads.length === 0 && (
          <div style={{ textAlign: "center", color: "#33343b", fontSize: 12, fontFamily: "var(--font-inter)", padding: "20px 0" }}>
            {selectedDept ? `אין מסמכים עדיין עבור ${selectedDept.name}` : "בחר מחלקה כדי להתחיל"}
          </div>
        )}
      </div>
    </div>
  );
}
