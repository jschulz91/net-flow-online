import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useAppStore } from '../../store/appStore';
import { nodeTypes } from './Nodes/nodeTypes';
import { edgeTypes } from '../../edges/edgeTypes';
import SwimLaneBackground from './SwimLaneBackground';
import LaneLabelColumn from './LaneLabelColumn';
import NodePalette from './NodePalette';
import { computeLaneLayout, getLaneForY } from '../../utils/laneLayout';
import { NODE_COLORS, NODE_BORDER_COLORS } from '../../utils/colors';
import { nanoid } from '../../utils/nanoid';
import type { FlowNode } from '../../types';
import { PALETTE_ENTRIES } from './palette.config';
import { SwimlaneStickyNotes } from '../Notes/StickyNoteOverlay';

const LABEL_COLUMN_WIDTH = 144;

function SwimlaneCanvas() {
  const {
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    addLane,
    selectNode,
    selectEdge,
    setViewport,
  } = useAppStore();

  const activeMode = useAppStore((s) => s.ui.activeMode);
  const canvas = useAppStore((s) => s.swimlane[s.ui.activeMode]);
  const { screenToFlowPosition } = useReactFlow();

  const laneLayouts = computeLaneLayout(canvas.lanes);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData('application/reactflow-nodetype');
      if (!nodeType) return;

      const reactFlowBounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const position = screenToFlowPosition({
        x: e.clientX - reactFlowBounds.left - LABEL_COLUMN_WIDTH,
        y: e.clientY - reactFlowBounds.top,
      });

      const laneId = getLaneForY(position.y, laneLayouts) ?? canvas.lanes[0]?.id ?? '';
      const entry = PALETTE_ENTRIES.find((p) => p.nodeType === nodeType);

      const newNode: FlowNode = {
        id: nanoid(),
        type: nodeType,
        position,
        data: {
          label: entry?.label ?? 'Neuer Block',
          description: '',
          nodeType: nodeType as FlowNode['data']['nodeType'],
          laneId,
          color: entry?.defaultColor ?? NODE_COLORS.custom,
          borderColor: entry?.defaultBorderColor ?? NODE_BORDER_COLORS.custom,
        },
      };
      addNode(newNode);
    },
    [addNode, canvas.lanes, laneLayouts, screenToFlowPosition],
  );

  // Click-to-add: auto-create a lane if none exist, then place at a staggered position
  const handleNodeClick = useCallback(
    (nodeType: string) => {
      const { swimlane, ui } = useAppStore.getState();
      let lanes = swimlane[ui.activeMode].lanes;
      if (lanes.length === 0) {
        addLane();
        lanes = useAppStore.getState().swimlane[ui.activeMode].lanes;
      }
      const laneId = lanes[0]?.id ?? '';
      const existingCount = swimlane[ui.activeMode].nodes.length;
      const position = { x: 200 + (existingCount % 5) * 40, y: 60 + Math.floor(existingCount / 5) * 80 };
      const entry = PALETTE_ENTRIES.find((p) => p.nodeType === nodeType);
      const newNode: FlowNode = {
        id: nanoid(),
        type: nodeType,
        position,
        data: {
          label: entry?.label ?? 'Neuer Block',
          description: '',
          nodeType: nodeType as FlowNode['data']['nodeType'],
          laneId,
          color: entry?.defaultColor ?? NODE_COLORS.custom,
          borderColor: entry?.defaultBorderColor ?? NODE_BORDER_COLORS.custom,
        },
      };
      addNode(newNode);
    },
    [addLane, addNode],
  );

  return (
    <div className="flex-1 flex overflow-hidden">
      <NodePalette onNodeClick={handleNodeClick} />

      <div className="flex-1 relative overflow-hidden">
        {/* Lane label column overlay */}
        <div
          className="absolute top-0 left-0 bottom-0 pointer-events-none"
          style={{ width: LABEL_COLUMN_WIDTH, zIndex: 5 }}
        >
          <LaneLabelColumn lanes={canvas.lanes} layouts={laneLayouts} />
        </div>

        {/* ReactFlow canvas shifted right to make room for label column */}
        <div
          className="absolute top-0 right-0 bottom-0"
          style={{ left: LABEL_COLUMN_WIDTH }}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            key={activeMode}
            nodes={canvas.nodes}
            edges={canvas.edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={{ type: 'flowEdge' }}
            onNodeClick={(_, node) => selectNode(node.id)}
            onEdgeClick={(_, edge) => selectEdge(edge.id)}
            onPaneClick={() => { selectNode(null); selectEdge(null); }}
            onMoveEnd={(_, viewport) => setViewport(viewport)}
            defaultViewport={canvas.viewport}
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={2}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
          >
            <Background color="#e2e8f0" gap={16} />
            <SwimLaneBackground lanes={canvas.lanes} layouts={laneLayouts} />
            <SwimlaneStickyNotes />
            <Controls />
            <MiniMap zoomable pannable />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function SwimlaneEditor() {
  return (
    <ReactFlowProvider>
      <SwimlaneCanvas />
    </ReactFlowProvider>
  );
}
