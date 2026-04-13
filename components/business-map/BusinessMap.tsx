"use client";

import React, { useCallback, useState, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
  type NodeTypes,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { DepartmentNode, type DepartmentNodeType } from "./DepartmentNode";
import { DepartmentDetailSheet } from "./DepartmentDetailSheet";
import { BusinessMapData, DepartmentWithProcesses } from "@/lib/types/business-map";
import { applyDagreLayout } from "@/lib/utils/mapLayout";

const nodeTypes: NodeTypes = {
  department: DepartmentNode,
};

interface BusinessMapProps {
  data: BusinessMapData;
}

// Canonical business flow priority (Marketing → Sales → Onboarding → Operations → Support)
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
  return FLOW_PRIORITY.findIndex((keywords) => keywords.some((k) => n.includes(k)));
}

function buildEdges(depts: DepartmentWithProcesses[]): Edge[] {
  // Sort departments by canonical business flow priority
  const sorted = [...depts].sort((a, b) => {
    const pa = deptPriority(a.name);
    const pb = deptPriority(b.name);
    if (pa === -1 && pb === -1) return 0;
    if (pa === -1) return 1;
    if (pb === -1) return -1;
    return pa - pb;
  });

  const edges: Edge[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const src = sorted[i];
    const tgt = sorted[i + 1];
    // Only connect if both have known priorities (canonical flow)
    if (deptPriority(src.name) !== -1 || deptPriority(tgt.name) !== -1) {
      edges.push({
        id: `e-${src.id}-${tgt.id}`,
        source: src.id,
        target: tgt.id,
        type: "smoothstep",
        animated: false,
        style: {
          stroke: "#4d8eff40",
          strokeWidth: 2,
          strokeDasharray: "6 3",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#4d8eff80",
          width: 16,
          height: 16,
        },
        label: undefined,
      });
    }
  }
  return edges;
}

export function BusinessMap({ data }: BusinessMapProps) {
  const [selectedDept, setSelectedDept] = useState<DepartmentWithProcesses | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const initialEdges = useMemo(() => buildEdges(data.departments), [data.departments]);

  const initialNodes = useMemo<DepartmentNodeType[]>(() => {
    const allZero = data.departments.every(
      (d) => d.positionX === 0 && d.positionY === 0
    );

    const rawNodes: DepartmentNodeType[] = data.departments.map((dept) => ({
      id: dept.id,
      type: "department" as const,
      position: { x: dept.positionX ?? 0, y: dept.positionY ?? 0 },
      data: {
        label: dept.name,
        color: dept.color,
        status: dept.status,
        headcount: dept.headcount,
        processes: dept.processes.map((p) => ({
          id: p.id,
          name: p.name,
          timeSpentHrsPerWeek: p.timeSpentHrsPerWeek ?? 0,
          isManual: p.isManual ?? false,
          frequency: p.frequency ?? null,
        })),
        painPointCount: dept.painPoints.length,
        opportunityCount: dept.aiOpportunities.length,
        onSelect: () => {
          setSelectedDept(dept);
          setSheetOpen(true);
        },
      },
    }));

    if (allZero) {
      return applyDagreLayout(rawNodes, initialEdges) as DepartmentNodeType[];
    }

    return rawNodes;
  // initialEdges is stable — derived from same data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.departments]);

  const [nodes, , onNodesChange] = useNodesState<DepartmentNodeType>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeDragStop = useCallback(
    async (_event: React.MouseEvent, node: Node) => {
      try {
        await fetch(`/api/departments/${node.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            positionX: node.position.x,
            positionY: node.position.y,
          }),
        });
      } catch (err) {
        console.error("Failed to save node position", err);
      }
    },
    []
  );

  return (
    <div className="w-full h-full" style={{ backgroundColor: "#0d0f15" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.25}
        maxZoom={2}
        style={{ backgroundColor: "#0d0f15" }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#1e2030"
          gap={24}
          size={1.2}
        />
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

      <DepartmentDetailSheet
        department={selectedDept}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
