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
        <h2 className="text-base font-semibold text-[var(--bv-text-1)]">{title}</h2>
        <span className="inline-flex items-center rounded-full bg-[var(--bv-surface-elevated)] px-2 py-0.5 text-xs font-medium text-[var(--bv-text-3)]">
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
        title="🤖 סוכני AI"
        items={agents}
        onPin={onPin}
        onDismiss={onDismiss}
      />
      <OpportunitySection
        title="⚡ אוטומציה וכלים"
        items={automations}
        onPin={onPin}
        onDismiss={onDismiss}
      />
      {opportunities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-[var(--bv-text-3)] font-medium mb-1">אין הזדמנויות עדיין</p>
          <p className="text-sm text-[var(--bv-muted)]">
            נסו לשנות מסננים או להריץ מחדש את ניתוח ה-AI.
          </p>
        </div>
      )}
    </div>
  );
}
