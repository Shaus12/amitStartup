"use client";

import React, { useCallback, useState, useMemo, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  MarkerType,
  type NodeTypes,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { DepartmentNode, type DepartmentNodeType } from "./DepartmentNode";
import { AnimatedParticleEdge } from "./AnimatedParticleEdge";
import { DepartmentOnboardingModal } from "./DepartmentOnboardingModal";
import {
  SUMMARY_CARD_NODE_ID,
  SummaryCard,
  type SummaryCardNodeType,
} from "./SummaryCard";
import type { AnalysisSummarySnapshot } from "@/lib/types/business-map";
import { BusinessMapData, DepartmentWithProcesses } from "@/lib/types/business-map";
import {
  applyDagreLayout,
  NODE_WIDTH,
  NODE_HEIGHT,
  ROOT_WIDTH,
  ROOT_HEIGHT,
} from "@/lib/utils/mapLayout";

const nodeTypes: NodeTypes = {
  departmentNode: DepartmentNode,
  summaryCard: SummaryCard,
};

type BusinessMapRFNode = DepartmentNodeType | SummaryCardNodeType;

const SUMMARY_LAYOUT_GAP = 200;

const edgeTypes = {
  animatedParticleEdge: AnimatedParticleEdge,
};

interface BusinessMapProps {
  data: BusinessMapData;
  onOpenAnalysisReveal?: () => void;
}

function computeSummaryPosition(
  deptNodes: Array<{ id: string; position: { x: number; y: number }; type?: string | null }>,
  hubId: string | null
): { x: number; y: number } {
  const SUMMARY_W = 480;
  let minX = Infinity;
  let maxX = -Infinity;
  let maxBottom = 0;

  for (const n of deptNodes) {
    if (n.type !== "departmentNode") continue;
    const isRoot = Boolean(hubId && n.id === hubId);
    const w = isRoot ? ROOT_WIDTH : NODE_WIDTH;
    const h = isRoot ? ROOT_HEIGHT : NODE_HEIGHT;
    minX = Math.min(minX, n.position.x);
    maxX = Math.max(maxX, n.position.x + w);
    maxBottom = Math.max(maxBottom, n.position.y + h);
  }

  if (!Number.isFinite(minX)) return { x: 60, y: 320 };
  return { x: (minX + maxX) / 2 - SUMMARY_W / 2, y: maxBottom + SUMMARY_LAYOUT_GAP };
}

function buildSummaryCardNode(
  position: { x: number; y: number },
  summary: AnalysisSummarySnapshot,
  onOpenReveal: () => void
): SummaryCardNodeType {
  return {
    id: SUMMARY_CARD_NODE_ID,
    type: "summaryCard",
    position,
    draggable: false,
    selectable: true,
    data: { summary, onOpenReveal },
    zIndex: 0,
  };
}

const FLOW_PRIORITY: string[][] = [
  ["marketing", "שיווק", "advertis"],
  ["sales", "מכירות", "selling"],
  ["onboard", "קליטה", "implementation", "customer success"],
  ["operations", "תפעול", "ops", "delivery", "fulfillment"],
  ["customer support", "שירות", "support", "service", "helpdesk"],
  ["finance", "כספ", "billing", "accounting"],
  ["hr", "משאבי אנוש", "people", "talent"],
  ["engineering", "פיתוח", "dev", "tech", "product"],
];

function deptPriority(name: string): number {
  const n = name.toLowerCase();
  return FLOW_PRIORITY.findIndex((kws) => kws.some((k) => n.includes(k)));
}

// Returns the hub department id (highest priority department)
function findHubId(depts: DepartmentWithProcesses[]): string | null {
  if (depts.length === 0) return null;
  let best = depts[0];
  let bestPri = deptPriority(best.name);
  for (const d of depts) {
    const p = deptPriority(d.name);
    if (bestPri === -1 || (p !== -1 && p < bestPri)) {
      best = d;
      bestPri = p;
    }
  }
  return best.id;
}

// Hub-spoke: hub connects down to every other department (org-chart style)
function buildEdges(depts: DepartmentWithProcesses[]): Edge[] {
  if (depts.length <= 1) return [];
  const hubId = findHubId(depts);
  if (!hubId) return [];
  
  const hubDept = depts.find(d => d.id === hubId);
  const healthScore = hubDept?.healthScore ?? 72;
  const hubColor = healthScore >= 70 ? "#34d399" : healthScore >= 40 ? "#fbbf24" : "#f87171";
  
  return depts
    .filter((d) => d.id !== hubId)
    .map((d) => ({
      id: `e-${hubId}-${d.id}`,
      source: hubId,
      target: d.id,
      type: "animatedParticleEdge",
      data: { color: hubColor, duration: 2.5 + Math.random() * 1.5 },
    }));
}

// Expanded node dimensions — must match ExpandedCard in DepartmentNode.tsx
const EXPANDED_W = 400;
const EXPANDED_H = 560; // approx (header ~140 + body ~460cap)

function BusinessMapInner({ data, onOpenAnalysisReveal }: BusinessMapProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [unlockingDept, setUnlockingDept] = useState<{ id: string; name: string } | null>(null);
  const { setCenter, fitView, getNode } = useReactFlow();
  // Store viewport before expand so we can restore it exactly
  const preExpandViewport = useRef<{ zoom: number } | null>(null);

  const businessId = data.business?.id ?? null;
  const analysisSummary = data.analysisSummary;

  const revealRef = useRef(onOpenAnalysisReveal);
  revealRef.current = onOpenAnalysisReveal;
  const fireAnalysisReveal = useCallback(() => {
    revealRef.current?.();
  }, []);

  const initialEdges = useMemo(() => buildEdges(data.departments), [data.departments]);

  // Build a dept lookup map for convenience
  const deptMap = useMemo(() => {
    const m = new Map<string, DepartmentWithProcesses>();
    for (const d of data.departments) m.set(d.id, d);
    return m;
  }, [data.departments]);

  const hubId = useMemo(() => findHubId(data.departments), [data.departments]);

  const buildNodeData = useCallback(
    (dept: DepartmentWithProcesses, isExpanded: boolean, index: number) => ({
      label: dept.name,
      color: dept.color,
      status: dept.status,
      headcount: dept.headcount,
      businessId,
      mainPain: dept.mainPain,
      firstAction: dept.firstAction,
      healthScore: dept.healthScore ?? undefined,
      isRoot: dept.id === hubId,
      isLocked: dept.isLocked ?? false,
      onUnlock: dept.isLocked ? () => setUnlockingDept({ id: dept.id, name: dept.name }) : undefined,
      index,
      processes: dept.processes.map((p) => ({
        id: p.id,
        name: p.name,
        timeSpentHrsPerWeek: p.timeSpentHrsPerWeek ?? 0,
        isManual: p.isManual ?? false,
        frequency: p.frequency ?? null,
      })),
      // Include full opportunity details for the expanded view
      aiOpportunities: (dept.aiOpportunities ?? []).map((o: any) => ({
        id: o.id,
        title: o.title,
        impactType: o.impactType ?? o.impact_type ?? "",
        estimatedHoursSaved: o.estimatedHoursSaved ?? o.estimated_hours_saved ?? null,
        estimatedCostSaved: o.estimatedCostSaved ?? o.estimated_cost_saved ?? null,
      })),
      painPointCount: dept.painPoints?.length ?? 0,
      opportunityCount: dept.aiOpportunities?.length ?? 0,
      isExpanded,
      onSelect: isExpanded ? () => {} : () => handleExpand(dept.id),
      onClose: isExpanded ? () => handleCollapse() : undefined,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [businessId, hubId]
  );

  const initialNodes = useMemo<BusinessMapRFNode[]>(() => {
    if (data.departments.length === 0) return [];

    const allZero = data.departments.every((d) => d.positionX === 0 && d.positionY === 0);
    const rawNodes: DepartmentNodeType[] = data.departments.map((dept, idx) => ({
      id: dept.id,
      type: "departmentNode" as const,
      position: { x: dept.positionX ?? 0, y: dept.positionY ?? 0 },
      data: buildNodeData(dept, false, idx),
      zIndex: 0,
    }));

    const positioned = (
      allZero
        ? (applyDagreLayout(rawNodes, initialEdges, hubId ?? undefined) as DepartmentNodeType[])
        : rawNodes
    ) as DepartmentNodeType[];

    const pos = computeSummaryPosition(positioned, hubId);
    return [...positioned, buildSummaryCardNode(pos, analysisSummary, fireAnalysisReveal)];
  }, [
    data.departments,
    analysisSummary,
    initialEdges,
    hubId,
    buildNodeData,
    fireAnalysisReveal,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState<BusinessMapRFNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // ── Expand: zoom in cinematically, mark node as expanded ──────────────────
  function handleExpand(deptId: string) {
    const dept = deptMap.get(deptId);
    if (!dept) return;

    setExpandedId(deptId);

    // Update all nodes: expand the clicked one, collapse others, raise z-index
    setNodes((nds) =>
      nds.map((n) => {
        if (n.type === "summaryCard") return n;
        const isExpanded = n.id === deptId;
        const deptData = deptMap.get(n.id)!;
        return {
          ...n,
          draggable: !isExpanded,
          zIndex: isExpanded ? 1000 : 0,
          data: buildNodeData(deptData, isExpanded, n.data.index as number ?? 0),
        };
      })
    );

    // Zoom into the node center after state flush
    setTimeout(() => {
      const node = getNode(deptId);
      if (!node) return;
      const cx = node.position.x + EXPANDED_W / 2;
      const cy = node.position.y + EXPANDED_H / 2;
      setCenter(cx, cy, { zoom: 0.9, duration: 650 });
    }, 20);
  }

  // ── Collapse: zoom back out to fitView ────────────────────────────────────
  function handleCollapse() {
    setExpandedId(null);

    // Restore all nodes to compact, draggable
    setNodes((nds) =>
      nds.map((n) => {
        if (n.type === "summaryCard") return n;
        const deptData = deptMap.get(n.id);
        if (!deptData) return n;
        return {
          ...n,
          draggable: true,
          zIndex: 0,
          data: buildNodeData(deptData, false, n.data.index as number ?? 0),
        };
      })
    );

    // Zoom back out to show all nodes
    setTimeout(() => {
      fitView({ duration: 650, padding: 0.25 });
    }, 20);
  }

  // ── ESC key to collapse ───────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && expandedId) handleCollapse();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedId]);

  // ── Drag to save position (only when not expanded) ────────────────────────
  const onNodeDragStop = useCallback(async (_event: React.MouseEvent, node: Node) => {
    if (expandedId) return; // no dragging expanded node
    if (node.id === SUMMARY_CARD_NODE_ID) return;
    try {
      await fetch(`/api/departments/${node.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionX: node.position.x, positionY: node.position.y }),
      });
    } catch (err) {
      console.error("Failed to save node position", err);
    }
  }, [expandedId]);

  return (
    <div className="w-full h-full" style={{ backgroundColor: "#0d0f15" }}>
      {/* ESC hint when expanded */}
      {expandedId && (
        <div
          style={{
            position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
            zIndex: 10, display: "flex", alignItems: "center", gap: 8,
            backgroundColor: "#13151d", border: "1px solid #282a30", borderRadius: 8,
            padding: "6px 14px", pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: 11, color: "#8c909f", fontFamily: "var(--font-inter)" }}>
            לחץ X או ESC לחזרה למבט-על
          </span>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.15}
        maxZoom={3}
        style={{ backgroundColor: "#0d0f15" }}
        proOptions={{ hideAttribution: true }}
        // Prevent clicking background from collapsing (only X / ESC should)
        onPaneClick={() => {}}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          color="#ffffff" 
          gap={28} 
          size={1.5} 
          style={{ opacity: 0.06 }}
        />
        <Controls
          className="[&>button]:bg-[#1a1c24] [&>button]:border-[#282a30] [&>button]:text-[#8c909f] [&>button:hover]:bg-[#282a30] [&>button:hover]:text-[#e2e2eb]"
          style={{ bottom: 16, left: 16 }}
        />
        <MiniMap
          className="!bg-[#13151d] !border-[#282a30] !rounded-xl"
          nodeColor={(node) => {
            if (node.type === "summaryCard") return "#4d8eff";
            return (node.data as { color?: string }).color ?? "#4d8eff";
          }}
          maskColor="rgba(13,15,21,0.8)"
          style={{ bottom: 16, right: 16 }}
        />
      </ReactFlow>

      {/* Department onboarding modal for locked departments */}
      {unlockingDept && (
        <DepartmentOnboardingModal
          departmentId={unlockingDept.id}
          departmentName={unlockingDept.name}
          businessId={businessId ?? ""}
          onClose={() => setUnlockingDept(null)}
          onComplete={() => {
            setUnlockingDept(null);
            // Reload the page to show updated map
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

export function BusinessMap({ data, onOpenAnalysisReveal }: BusinessMapProps) {
  return (
    <ReactFlowProvider>
      <BusinessMapInner data={data} onOpenAnalysisReveal={onOpenAnalysisReveal} />
    </ReactFlowProvider>
  );
}
