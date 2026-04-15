import dagre from "dagre";
import { Node, Edge } from "@xyflow/react";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 190;
const ROOT_WIDTH = 300;
const ROOT_HEIGHT = 210;

export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  rootId?: string
): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 90 });

  nodes.forEach((node) => {
    const isRoot = rootId && node.id === rootId;
    g.setNode(node.id, {
      width: isRoot ? ROOT_WIDTH : NODE_WIDTH,
      height: isRoot ? ROOT_HEIGHT : NODE_HEIGHT,
    });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    const isRoot = rootId && node.id === rootId;
    const w = isRoot ? ROOT_WIDTH : NODE_WIDTH;
    const h = isRoot ? ROOT_HEIGHT : NODE_HEIGHT;
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - w / 2,
        y: nodeWithPosition.y - h / 2,
      },
    };
  });
}
