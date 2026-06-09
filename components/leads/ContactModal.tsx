"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

export type ContactModalSource = "analysis_report" | "dashboard";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: ContactModalSource;
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function isValidIsraeliPhone(phone: string) {
  return /^05\d{8}$/.test(normalizePhone(phone));
}

export function ContactModal({ isOpen, onClose, source }: ContactModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const nameValid = name.trim().length > 0;
  const phoneValid = isValidIsraeliPhone(phone);
  const showNameError = nameTouched && !nameValid;
  const showPhoneError = phoneTouched && phone.length > 0 && !phoneValid;

  useEffect(() => {
    if (!isOpen) return;
    setError("");
  }, [isOpen]);

  if (!isOpen) return null;

  function handleClose() {
    if (loading) return;
    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameTouched(true);
    setPhoneTouched(true);
    setError("");

    if (!nameValid || !phoneValid) return;

    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: normalizePhone(phone),
          message: message.trim(),
          source,
        }),
      });

      if (!res.ok) {
        throw new Error("Lead request failed");
      }

      setSuccess(true);
      setName("");
      setPhone("");
      setMessage("");
      setNameTouched(false);
      setPhoneTouched(false);
    } catch (err) {
      console.error("[ContactModal] submit error:", err);
      setError("אירעה שגיאה, נסה שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[240] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      onClick={handleClose}
    >
      <div
        className="animate-in fade-in zoom-in-95 duration-200 relative w-full max-w-md rounded-2xl border border-white/12 bg-[#111322]/95 p-6 text-right text-white shadow-[0_32px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-indigo-300/60 to-transparent" />
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-50"
          aria-label="סגור"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {success ? (
          <div className="px-2 py-7 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-400/12 text-3xl">
              ✓
            </div>
            <h2 id="contact-modal-title" className="text-2xl font-black text-white">
              קיבלנו! נחזור אליך בהקדם 🎉
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/62">
              בינתיים תוכל להמשיך לחקור את המערכת
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-7 py-3 text-sm font-black text-black transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 focus:ring-offset-[#111322]"
            >
              סגור
            </button>
          </div>
        ) : (
          <>
            <div className="pl-8">
              <h2 id="contact-modal-title" className="text-2xl font-black text-white">
                נשמע שתרצה עזרה ביישום 🚀
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/62">
                השאר פרטים ונחזור אליך תוך יום עסקים
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-indigo-100/82" htmlFor="lead-name">
                  שם מלא
                </label>
                <input
                  id="lead-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError("");
                  }}
                  onBlur={() => setNameTouched(true)}
                  disabled={loading}
                  className="h-12 w-full rounded-lg border border-white/12 bg-white/[0.055] px-4 text-right text-base font-medium text-white outline-none transition placeholder:text-white/30 focus:border-indigo-300/70 focus:ring-2 focus:ring-indigo-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-invalid={showNameError}
                />
                {showNameError && (
                  <p className="mt-2 text-sm font-medium text-red-300">יש להזין שם מלא</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-indigo-100/82" htmlFor="lead-phone">
                  טלפון
                </label>
                <input
                  id="lead-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setError("");
                  }}
                  onBlur={() => setPhoneTouched(true)}
                  disabled={loading}
                  placeholder="0501234567"
                  className="h-12 w-full rounded-lg border border-white/12 bg-white/[0.055] px-4 text-right text-base font-medium text-white outline-none transition placeholder:text-white/30 focus:border-indigo-300/70 focus:ring-2 focus:ring-indigo-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-invalid={showPhoneError}
                />
                {showPhoneError && (
                  <p className="mt-2 text-sm font-medium text-red-300">יש להזין מספר נייד ישראלי תקין</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-indigo-100/82" htmlFor="lead-message">
                  במה תרצה עזרה?
                </label>
                <textarea
                  id="lead-message"
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    setError("");
                  }}
                  disabled={loading}
                  rows={4}
                  placeholder="לדוגמה: רוצה שתיישמו את האוטומציות מהניתוח שלי"
                  className="w-full resize-none rounded-lg border border-white/12 bg-white/[0.055] px-4 py-3 text-right text-base font-medium leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-indigo-300/70 focus:ring-2 focus:ring-indigo-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {error && <p className="text-sm font-medium text-red-300">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-l from-indigo-500 via-violet-500 to-amber-400 px-6 py-3 text-base font-black text-white shadow-[0_18px_48px_rgba(99,102,241,0.28)] transition hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 focus:ring-offset-[#111322] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                שלח פרטים ←
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
