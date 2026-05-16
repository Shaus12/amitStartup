"use client";

import {
  Globe,
  Briefcase,
  ShoppingBag,
  Users,
  Store,
  MapPin,
  Factory,
  MoreHorizontal,
} from "lucide-react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { StepCard } from "@/components/onboarding/StepCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const ICONS = [Globe, Briefcase, ShoppingBag, Users, Store, MapPin, Factory, MoreHorizontal];

export function Step01_BusinessType({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();
  const t = useT();

  const nextDisabled = !answers.businessType || !answers.industry.trim();

  return (
    <StepCard
      title={t.step01.title}
      subtitle={t.step01.subtitle}
      onNext={onNext}
      onBack={onBack}
      nextDisabled={nextDisabled}
    >
      <div className="space-y-6">
        {/* Business Type Grid */}
        <div>
          <p className="text-[var(--bv-text-2)] text-sm font-medium mb-3">
            {t.step01.businessTypeLabel} <span className="text-blue-400">*</span>
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {t.step01.businessTypes.map(({ value, label }, i) => {
              const Icon = ICONS[i];
              const selected = answers.businessType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateAnswers({ businessType: value })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-[var(--bv-border-subtle)] bg-[var(--bv-surface-raised)]/50 text-[var(--bv-text-3)] hover:border-[var(--bv-muted)] hover:text-[var(--bv-text-1)]"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-xs leading-tight">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Industry */}
        <div className="space-y-1.5">
          <Label htmlFor="industry" className="text-[var(--bv-text-2)] text-sm font-medium">
            {t.step01.industryLabel} <span className="text-blue-400">*</span>
          </Label>
          <Input
            id="industry"
            value={answers.industry}
            onChange={(e) => updateAnswers({ industry: e.target.value })}
            placeholder={t.step01.industryPlaceholder}
            className="bg-[var(--bv-surface-raised)] border-[var(--bv-border-subtle)] text-[var(--bv-text-1)] placeholder:text-[var(--bv-muted)] focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        {/* Target Customer */}
        <div>
          <p className="text-[var(--bv-text-2)] text-sm font-medium mb-3">{t.step01.targetLabel}</p>
          <div className="flex gap-2">
            {t.step01.targetCustomers.map(({ value, label }) => {
              const selected = answers.targetCustomer === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateAnswers({ targetCustomer: value })}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-[var(--bv-border-subtle)] bg-[var(--bv-surface-raised)]/50 text-[var(--bv-text-3)] hover:border-[var(--bv-muted)] hover:text-[var(--bv-text-1)]"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
