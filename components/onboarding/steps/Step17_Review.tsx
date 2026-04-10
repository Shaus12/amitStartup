"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useOnboardingStore } from "@/lib/hooks/useOnboardingStore";
import { cn } from "@/lib/utils";

interface Props {
  onNext?: () => void;
  onBack: () => void;
}

function SummarySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-zinc-500 shrink-0 min-w-[120px]">{label}</span>
      <span className="text-zinc-200 flex-1">{value}</span>
    </div>
  );
}

function SummaryList({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-zinc-500 shrink-0 min-w-[120px]">{label}</span>
      <div className="flex flex-wrap gap-1.5 flex-1">
        {items.map((item) => (
          <span
            key={item}
            className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Step17_Review({ onBack }: Props) {
  const router = useRouter();
  const { answers, setBusinessId } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      // Step 1: POST onboarding answers
      const onboardingRes = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      if (!onboardingRes.ok) {
        const err = await onboardingRes.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to save your answers. Please try again.");
      }

      const { businessId } = await onboardingRes.json();
      setBusinessId(businessId);

      // Step 2: Trigger opportunity generation
      const genRes = await fetch("/api/opportunities/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });

      if (!genRes.ok) {
        const err = await genRes.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to generate your business map. Please try again.");
      }

      // Step 3: Redirect to dashboard
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(message);
      setLoading(false);
    }
  }

  const departmentNames = answers.departments.map((d) => d.name);
  const processCount = answers.processes.length;
  const toolNames = answers.tools.map((t) => t.name);
  const painPoints = [answers.painPoint1, answers.painPoint2, answers.painPoint3].filter(
    Boolean
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-100">
          Review your business profile
        </h2>
        <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
          Here's what we've captured. Hit the button below to generate your personalised
          business overview and AI opportunity map.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {/* Business */}
        <SummarySection title="Business">
          <SummaryRow label="Name" value={answers.businessName} />
          <SummaryRow label="Type" value={answers.businessType} />
          <SummaryRow label="Industry" value={answers.industry} />
          <SummaryRow label="Team size" value={answers.employeeRange} />
          <SummaryRow label="Revenue" value={answers.revenueRange} />
        </SummarySection>

        {/* Departments */}
        {answers.departments.length > 0 && (
          <SummarySection title="Departments">
            {answers.departments.map((dept) => (
              <div key={dept.name} className="flex items-center gap-2 text-sm">
                <span className="text-zinc-200">{dept.name}</span>
                {dept.headcount !== undefined && dept.headcount > 0 && (
                  <span className="text-zinc-500 text-xs">
                    — {dept.headcount} {dept.headcount === 1 ? "person" : "people"}
                  </span>
                )}
              </div>
            ))}
          </SummarySection>
        )}

        {/* Processes */}
        {processCount > 0 && (
          <SummarySection title="Processes">
            <div className="text-sm text-zinc-200">
              {processCount} process{processCount !== 1 ? "es" : ""} documented across{" "}
              {departmentNames.length} department{departmentNames.length !== 1 ? "s" : ""}
            </div>
          </SummarySection>
        )}

        {/* Tools */}
        {toolNames.length > 0 && (
          <SummarySection title="Tools">
            <SummaryList label="Current stack" items={toolNames} />
          </SummarySection>
        )}

        {/* Pain Points */}
        {painPoints.length > 0 && (
          <SummarySection title="Pain Points">
            <div className="space-y-2">
              {painPoints.map((point, i) => (
                <p key={i} className="text-sm text-zinc-300 leading-relaxed">
                  {point}
                </p>
              ))}
            </div>
          </SummarySection>
        )}

        {/* Goals */}
        {answers.goals.length > 0 && (
          <SummarySection title="Goals">
            <SummaryList label="Priorities" items={answers.goals} />
            {answers.topPriority90Days && (
              <div className="mt-2 text-sm text-zinc-300 leading-relaxed pt-2 border-t border-zinc-800">
                <span className="text-zinc-500 text-xs block mb-1">Top priority (90 days)</span>
                {answers.topPriority90Days}
              </div>
            )}
          </SummarySection>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="text-zinc-400 hover:text-zinc-100 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all",
            loading
              ? "bg-blue-600/60 text-blue-200 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating your business map...
            </>
          ) : (
            "Generate My Business Overview"
          )}
        </button>
      </div>
    </div>
  );
}
