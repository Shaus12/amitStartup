"use client";

import { useState, useEffect } from "react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "סטודיו לעיצוב גרפי", "חברת ייעוץ עסקי", "חנות בגדים אונליין", 
  "משרד עורכי דין", "סוכנות נדל״ן", "מסעדה איטלקית", 
  "חברת פיתוח תוכנה", "קליניקת פיזיותרפיה", "חברת שיווק דיגיטלי",
  "סטודיו לצילום", "חנות ספרים", "חברת לוגיסטיקה",
  "מכון כושר", "חברת ניקיון", "סוכנות ביטוח",
  "קליניקת שיניים", "חנות תכשיטים", "חברת הובלות",
  "אירועים ושמחות", "חברת אבטחה"
];

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step00_Welcome({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();
  const [exampleIndex, setExampleIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setExampleIndex((prev) => (prev + 1) % EXAMPLES.length);
        setFade(true);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <StepCard
      title={t.step00.title}
      subtitle={t.step00.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={!answers.businessName.trim() || !answers.ownerName.trim() || !answers.tagline.trim()}
      nextLabel="בוא נצא לדרך ←"
    >
      <style jsx global>{`
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(77, 142, 255, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(77, 142, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(77, 142, 255, 0); }
        }
        .pulse-btn {
          animation: pulse-glow 2s infinite;
        }
      `}</style>
      
      <div className="space-y-6 mt-4">
        <div className="space-y-2 relative">
          <Label htmlFor="businessName" className="text-zinc-300 text-sm font-semibold">
            {t.step00.businessName} <span className="text-blue-400">*</span>
          </Label>
          <div className="relative">
            <Input
              id="businessName"
              value={answers.businessName}
              onChange={(e) => updateAnswers({ businessName: e.target.value })}
              placeholder={t.step00.placeholderBusiness}
              className="bg-zinc-800/50 border-zinc-700/50 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-lg transition-all"
            />
            {!answers.businessName && (
              <span 
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 italic transition-opacity duration-500",
                  fade ? "opacity-100" : "opacity-0"
                )}
                style={{ direction: 'rtl', right: 'auto', left: '12px' }}
              >
                {/* Visual helper for ghost text if needed, but placeholder is usually enough. 
                    The spec says ghost text/rotating placeholder. 
                    Setting the placeholder dynamically is probably cleaner. */}
              </span>
            )}
            {!answers.businessName && (
               <div 
                 className={cn(
                   "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500/30 text-base transition-opacity duration-500 pr-10",
                   fade ? "opacity-100" : "opacity-0"
                 )}
                 style={{ right: 'auto', left: 'auto', paddingRight: '1rem', display: 'flex', alignItems: 'center' }}
               >
                 {EXAMPLES[exampleIndex]}
               </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline" className="text-zinc-300 text-sm font-semibold">
            {t.step00.tagline} <span className="text-blue-400">*</span>
          </Label>
          <Input
            id="tagline"
            value={answers.tagline}
            onChange={(e) => updateAnswers({ tagline: e.target.value })}
            placeholder={t.step00.placeholderTagline}
            className="bg-zinc-800/50 border-zinc-700/50 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 h-12 transition-all"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerName" className="text-zinc-300 text-sm font-semibold">
            {t.step00.ownerName} <span className="text-blue-400">*</span>
          </Label>
          <Input
            id="ownerName"
            value={answers.ownerName}
            onChange={(e) => updateAnswers({ ownerName: e.target.value })}
            placeholder={t.step00.placeholderOwner}
            className="bg-zinc-800/50 border-zinc-700/50 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 h-12 transition-all"
          />
        </div>
      </div>
    </StepCard>
  );
}
