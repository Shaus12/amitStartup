"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Gift = {
  id: string;
  giftType: string;
  content: string;
};

interface GiftModalProps {
  open: boolean;
  gift: Gift | null;
  businessName: string;
  onClose: () => void;
}

export function GiftModal({ open, gift, businessName, onClose }: GiftModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open || !gift) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gift.content);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleDownloadPdf = () => {
    const giftType = gift.giftType;
    const content = gift.content;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <title>${giftType} — ${businessName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            direction: rtl;
            text-align: right;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            color: #1a1a1a;
            line-height: 1.8;
          }
          h1 {
            font-size: 24px;
            color: #1a1a1a;
            border-bottom: 2px solid #534AB7;
            padding-bottom: 12px;
            margin-bottom: 8px;
          }
          .subtitle {
            color: #666;
            font-size: 14px;
            margin-bottom: 32px;
          }
          .content {
            font-size: 15px;
            white-space: pre-wrap;
          }
          .footer {
            margin-top: 48px;
            padding-top: 16px;
            border-top: 1px solid #eee;
            color: #999;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>${giftType}</h1>
        <div class="subtitle">הוכן במיוחד עבור ${businessName} · BizMap</div>
        <div class="content">${content.replace(/\n/g, "<br>")}</div>
        <div class="footer">נוצר על ידי BizMap · bizmapai.com</div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return createPortal(
    <div className="fixed inset-0 z-[10020] flex items-center justify-center p-4" dir="rtl">
      <button
        type="button"
        aria-label="סגירת חלון"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-2xl border"
        style={{
          borderColor: "#313440",
          background: "linear-gradient(180deg, #1b1e27 0%, #13151d 100%)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
        }}
      >
        <div className="px-6 py-5 border-b" style={{ borderColor: "#282a30" }}>
          <h2 className="text-xl font-black" style={{ color: "#eef1ff", fontFamily: "var(--font-manrope)" }}>
            המתנה שלך מוכנה 🎁
          </h2>
          <p className="mt-1 text-sm font-semibold" style={{ color: "#cbd2ff" }}>
            {gift.giftType}
          </p>
          <p className="mt-1 text-xs" style={{ color: "#8c909f", fontFamily: "var(--font-inter)" }}>
            הוכן במיוחד עבור {businessName}
          </p>
        </div>

        <div className="px-6 py-5 overflow-y-auto max-h-[52vh]">
          <div
            className="rounded-xl border px-4 py-3 text-sm leading-7 whitespace-pre-wrap"
            style={{
              borderColor: "#2c2f39",
              backgroundColor: "#10131a",
              color: "#e3e7f5",
              fontFamily: "var(--font-inter)",
            }}
          >
            {gift.content}
          </div>
        </div>

        <div className="px-6 py-4 border-t flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "#282a30" }}>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            style={{ backgroundColor: "#262a36", color: "#e7ebff", fontFamily: "var(--font-inter)" }}
          >
            {copied ? "הועתק! ✓" : "העתק טקסט"}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
              style={{ backgroundColor: "#4d8eff", color: "#081225", fontFamily: "var(--font-inter)" }}
            >
              הורד כ-PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium border"
              style={{ borderColor: "#323544", color: "#a9afc2", fontFamily: "var(--font-inter)" }}
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
