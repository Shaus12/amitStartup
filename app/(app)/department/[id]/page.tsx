import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dept = await prisma.department.findUnique({
    where: { id },
    include: {
      processes: { orderBy: { sortOrder: "asc" } },
      painPoints: true,
      aiOpportunities: {
        where: { dismissedAt: null },
        orderBy: [{ pinned: "desc" }, { estimatedHoursSaved: "desc" }],
      },
    },
  });

  if (!dept) notFound();

  const totalHrs = dept.processes.reduce(
    (sum, p) => sum + (p.timeSpentHrsPerWeek ?? 0),
    0
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 text-sm mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Business Map
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: dept.color }}
        />
        <h1 className="text-3xl font-bold text-zinc-100">{dept.name}</h1>
        {dept.headcount && (
          <span className="flex items-center gap-1 text-sm text-zinc-400">
            <Users className="w-4 h-4" /> {dept.headcount} people
          </span>
        )}
        <StatusBadge status={dept.status} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Zap className="w-4 h-4 text-indigo-400" />}
          label="Processes"
          value={dept.processes.length.toString()}
        />
        <StatCard
          icon={<Clock className="w-4 h-4 text-blue-400" />}
          label="Hrs/week (total)"
          value={totalHrs > 0 ? `~${totalHrs} hrs` : "Not tracked"}
        />
        <StatCard
          icon={<span className="text-sm">💡</span>}
          label="AI Opportunities"
          value={dept.aiOpportunities.length.toString()}
        />
      </div>

      {/* Processes */}
      <Section title="Processes">
        {dept.processes.length === 0 ? (
          <Empty text="No processes added" />
        ) : (
          <div className="space-y-2">
            {dept.processes.map((p) => (
              <div
                key={p.id}
                className="flex items-start justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-zinc-100 font-medium">{p.name}</p>
                  {p.toolUsed && (
                    <p className="text-zinc-500 text-xs mt-0.5">
                      Tools: {p.toolUsed}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  {p.frequency && (
                    <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                      {p.frequency}
                    </Badge>
                  )}
                  {p.timeSpentHrsPerWeek && (
                    <Badge variant="outline" className="text-xs border-blue-800 text-blue-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {p.timeSpentHrsPerWeek}h/wk
                    </Badge>
                  )}
                  {p.isManual && (
                    <Badge variant="outline" className="text-xs border-amber-800 text-amber-400">
                      Manual
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Pain Points */}
      <Section title="Pain Points">
        {dept.painPoints.length === 0 ? (
          <Empty text="No pain points logged" />
        ) : (
          <div className="space-y-2">
            {dept.painPoints.map((p) => (
              <div
                key={p.id}
                className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
              >
                <SeverityDot severity={p.severity} />
                <p className="text-zinc-300 text-sm">{p.description}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* AI Opportunities */}
      <Section title="AI Opportunities for This Department">
        {dept.aiOpportunities.length === 0 ? (
          <Empty text="No AI opportunities yet — run analysis from the dashboard" />
        ) : (
          <div className="space-y-3">
            {dept.aiOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ImpactBadge type={opp.impactType} />
                  {opp.category === "ai_agent" && (
                    <Badge className="bg-indigo-600/20 text-indigo-300 border-indigo-700 text-xs">
                      🤖 AI Agent
                    </Badge>
                  )}
                </div>
                <p className="text-zinc-100 font-semibold">{opp.title}</p>
                <p className="text-zinc-400 text-sm mt-1">{opp.description}</p>
                {opp.agentName && (
                  <div className="mt-3 bg-zinc-800 rounded-lg p-3">
                    <p className="text-indigo-400 font-medium text-sm">{opp.agentName}</p>
                    {opp.agentDescription && (
                      <p className="text-zinc-300 text-xs mt-1">{opp.agentDescription}</p>
                    )}
                    {opp.agentTools && (
                      <p className="text-zinc-500 text-xs mt-1">Tools: {opp.agentTools}</p>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  {opp.estimatedHoursSaved && (
                    <span className="text-xs bg-green-900/30 text-green-400 border border-green-800/50 rounded-full px-2 py-0.5">
                      ~{opp.estimatedHoursSaved} hrs/wk saved
                    </span>
                  )}
                  {opp.estimatedCostSaved && (
                    <span className="text-xs bg-green-900/30 text-green-400 border border-green-800/50 rounded-full px-2 py-0.5">
                      ~${opp.estimatedCostSaved.toLocaleString()}/mo saved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-zinc-100 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-zinc-600 text-sm">{text}</p>;
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
        {icon} {label}
      </div>
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-green-900/30 text-green-400 border-green-800/50",
    at_risk: "bg-red-900/30 text-red-400 border-red-800/50",
    needs_attention: "bg-amber-900/30 text-amber-400 border-amber-800/50",
  };
  return (
    <span
      className={`text-xs rounded-full px-2 py-0.5 border ${map[status] ?? map.active}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function SeverityDot({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-blue-500",
  };
  return (
    <span
      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${map[severity] ?? map.medium}`}
    />
  );
}

function ImpactBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    time_savings: "bg-blue-900/30 text-blue-400 border-blue-800/50",
    cost_savings: "bg-green-900/30 text-green-400 border-green-800/50",
    revenue: "bg-yellow-900/30 text-yellow-400 border-yellow-800/50",
    quality: "bg-purple-900/30 text-purple-400 border-purple-800/50",
  };
  const labels: Record<string, string> = {
    time_savings: "Time Savings",
    cost_savings: "Cost Savings",
    revenue: "Revenue",
    quality: "Quality",
  };
  return (
    <span className={`text-xs rounded-full px-2 py-0.5 border ${map[type] ?? ""}`}>
      {labels[type] ?? type}
    </span>
  );
}
