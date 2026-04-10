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

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const BUSINESS_TYPES = [
  { label: "SaaS / Software", icon: Globe },
  { label: "Service Business", icon: Briefcase },
  { label: "E-commerce / Product", icon: ShoppingBag },
  { label: "Agency", icon: Users },
  { label: "Marketplace", icon: Store },
  { label: "Retail / Physical", icon: MapPin },
  { label: "Manufacturing", icon: Factory },
  { label: "Other", icon: MoreHorizontal },
];

const TARGET_CUSTOMERS = ["B2B", "B2C", "Both"];

export function Step01_BusinessType({ onNext, onBack }: Props) {
  const { answers, updateAnswers } = useOnboardingStore();

  const nextDisabled = !answers.businessType || !answers.industry.trim();

  return (
    <StepCard
      title="What kind of business are you?"
      subtitle="This helps us tailor the questions and recommendations to your specific context."
      onNext={onNext}
      onBack={onBack}
      nextDisabled={nextDisabled}
    >
      <div className="space-y-6">
        {/* Business Type Grid */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">
            Business type <span className="text-blue-400">*</span>
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BUSINESS_TYPES.map(({ label, icon: Icon }) => {
              const selected = answers.businessType === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => updateAnswers({ businessType: label })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
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
          <Label htmlFor="industry" className="text-zinc-300 text-sm font-medium">
            Industry <span className="text-blue-400">*</span>
          </Label>
          <Input
            id="industry"
            value={answers.industry}
            onChange={(e) => updateAnswers({ industry: e.target.value })}
            placeholder="e.g. Real estate, Healthcare, Legal, Tech..."
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        {/* Target Customer */}
        <div>
          <p className="text-zinc-300 text-sm font-medium mb-3">Who do you sell to?</p>
          <div className="flex gap-2">
            {TARGET_CUSTOMERS.map((tc) => {
              const selected = answers.targetCustomer === tc;
              return (
                <button
                  key={tc}
                  type="button"
                  onClick={() => updateAnswers({ targetCustomer: tc })}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all",
                    selected
                      ? "border-blue-500 bg-blue-600/10 text-blue-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  )}
                >
                  {tc}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
