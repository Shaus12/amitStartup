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
import { BusinessMapData, DepartmentWithProcesses } from "@/lib/types/business-map";
import { applyDagreLayout } from "@/lib/utils/mapLayout";

const nodeTypes: NodeTypes = {
  department: DepartmentNode,
};

interface BusinessMapProps {
  data: BusinessMapData;
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

function buildEdges(depts: DepartmentWithProcesses[]): Edge[] {
  const sorted = [...depts].sort((a, b) => {
    const pa = deptPriority(a.name), pb = deptPriority(b.name);
    if (pa === -1 && pb === -1) return 0;
    if (pa === -1) return 1;
    if (pb === -1) return -1;
    return pa - pb;
  });
  const edges: Edge[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const src = sorted[i], tgt = sorted[i + 1];
    if (deptPriority(src.name) !== -1 || deptPriority(tgt.name) !== -1) {
      edges.push({
        id: `e-${src.id}-${tgt.id}`,
        source: src.id, target: tgt.id,
        type: "smoothstep", animated: false,
        style: { stroke: "#4d8eff40", strokeWidth: 2, strokeDasharray: "6 3" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#4d8eff80", width: 16, height: 16 },
      });
    }
  }
  return edges;
}

// Expanded node dimensions — must match ExpandedCard in DepartmentNode.tsx
const EXPANDED_W = 400;
const EXPANDED_H = 560; // approx (header ~140 + body ~460cap)

function BusinessMapInner({ data }: BusinessMapProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { setCenter, fitView, setNodes, getNode } = useReactFlow();
  // Store viewport before expand so we can restore it exactly
  const preExpandViewport = useRef<{ zoom: number } | null>(null);

  const businessId = data.business?.id ?? null;

  const initialEdges = useMemo(() => buildEdges(data.departments), [data.departments]);

  // Build a dept lookup map for convenience
  const deptMap = useMemo(() => {
    const m = new Map<string, DepartmentWithProcesses>();
    for (const d of data.departments) m.set(d.id, d);
    return m;
  }, [data.departments]);

  const buildNodeData = useCallback(
    (dept: DepartmentWithProcesses, isExpanded: boolean) => ({
      label: dept.name,
      color: dept.color,
      status: dept.status,
      headcount: dept.headcount,
      businessId,
      mainPain: dept.mainPain,
      firstAction: dept.firstAction,
      healthScore: dept.healthScore,
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
    [businessId]
  );

  const initialNodes = useMemo<DepartmentNodeType[]>(() => {
    const allZero = data.departments.every((d) => d.positionX === 0 && d.positionY === 0);
    const rawNodes: DepartmentNodeType[] = data.departments.map((dept) => ({
      id: dept.id,
      type: "department" as const,
      position: { x: dept.positionX ?? 0, y: dept.positionY ?? 0 },
      data: buildNodeData(dept, false),
      zIndex: 0,
    }));
    if (allZero) return applyDagreLayout(rawNodes, initialEdges) as DepartmentNodeType[];
    return rawNodes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.departments]);

  const [nodes, , onNodesChange] = useNodesState<DepartmentNodeType>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // ── Expand: zoom in cinematically, mark node as expanded ──────────────────
  function handleExpand(deptId: string) {
    const dept = deptMap.get(deptId);
    if (!dept) return;

    setExpandedId(deptId);

    // Update all nodes: expand the clicked one, collapse others, raise z-index
    setNodes((nds) =>
      nds.map((n) => {
        const isExpanded = n.id === deptId;
        const deptData = deptMap.get(n.id)!;
        return {
          ...n,
          draggable: !isExpanded,
          zIndex: isExpanded ? 1000 : 0,
          data: buildNodeData(deptData, isExpanded),
        };
      })
    );

    // Zoom into the node center after state flush
    setTimeout(() => {
      const node = getNode(deptId);
      if (!node) return;
      const cx = node.position.x + EXPANDED_W / 2;
      const cy = node.position.y + EXPANDED_H / 2;
      setCenter(cx, cy, { zoom: 1.2, duration: 650 });
    }, 20);
  }

  // ── Collapse: zoom back out to fitView ────────────────────────────────────
  function handleCollapse() {
    setExpandedId(null);

    // Restore all nodes to compact, draggable
    setNodes((nds) =>
      nds.map((n) => {
        const deptData = deptMap.get(n.id);
        if (!deptData) return n;
        return {
          ...n,
          draggable: true,
          zIndex: 0,
          data: buildNodeData(deptData, false),
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
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.15}
        maxZoom={3}
        style={{ backgroundColor: "#0d0f15" }}
        proOptions={{ hideAttribution: true }}
        // Prevent clicking background from collapsing (only X / ESC should)
        onPaneClick={() => {}}
      >
        <Background variant={BackgroundVariant.Dots} color="#1e2030" gap={24} size={1.2} />
        <Controls
          className="[&>button]:bg-[#1a1c24] [&>button]:border-[#282a30] [&>button]:text-[#8c909f] [&>button:hover]:bg-[#282a30] [&>button:hover]:text-[#e2e2eb]"
          style={{ bottom: 16, left: 16 }}
        />
        <MiniMap
          className="!bg-[#13151d] !border-[#282a30] !rounded-xl"
          nodeColor={(node) => (node.data as { color: string }).color ?? "#4d8eff"}
          maskColor="rgba(13,15,21,0.8)"
          style={{ bottom: 16, right: 16 }}
        />
      </ReactFlow>
    </div>
  );
}

export function BusinessMap({ data }: BusinessMapProps) {
  return (
    <ReactFlowProvider>
      <BusinessMapInner data={data} />
    </ReactFlowProvider>
  );
}
