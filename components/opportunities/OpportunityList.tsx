"use client";

import { AiOpportunityItem } from "@/lib/types/opportunities";
import { OpportunityCard } from "./OpportunityCard";

interface OpportunityListProps {
  opportunities: AiOpportunityItem[];
  onPin: (id: string) => void;
  onDismiss: (id: string) => void;
}

function sortPinnedFirst(items: AiOpportunityItem[]): AiOpportunityItem[] {
  return [...items].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });
}

interface SectionProps {
  title: string;
  items: AiOpportunityItem[];
  onPin: (id: string) => void;
  onDismiss: (id: string) => void;
}

function OpportunitySection({ title, items, onPin, onDismiss }: SectionProps) {
  if (items.length === 0) return null;

  const sorted = sortPinnedFirst(items);

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-semibold text-zinc-200">{title}</h2>
        <span className="inline-flex items-center rounded-full bg-zinc-700 px-2 py-0.5 text-xs font-medium text-zinc-400">
          {items.length}
        </span>
      </div>
      <div className="space-y-4">
        {sorted.map((opp) => (
          <OpportunityCard
            key={opp.id}
            opportunity={opp}
            onPin={() => onPin(opp.id)}
            onDismiss={() => onDismiss(opp.id)}
          />
        ))}
      </div>
    </section>
  );
}

export function OpportunityList({ opportunities, onPin, onDismiss }: OpportunityListProps) {
  const agents = opportunities.filter((o) => o.category === "ai_agent");
  const automations = opportunities.filter((o) => o.category !== "ai_agent");

  return (
    <div>
      <OpportunitySection
        title="🤖 AI Agents"
        items={agents}
        onPin={onPin}
        onDismiss={onDismiss}
      />
      <OpportunitySection
        title="⚡ Automations & Tools"
        items={automations}
        onPin={onPin}
        onDismiss={onDismiss}
      />
      {opportunities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-zinc-400 font-medium mb-1">No opportunities found</p>
          <p className="text-sm text-zinc-600">
            Try adjusting your filters or regenerate the AI analysis.
          </p>
        </div>
      )}
    </div>
  );
}
