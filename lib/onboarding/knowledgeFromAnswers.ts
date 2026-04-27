import type { OnboardingAnswers } from "@/lib/types/onboarding";

type DeptNameToId = Record<string, string>;

type KnowledgeRow = {
  business_id: string;
  department_id: string | null;
  category: string;
  content: string;
  source: "onboarding";
  metadata?: Record<string, unknown>;
};

function trimText(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function pushInsight(rows: KnowledgeRow[], bizId: string, label: string, value: unknown) {
  const t = trimText(value);
  if (!t) return;
  rows.push({
    business_id: bizId,
    department_id: null,
    category: "insight",
    content: `${label}: ${t}`,
    source: "onboarding",
  });
}

/**
 * Builds `business_knowledge` rows from onboarding answers.
 * Analysis (`/api/opportunities/generate`) reads only this table — not the JSON snapshot —
 * so every field we want Claude to see must be represented here (or as process/tool rows).
 */
export function buildOnboardingKnowledgeRows(
  answers: OnboardingAnswers,
  bizId: string,
  deptNameToId: DeptNameToId
): KnowledgeRow[] {
  const rows: KnowledgeRow[] = [];

  if (answers.processes?.length) {
    for (const p of answers.processes) {
      rows.push({
        business_id: bizId,
        department_id: deptNameToId[p.departmentName] || null,
        category: "process",
        content: `${p.name} (Frequency: ${p.frequency || "N/A"}, Manual: ${p.isManual ? "Yes" : "No"})`,
        source: "onboarding",
        metadata: { originalName: p.name, frequency: p.frequency, isManual: p.isManual },
      });
    }
  }

  if (answers.tools?.length) {
    for (const t of answers.tools) {
      rows.push({
        business_id: bizId,
        department_id: null,
        category: "tool",
        content: `CURRENT TOOL IN USE: ${t.name} (category: ${t.category}, Manual: ${t.isManualProcess ? "Yes" : "No"}) — do not recommend replacing this tool`,
        source: "onboarding",
        metadata: {
          name: t.name,
          category: t.category,
          isManualProcess: t.isManualProcess,
        },
      });
    }
  }

  const painPoints = [
    answers.painPoint1,
    answers.painPoint2,
    answers.painPoint3,
    answers.biggestHeadache,
  ].filter(trimText) as string[];

  for (const pp of painPoints) {
    rows.push({
      business_id: bizId,
      department_id: null,
      category: "pain_point",
      content: pp,
      source: "onboarding",
    });
  }

  if (answers.bottlenecks?.length) {
    for (const bn of answers.bottlenecks) {
      const t = trimText(bn);
      if (!t) continue;
      rows.push({
        business_id: bizId,
        department_id: null,
        category: "pain_point",
        content: t,
        source: "onboarding",
      });
    }
  }

  const goalStrings = new Set<string>();
  const tp = trimText(answers.topPriority90Days);
  if (tp) goalStrings.add(tp);
  for (const g of answers.goals || []) {
    const t = trimText(g);
    if (t) goalStrings.add(t);
  }
  for (const g of goalStrings) {
    rows.push({
      business_id: bizId,
      department_id: null,
      category: "goal",
      content: g,
      source: "onboarding",
    });
  }

  if (answers.manualTasks?.length) {
    for (const mt of answers.manualTasks) {
      const t = trimText(mt);
      if (!t) continue;
      rows.push({
        business_id: bizId,
        department_id: null,
        category: "insight",
        content: `Manual task: ${t}`,
        source: "onboarding",
      });
    }
  }

  // ── Profile & context (feeds analysis prompt) ───────────────────────
  pushInsight(rows, bizId, "Business name", answers.businessName);
  pushInsight(rows, bizId, "Owner", answers.ownerName);
  pushInsight(rows, bizId, "Tagline / one-liner", answers.tagline);
  pushInsight(rows, bizId, "Business type", answers.businessType);
  pushInsight(rows, bizId, "Industry", answers.industry);
  pushInsight(rows, bizId, "Target customer", answers.targetCustomer);

  pushInsight(rows, bizId, "Employee range", answers.employeeRange);
  pushInsight(rows, bizId, "Staff / work structure", answers.staffStructure);
  if (answers.hasSeparateDepts !== undefined) {
    pushInsight(
      rows,
      bizId,
      "Separate departments",
      answers.hasSeparateDepts ? "Yes — distinct teams/depts" : "No — flat / everyone wears many hats"
    );
  }

  pushInsight(rows, bizId, "Revenue range", answers.revenueRange);
  pushInsight(rows, bizId, "Business age", answers.businessAge);
  pushInsight(rows, bizId, "Growth trajectory", answers.growthTrajectory);

  pushInsight(rows, bizId, "Software spend (monthly)", answers.softwareSpend);
  pushInsight(rows, bizId, "CURRENT TOOL FOR lead tracking (do not replace)", answers.leadsTracking);
  pushInsight(rows, bizId, "CURRENT TOOL FOR client management (do not replace)", answers.clientManagement);
  pushInsight(rows, bizId, "CURRENT TOOL FOR finance tracking (do not replace)", answers.financeTracking);
  pushInsight(rows, bizId, "CURRENT TOOL FOR task/project tracking (do not replace)", answers.taskManagement);
  pushInsight(rows, bizId, "CURRENT TOOL FOR business data/metrics tracking (do not replace)", answers.dataTracking);

  if (answers.timeAudit?.length) {
    for (const e of answers.timeAudit) {
      const line = `${e.processName} @ ${e.departmentName}: ~${e.hoursPerWeek} h/week, ${e.peopleInvolved} people involved`;
      rows.push({
        business_id: bizId,
        department_id: deptNameToId[e.departmentName] || null,
        category: "insight",
        content: `Time audit: ${line}`,
        source: "onboarding",
        metadata: { ...e },
      });
    }
  }

  pushInsight(rows, bizId, "Monthly leads (band)", answers.monthlyLeads);
  pushInsight(rows, bizId, "Close rate", answers.closeRate);
  pushInsight(rows, bizId, "Average deal size", answers.avgDealSize);
  pushInsight(rows, bizId, "Time on comms / follow-ups", answers.timeSpentComms);
  if (answers.leadSources?.length) {
    pushInsight(rows, bizId, "Lead sources", answers.leadSources.filter(trimText).join(", "));
  }
  pushInsight(rows, bizId, "Marketing budget", answers.marketingBudget);
  if (answers.adPlatforms?.length) {
    pushInsight(rows, bizId, "Ad platforms", answers.adPlatforms.filter(trimText).join(", "));
  }

  pushInsight(rows, bizId, "Primary customer contact channels", answers.primaryContact);
  pushInsight(rows, bizId, "Inquiry volume", answers.inquiryVolume);
  pushInsight(rows, bizId, "Knowledge base / FAQs", answers.hasKnowledgeBase);
  pushInsight(rows, bizId, "Avg response time", answers.avgResponseTime);
  pushInsight(rows, bizId, "Sales process", answers.salesProcess);

  pushInsight(rows, bizId, "Reporting / KPI tracking method", answers.trackingMethod);
  pushInsight(rows, bizId, "Reporting frequency", answers.reportingFrequency);
  pushInsight(rows, bizId, "Who prepares reports", answers.reportCreator);
  pushInsight(rows, bizId, "Data-driven decisions", answers.dataBasedDecisions);

  pushInsight(rows, bizId, "Internal communication", answers.internalComms);
  pushInsight(rows, bizId, "Meeting hours per week", answers.meetingHoursPerWeek);
  pushInsight(rows, bizId, "Documented SOPs", answers.hasDocumentedSOPs);

  pushInsight(rows, bizId, "Prior AI usage", answers.priorAiUsage);
  if (answers.priorAiTools?.length) {
    pushInsight(rows, bizId, "Prior AI tools", answers.priorAiTools.filter(trimText).join(", "));
  }
  pushInsight(rows, bizId, "AI comfort level", answers.aiComfortLevel);
  pushInsight(rows, bizId, "AI budget", answers.aiBudget);
  pushInsight(rows, bizId, "AI preference (build vs buy)", answers.aiPrefBuiltVsCustom);

  if (answers.notificationsEnabled !== undefined) {
    pushInsight(
      rows,
      bizId,
      "Notifications enabled",
      answers.notificationsEnabled ? "Yes" : "No"
    );
  }

  return rows;
}
