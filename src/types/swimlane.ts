import type { Node, Edge } from 'reactflow';

export type SwimLane = {
  id: string;
  label: string;
  color: string;
  order: number;
  height: number;
  collapsed: boolean;
};

export type NodeType =
  | 'process'
  | 'decision'
  | 'startEnd'
  | 'externalSystem'
  | 'database'
  | 'event'
  | 'document'
  | 'custom';

export type NodeData = {
  label: string;
  description: string;
  stepNumber?: number;
  color: string;
  borderColor: string;
  laneId: string;
  nodeType: NodeType;
};

export type EdgeLineStyle = 'solid' | 'dashed' | 'dotted';
export type EdgeArrowDirection = 'forward' | 'back' | 'both' | 'none';

export type EdgeData = {
  label: string;
  lineStyle: EdgeLineStyle;
  arrowDirection: EdgeArrowDirection;
  color: string;
};

export type FlowNode = Node<NodeData>;
export type FlowEdge = Edge<EdgeData>;

export type SwimlaneCanvas = {
  lanes: SwimLane[];
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport: { x: number; y: number; zoom: number };
  notes: import('./common').StickyNote[];
};
