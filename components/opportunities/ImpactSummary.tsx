import { Clock, DollarSign, Bot, Sparkles } from "lucide-react";

interface ImpactSummaryProps {
  totalHoursSaved: number;
  totalCostSaved: number;
  agentCount: number;
  opportunityCount: number;
}

function StatItem({
  icon: Icon,
  value,
  subtitle,
  showDivider = true,
}: {
  icon: React.ElementType;
  value: string;
  subtitle: string;
  showDivider?: boolean;
}) {
  return (
    <>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="shrink-0 rounded-lg bg-blue-600/20 p-2">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold text-zinc-100 truncate">{value}</p>
          <p className="text-xs text-zinc-400">{subtitle}</p>
        </div>
      </div>
      {showDivider && (
        <div className="hidden sm:block w-px h-10 bg-blue-800/40 shrink-0" />
      )}
    </>
  );
}

export function ImpactSummary({
  totalHoursSaved,
  totalCostSaved,
  agentCount,
  opportunityCount,
}: ImpactSummaryProps) {
  return (
    <div className="bg-gradient-to-r from-blue-950 to-zinc-900 border border-blue-800/50 rounded-xl p-5 mb-6">
      <div className="flex flex-wrap items-center gap-4 sm:gap-0 sm:divide-x-0">
        <StatItem
          icon={Clock}
          value={`~${totalHoursSaved} hrs/week`}
          subtitle="saved with AI"
        />
        <StatItem
          icon={DollarSign}
          value={`$${totalCostSaved.toLocaleString()}/month`}
          subtitle="in cost savings"
        />
        <StatItem
          icon={Bot}
          value={String(agentCount)}
          subtitle="AI agents ready"
        />
        <StatItem
          icon={Sparkles}
          value={String(opportunityCount)}
          subtitle="total opportunities"
          showDivider={false}
        />
      </div>
    </div>
  );
}
