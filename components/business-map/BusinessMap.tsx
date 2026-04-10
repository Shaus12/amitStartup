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
  type NodeTypes,
  type Node,
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

export function BusinessMap({ data }: BusinessMapProps) {
  const [selectedDept, setSelectedDept] = useState<DepartmentWithProcesses | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const initialNodes = useMemo<DepartmentNodeType[]>(() => {
    const allZero = data.departments.every(
      (d) => d.positionX === 0 && d.positionY === 0
    );

    const rawNodes: DepartmentNodeType[] = data.departments.map((dept) => ({
      id: dept.id,
      type: "department" as const,
      position: { x: dept.positionX, y: dept.positionY },
      data: {
        label: dept.name,
        color: dept.color,
        status: dept.status,
        headcount: dept.headcount,
        processes: dept.processes.map((p) => ({
          id: p.id,
          name: p.name,
          timeSpentHrsPerWeek: p.timeSpentHrsPerWeek,
          isManual: p.isManual,
          frequency: p.frequency,
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
      return applyDagreLayout(rawNodes, []) as DepartmentNodeType[];
    }

    return rawNodes;
  }, [data.departments]);

  const [nodes, , onNodesChange] = useNodesState<DepartmentNodeType>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState([]);

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
    <div className="w-full h-full" style={{ backgroundColor: "#111319" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        style={{ backgroundColor: "#111319" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#282a30"
          gap={20}
          size={1}
        />
        <Controls className="[&>button]:bg-[#1e1f26] [&>button]:border-[#282a30] [&>button]:text-[#8c909f] [&>button:hover]:bg-[#282a30]" />
        <MiniMap
          className="!bg-[#191b22] !border-[#282a30]"
          nodeColor={(node) => (node.data as { color: string }).color ?? "#4d8eff"}
          maskColor="rgba(17,19,25,0.75)"
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
