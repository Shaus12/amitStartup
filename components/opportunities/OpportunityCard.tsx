"use client";

import { Star, X } from "lucide-react";
import { AiOpportunityItem } from "@/lib/types/opportunities";

interface OpportunityCardProps {
  opportunity: AiOpportunityItem;
  onPin: () => void;
  onDismiss: () => void;
}

function ImpactBadge({ type }: { type: AiOpportunityItem["impactType"] }) {
  const map: Record<AiOpportunityItem["impactType"], { label: string; className: string }> = {
    time_savings: {
      label: "Time Savings",
      className: "bg-blue-500/20 text-blue-400 border-blue-500/20",
    },
    cost_savings: {
      label: "Cost Savings",
      className: "bg-green-500/20 text-green-400 border-green-500/20",
    },
    revenue: {
      label: "Revenue",
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
    },
    quality: {
      label: "Quality",
      className: "bg-purple-500/20 text-purple-400 border-purple-500/20",
    },
  };
  const item = map[type];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
}

function EffortBadge({ effort }: { effort: AiOpportunityItem["implementationEffort"] }) {
  if (!effort) return null;
  const map: Record<string, { label: string; className: string }> = {
    low: { label: "Low Effort", className: "bg-green-500/20 text-green-400" },
    medium: { label: "Medium Effort", className: "bg-amber-500/20 text-amber-400" },
    high: { label: "High Effort", className: "bg-red-500/20 text-red-400" },
  };
  const item = map[effort];
  if (!item) return null;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.className}`}>
      {item.label}
    </span>
  );
}

function ComplexityBadge({ complexity }: { complexity: AiOpportunityItem["setupComplexity"] }) {
  if (!complexity) return null;
  const map: Record<string, string> = {
    plug_and_play: "Plug & Play",
    some_setup: "Some Setup",
    custom_build: "Custom Build",
  };
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
      {map[complexity] ?? complexity}
    </span>
  );
}

export function OpportunityCard({ opportunity, onPin, onDismiss }: OpportunityCardProps) {
  const isPinned = opportunity.pinned;
  const isAgent = opportunity.category === "ai_agent";

  const agentTools = opportunity.agentTools
    ? opportunity.agentTools.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div
      className={`bg-zinc-900 border rounded-xl p-5 hover:border-zinc-700 transition-colors ${
        isPinned ? "border-yellow-500/40 ring-1 ring-yellow-500/20" : "border-zinc-800"
      }`}
    >
      {/* Badge row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <ImpactBadge type={opportunity.impactType} />
        <EffortBadge effort={opportunity.implementationEffort} />
        {opportunity.category && (
          <span className="inline-flex items-center rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
            {opportunity.category.replace(/_/g, " ")}
          </span>
        )}
        {isAgent && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/20 border border-blue-500/30 px-2 py-0.5 text-xs font-medium text-blue-400">
            🤖 AI Agent
          </span>
        )}
        {opportunity.department && (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: opportunity.department.color + "20",
              color: opportunity.department.color,
            }}
          >
            {opportunity.department.name}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-zinc-100 mb-1.5 leading-snug">
        {opportunity.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
        {opportunity.description}
      </p>

      {/* Agent details */}
      {opportunity.agentName && (
        <div className="rounded-lg bg-blue-950/60 border border-blue-800/40 px-3.5 py-3 mb-4">
          <p className="text-sm font-bold text-blue-200 mb-1">
            {opportunity.agentName}
          </p>
          {opportunity.agentDescription && (
            <p className="text-sm text-zinc-300 mb-2 leading-relaxed">
              {opportunity.agentDescription}
            </p>
          )}
          {agentTools.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {agentTools.map((tool) => (
                <span
                  key={tool}
                  className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Savings row */}
      {(opportunity.estimatedHoursSaved || opportunity.estimatedCostSaved) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {opportunity.estimatedHoursSaved && (
            <span className="inline-flex items-center rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">
              ~{opportunity.estimatedHoursSaved} hrs/week saved
            </span>
          )}
          {opportunity.estimatedCostSaved && (
            <span className="inline-flex items-center rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">
              ~${opportunity.estimatedCostSaved}/month saved
            </span>
          )}
        </div>
      )}

      {/* Setup complexity + actions */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <ComplexityBadge complexity={opportunity.setupComplexity} />

        <div className="flex items-center gap-2 ml-auto">
          {/* Pin button */}
          <button
            onClick={onPin}
            aria-label={isPinned ? "Unpin opportunity" : "Pin opportunity"}
            className="rounded-lg p-1.5 transition-colors hover:bg-zinc-800"
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                isPinned ? "fill-yellow-400 text-yellow-400" : "text-zinc-500 hover:text-yellow-400"
              }`}
            />
          </button>

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            aria-label="Dismiss opportunity"
            className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
