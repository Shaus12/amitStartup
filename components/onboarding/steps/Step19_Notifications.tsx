"use client";

import { Bell, BellOff } from "lucide-react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";

interface Props { onNext: () => void; onBack: () => void; }

const C = {
  s2: "#1e1f26", s3: "#282a30", blue: "#4d8eff", glow: "#adc6ff",
  muted: "#8c909f", sub: "#c2c6d6", text: "#e2e2eb", green: "#34d399",
};

export function Step19_Notifications({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();

  async function handleEnable() {
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        updateAnswers({ notificationsEnabled: permission === "granted" });
      } catch {
        // silently ignore
      }
    }
    onNext();
  }

  function handleSkip() {
    updateAnswers({ notificationsEnabled: false });
    onNext();
  }

  return (
    <StepCard
      title="קבל תזכורות חכמות"
      subtitle="אנחנו נשלח לך עדכון כשנמצאה הזדמנות חיסכון חדשה, או כשאחת מהמשימות שלך מחכה לך."
      onNext={handleEnable}
      onBack={onBack}
      nextLabel="כן, אפשר התראות"
    >
      <div className="space-y-4">
        <div
          className="rounded-xl p-5 flex items-start gap-4"
          style={{ backgroundColor: `${C.blue}08`, border: `1px solid ${C.blue}20` }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${C.blue}15`, border: `1px solid ${C.blue}25` }}
          >
            <Bell className="w-5 h-5" style={{ color: C.blue }} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: C.text, fontFamily: "var(--font-inter)" }}>
              מה תקבל:
            </p>
            <ul className="space-y-1.5 text-xs" style={{ color: C.muted, fontFamily: "var(--font-inter)" }}>
              <li>✓ כשנמצאה הזדמנות AI חדשה לחיסכון זמן</li>
              <li>✓ תזכורת להמשיך משימה שהתחלת</li>
              <li>✓ טיפ יומי לשיפור נקודת כאב נוכחית</li>
            </ul>
          </div>
        </div>

        {answers.notificationsEnabled && (
          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ backgroundColor: `${C.green}08`, border: `1px solid ${C.green}20` }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: C.green }} />
            <p className="text-sm" style={{ color: C.green, fontFamily: "var(--font-inter)" }}>
              התראות מופעלות
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleSkip}
          className="w-full text-center text-xs py-2 transition-colors duration-150"
          style={{ color: C.muted, fontFamily: "var(--font-inter)" }}
          onMouseEnter={e => (e.currentTarget.style.color = C.sub)}
          onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
        >
          <BellOff className="w-3 h-3 inline mr-1.5" strokeWidth={1.5} />
          דלג — אמשיך בלי התראות
        </button>
      </div>
    </StepCard>
  );
}
