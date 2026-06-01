import { create } from 'zustand';
import { produce } from 'immer';
import { nanoid } from '../utils/nanoid';
import { SEQ_CONSTANTS } from '../utils/sequenceLayout';
import type {
  DiagramMode,
  DiagramMeta,
  ViewType,
  NodeData,
  EdgeData,
  FlowNode,
  FlowEdge,
  SwimlaneCanvas,
  Lifeline,
  LifelineType,
  SequenceMessage,
  ActivationBar,
  SequenceFragment,
  SequenceZone,
  SequenceCanvas,
} from '../types';
import type { NodeChange, EdgeChange, Connection } from 'reactflow';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';

export type AppState = {
  meta: DiagramMeta;
  swimlane: Record<DiagramMode, SwimlaneCanvas>;
  sequence: Record<DiagramMode, SequenceCanvas>;
};

type UIState = {
  viewType: ViewType;
  activeMode: DiagramMode;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedLaneId: string | null;
  selectedLifelineId: string | null;
  selectedMessageId: string | null;
  selectedFragmentId: string | null;
  selectedZoneId: string | null;
  selectedBarId: string | null;
  showLeftPanel: boolean;
  showRightPanel: boolean;
  showInfoBlock: boolean;
};

type HistoryEntry = {
  swimlane: Record<DiagramMode, SwimlaneCanvas>;
  sequence: Record<DiagramMode, SequenceCanvas>;
};

const DEFAULT_LANE_HEIGHT = 160;
const DEFAULT_LANE_COLORS = [
  'rgba(59,130,246,0.08)',
  'rgba(16,185,129,0.08)',
  'rgba(245,158,11,0.08)',
  'rgba(239,68,68,0.08)',
  'rgba(139,92,246,0.08)',
];

function emptySwimCanvas(): SwimlaneCanvas {
  return { lanes: [], nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 }, notes: [] };
}

function emptySequenceCanvas(): SequenceCanvas {
  return { lifelines: [], messages: [], activationBars: [], fragments: [], zones: [], notes: [] };
}

const defaultMeta: DiagramMeta = {
  title: 'Neues Diagramm',
  creator: '',
  version: '1.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  description: '',
};

type Store = AppState & {
  ui: UIState;
  past: HistoryEntry[];
  future: HistoryEntry[];

  // Meta
  updateMeta: (patch: Partial<DiagramMeta>) => void;

  // UI
  setViewType: (vt: ViewType) => void;
  setMode: (mode: DiagramMode) => void;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  selectLane: (id: string | null) => void;
  selectLifeline: (id: string | null) => void;
  selectMessage: (id: string | null) => void;
  selectFragment: (id: string | null) => void;
  selectZone: (id: string | null) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleInfoBlock: () => void;

  // Notes
  addNote: () => void;
  updateNote: (id: string, patch: Partial<import('../types').StickyNote>) => void;
  removeNote: (id: string) => void;

  // Swimlane – Lanes
  addLane: () => void;
  removeLane: (id: string) => void;
  renameLane: (id: string, label: string) => void;
  reorderLane: (id: string, newOrder: number) => void;
  resizeLane: (id: string, height: number) => void;
  setLaneColor: (id: string, color: string) => void;

  // Swimlane – Nodes
  addNode: (node: FlowNode) => void;
  updateNode: (id: string, patch: Partial<NodeData>) => void;
  removeNode: (id: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;

  // Swimlane – Edges
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  updateEdge: (id: string, patch: Partial<EdgeData>) => void;
  removeEdge: (id: string) => void;

  // Swimlane – Viewport
  setViewport: (vp: { x: number; y: number; zoom: number }) => void;

  // Sequence – Lifelines
  addLifeline: (type: LifelineType) => void;
  removeLifeline: (id: string) => void;
  updateLifeline: (id: string, patch: Partial<Lifeline>) => void;
  reorderLifeline: (id: string, newOrder: number) => void;

  // Sequence – Messages
  addMessage: (msg: Omit<SequenceMessage, 'id' | 'order'>) => void;
  removeMessage: (id: string) => void;
  updateMessage: (id: string, patch: Partial<SequenceMessage>) => void;
  reorderMessage: (id: string, newOrder: number) => void;

  // Sequence – Activation Bars
  addActivationBar: (bar: Omit<ActivationBar, 'id'>) => void;
  updateActivationBar: (id: string, patch: Partial<Pick<ActivationBar, 'y' | 'height'>>) => void;
  removeActivationBar: (id: string) => void;
  selectBar: (id: string | null) => void;

  // Sequence – Fragments
  addFragment: (frag: Omit<SequenceFragment, 'id'>) => void;
  removeFragment: (id: string) => void;
  updateFragment: (id: string, patch: Partial<SequenceFragment>) => void;

  // Sequence – Zones
  addZone: (lifelineIds: string[]) => void;
  removeZone: (id: string) => void;
  updateZone: (id: string, patch: Partial<SequenceZone>) => void;

  // Copy + History
  copyIstToSoll: (targetViewType: ViewType) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Persistence
  loadState: (state: AppState) => void;
};

export const useAppStore = create<Store>((set, get) => ({
  meta: { ...defaultMeta },
  swimlane: {
    IST: emptySwimCanvas(),
    SOLL: emptySwimCanvas(),
  },
  sequence: {
    IST: emptySequenceCanvas(),
    SOLL: emptySequenceCanvas(),
  },
  ui: {
    viewType: 'swimlane',
    activeMode: 'IST',
    selectedNodeId: null,
    selectedEdgeId: null,
    selectedLaneId: null,
    selectedLifelineId: null,
    selectedMessageId: null,
    selectedFragmentId: null,
    selectedZoneId: null,
    selectedBarId: null,
    showLeftPanel: true,
    showRightPanel: true,
    showInfoBlock: true,
  },
  past: [],
  future: [],

  updateMeta: (patch) =>
    set(
      produce((s: Store) => {
        Object.assign(s.meta, patch);
        s.meta.updatedAt = new Date().toISOString();
      }),
    ),

  setViewType: (vt) =>
    set(
      produce((s: Store) => {
        s.ui.viewType = vt;
        s.ui.selectedNodeId = null;
        s.ui.selectedEdgeId = null;
        s.ui.selectedLaneId = null;
        s.ui.selectedLifelineId = null;
        s.ui.selectedMessageId = null;
      }),
    ),

  setMode: (mode) =>
    set(
      produce((s: Store) => {
        s.ui.activeMode = mode;
        s.ui.selectedNodeId = null;
        s.ui.selectedEdgeId = null;
      }),
    ),

  selectNode: (id) =>
    set(
      produce((s: Store) => {
        s.ui.selectedNodeId = id;
        s.ui.selectedEdgeId = null;
        s.ui.selectedLaneId = null;
      }),
    ),

  selectEdge: (id) =>
    set(
      produce((s: Store) => {
        s.ui.selectedEdgeId = id;
        s.ui.selectedNodeId = null;
        s.ui.selectedLaneId = null;
      }),
    ),

  selectLane: (id) =>
    set(
      produce((s: Store) => {
        s.ui.selectedLaneId = id;
        s.ui.selectedNodeId = null;
        s.ui.selectedEdgeId = null;
      }),
    ),

  selectLifeline: (id) =>
    set(
      produce((s: Store) => {
        s.ui.selectedLifelineId = id;
        s.ui.selectedMessageId = null;
      }),
    ),

  selectMessage: (id) =>
    set(
      produce((s: Store) => {
        s.ui.selectedMessageId = id;
        s.ui.selectedLifelineId = null;
      }),
    ),

  selectFragment: (id) =>
    set(
      produce((s: Store) => {
        s.ui.selectedFragmentId = id;
      }),
    ),

  selectZone: (id) =>
    set(
      produce((s: Store) => {
        s.ui.selectedZoneId = id;
        if (id) {
          s.ui.selectedLifelineId = null;
          s.ui.selectedMessageId = null;
        }
      }),
    ),

  selectBar: (id) =>
    set(
      produce((s: Store) => {
        s.ui.selectedBarId = id;
        if (id) {
          s.ui.selectedLifelineId = null;
          s.ui.selectedMessageId = null;
        }
      }),
    ),

  toggleLeftPanel:  () => set(produce((s: Store) => { s.ui.showLeftPanel  = !s.ui.showLeftPanel;  })),
  toggleRightPanel: () => set(produce((s: Store) => { s.ui.showRightPanel = !s.ui.showRightPanel; })),
  toggleInfoBlock:  () => set(produce((s: Store) => { s.ui.showInfoBlock  = !s.ui.showInfoBlock;  })),

  addNote: () =>
    set(produce((s: Store) => {
      const { viewType, activeMode } = s.ui;
      const canvas = viewType === 'swimlane' ? s.swimlane[activeMode] : s.sequence[activeMode];
      const offset = (canvas.notes.length % 6) * 24;
      canvas.notes.push({
        id: nanoid(),
        x: 80 + offset,
        y: 80 + offset,
        text: '',
        color: '#fef08a',
        width: 180,
      });
    })),

  updateNote: (id, patch) =>
    set(produce((s: Store) => {
      const { viewType, activeMode } = s.ui;
      const canvas = viewType === 'swimlane' ? s.swimlane[activeMode] : s.sequence[activeMode];
      const note = canvas.notes.find((n) => n.id === id);
      if (note) Object.assign(note, patch);
    })),

  removeNote: (id) =>
    set(produce((s: Store) => {
      const { viewType, activeMode } = s.ui;
      const canvas = viewType === 'swimlane' ? s.swimlane[activeMode] : s.sequence[activeMode];
      canvas.notes = canvas.notes.filter((n) => n.id !== id);
    })),

  // ---- Swimlane Lanes ----

  addLane: () => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        const mode = s.ui.activeMode;
        const lanes = s.swimlane[mode].lanes;
        const order = lanes.length;
        lanes.push({
          id: nanoid(),
          label: `Lane ${order + 1}`,
          color: DEFAULT_LANE_COLORS[order % DEFAULT_LANE_COLORS.length],
          order,
          height: DEFAULT_LANE_HEIGHT,
          collapsed: false,
        });
      }),
    );
  },

  removeLane: (id) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        const mode = s.ui.activeMode;
        const canvas = s.swimlane[mode];
        canvas.lanes = canvas.lanes.filter((l) => l.id !== id);
        canvas.lanes.forEach((l, i) => (l.order = i));
        canvas.nodes = canvas.nodes.filter((n) => n.data.laneId !== id);
      }),
    );
  },

  renameLane: (id, label) =>
    set(
      produce((s: Store) => {
        const lane = s.swimlane[s.ui.activeMode].lanes.find((l) => l.id === id);
        if (lane) lane.label = label;
      }),
    ),

  reorderLane: (id, newOrder) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        const lanes = s.swimlane[s.ui.activeMode].lanes;
        const lane = lanes.find((l) => l.id === id);
        if (!lane) return;
        const oldOrder = lane.order;
        if (oldOrder === newOrder) return;
        lanes.forEach((l) => {
          if (oldOrder < newOrder) {
            if (l.order > oldOrder && l.order <= newOrder) l.order--;
          } else {
            if (l.order >= newOrder && l.order < oldOrder) l.order++;
          }
        });
        lane.order = newOrder;
      }),
    );
  },

  resizeLane: (id, height) =>
    set(
      produce((s: Store) => {
        const lane = s.swimlane[s.ui.activeMode].lanes.find((l) => l.id === id);
        if (lane) lane.height = Math.max(80, height);
      }),
    ),

  setLaneColor: (id, color) =>
    set(
      produce((s: Store) => {
        const lane = s.swimlane[s.ui.activeMode].lanes.find((l) => l.id === id);
        if (lane) lane.color = color;
      }),
    ),

  // ---- Swimlane Nodes ----

  addNode: (node) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        s.swimlane[s.ui.activeMode].nodes.push(node);
      }),
    );
  },

  updateNode: (id, patch) =>
    set(
      produce((s: Store) => {
        const node = s.swimlane[s.ui.activeMode].nodes.find((n) => n.id === id);
        if (node) Object.assign(node.data, patch);
      }),
    ),

  removeNode: (id) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        const canvas = s.swimlane[s.ui.activeMode];
        canvas.nodes = canvas.nodes.filter((n) => n.id !== id);
        canvas.edges = canvas.edges.filter((e) => e.source !== id && e.target !== id);
      }),
    );
  },

  onNodesChange: (changes) =>
    set(
      produce((s: Store) => {
        const canvas = s.swimlane[s.ui.activeMode];
        canvas.nodes = applyNodeChanges(changes, canvas.nodes) as FlowNode[];
      }),
    ),

  // ---- Swimlane Edges ----

  onEdgesChange: (changes) =>
    set(
      produce((s: Store) => {
        const canvas = s.swimlane[s.ui.activeMode];
        canvas.edges = applyEdgeChanges(changes, canvas.edges) as FlowEdge[];
      }),
    ),

  onConnect: (connection) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        const canvas = s.swimlane[s.ui.activeMode];
        const newEdge = addEdge(
          {
            ...connection,
            type: 'flowEdge',
            data: { label: '', lineStyle: 'solid', arrowDirection: 'forward', color: '#64748b' },
          },
          canvas.edges,
        );
        canvas.edges = newEdge as FlowEdge[];
      }),
    );
  },

  updateEdge: (id, patch) =>
    set(
      produce((s: Store) => {
        const edge = s.swimlane[s.ui.activeMode].edges.find((e) => e.id === id);
        if (edge) Object.assign(edge.data!, patch);
      }),
    ),

  removeEdge: (id) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        const canvas = s.swimlane[s.ui.activeMode];
        canvas.edges = canvas.edges.filter((e) => e.id !== id);
      }),
    );
  },

  setViewport: (vp) =>
    set(
      produce((s: Store) => {
        s.swimlane[s.ui.activeMode].viewport = vp;
      }),
    ),

  // ---- Sequence Lifelines ----

  addLifeline: (type) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        const mode = s.ui.activeMode;
        const lifelines = s.sequence[mode].lifelines;
        lifelines.push({
          id: nanoid(),
          label: type === 'actor' ? 'Akteur' : type === 'database' ? 'Datenbank' : 'System',
          description: '',
          type,
          color: '#3b82f6',
          order: lifelines.length,
        });
      }),
    );
  },

  removeLifeline: (id) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        const mode = s.ui.activeMode;
        const canvas = s.sequence[mode];
        canvas.lifelines = canvas.lifelines.filter((l) => l.id !== id);
        canvas.lifelines.forEach((l, i) => (l.order = i));
        canvas.messages = canvas.messages.filter(
          (m) => m.fromLifelineId !== id && m.toLifelineId !== id,
        );
        canvas.activationBars = canvas.activationBars.filter((b) => b.lifelineId !== id);
        // Remove lifeline from zones; zones with no lifelines left keep existing (not deleted)
        canvas.zones = (canvas.zones ?? []).map((z) => ({
          ...z,
          lifelineIds: z.lifelineIds.filter((lid) => lid !== id),
        }));
      }),
    );
  },

  updateLifeline: (id, patch) =>
    set(
      produce((s: Store) => {
        const ll = s.sequence[s.ui.activeMode].lifelines.find((l) => l.id === id);
        if (ll) Object.assign(ll, patch);
      }),
    ),

  reorderLifeline: (id, newOrder) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        const lifelines = s.sequence[s.ui.activeMode].lifelines;
        const ll = lifelines.find((l) => l.id === id);
        if (!ll) return;
        const oldOrder = ll.order;
        if (oldOrder === newOrder) return;
        lifelines.forEach((l) => {
          if (oldOrder < newOrder) {
            if (l.order > oldOrder && l.order <= newOrder) l.order--;
          } else {
            if (l.order >= newOrder && l.order < oldOrder) l.order++;
          }
        });
        ll.order = newOrder;
      }),
    );
  },

  // ---- Sequence Messages ----

  addMessage: (msg) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        const messages = s.sequence[s.ui.activeMode].messages;
        const order = messages.length > 0 ? Math.max(...messages.map((m) => m.order)) + 1 : 0;
        messages.push({ id: nanoid(), order, ...msg });
        messages.sort((a, b) => a.order - b.order);
      }),
    );
  },

  removeMessage: (id) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        const canvas = s.sequence[s.ui.activeMode];
        canvas.messages = canvas.messages.filter((m) => m.id !== id);
        canvas.messages.forEach((m, i) => (m.order = i));
        // Activation bars are no longer message-linked; leave them as-is on message delete
      }),
    );
  },

  updateMessage: (id, patch) =>
    set(
      produce((s: Store) => {
        const msg = s.sequence[s.ui.activeMode].messages.find((m) => m.id === id);
        if (msg) Object.assign(msg, patch);
      }),
    ),

  reorderMessage: (id, newOrder) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        const messages = s.sequence[s.ui.activeMode].messages;
        const msg = messages.find((m) => m.id === id);
        if (!msg) return;
        const oldOrder = msg.order;
        if (oldOrder === newOrder) return;
        messages.forEach((m) => {
          if (oldOrder < newOrder) {
            if (m.order > oldOrder && m.order <= newOrder) m.order--;
          } else {
            if (m.order >= newOrder && m.order < oldOrder) m.order++;
          }
        });
        msg.order = newOrder;
        messages.sort((a, b) => a.order - b.order);
      }),
    );
  },

  // ---- Sequence Activation Bars ----

  addActivationBar: (bar) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        s.sequence[s.ui.activeMode].activationBars.push({ id: nanoid(), ...bar });
      }),
    );
  },

  updateActivationBar: (id, patch) =>
    set(
      produce((s: Store) => {
        const bar = s.sequence[s.ui.activeMode].activationBars.find((b) => b.id === id);
        if (!bar) return;
        if (patch.y !== undefined) bar.y = patch.y;
        if (patch.height !== undefined) bar.height = Math.max(20, patch.height);
      }),
    ),

  removeActivationBar: (id) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        const canvas = s.sequence[s.ui.activeMode];
        canvas.activationBars = canvas.activationBars.filter((b) => b.id !== id);
      }),
    );
  },

  // ---- Sequence Fragments ----

  addFragment: (frag) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        s.sequence[s.ui.activeMode].fragments.push({ id: nanoid(), ...frag });
      }),
    );
  },

  removeFragment: (id) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        const canvas = s.sequence[s.ui.activeMode];
        canvas.fragments = canvas.fragments.filter((f) => f.id !== id);
      }),
    );
  },

  updateFragment: (id, patch) =>
    set(
      produce((s: Store) => {
        const frag = s.sequence[s.ui.activeMode].fragments.find((f) => f.id === id);
        if (frag) Object.assign(frag, patch);
      }),
    ),

  // ---- Sequence Zones ----

  addZone: (lifelineIds) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        const mode = s.ui.activeMode;
        const canvas = s.sequence[mode];
        const { leftMargin, lifelineSpacing } = SEQ_CONSTANTS;
        const sorted = [...canvas.lifelines].sort((a, b) => a.order - b.order);
        // Compute x positions of selected lifelines
        const xs = lifelineIds
          .map((id) => {
            const idx = sorted.findIndex((l) => l.id === id);
            return idx >= 0 ? leftMargin + idx * lifelineSpacing : null;
          })
          .filter((x): x is number => x !== null);
        const padding = lifelineSpacing / 2;
        const x = xs.length > 0
          ? Math.max(4, Math.min(...xs) - padding)
          : leftMargin - padding;
        const w = xs.length > 0
          ? Math.max(...xs) - Math.min(...xs) + padding * 2
          : lifelineSpacing;
        // Offset new zones slightly so they don't stack exactly
        const existingCount = canvas.zones.length;
        canvas.zones.push({
          id: nanoid(),
          label: 'Bereich',
          lifelineIds,
          x: x + existingCount * 8,
          width: Math.max(w, lifelineSpacing),
          fillColor: 'rgba(59,130,246,0.12)',
          borderColor: '#93c5fd',
        });
      }),
    );
  },

  removeZone: (id) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        const canvas = s.sequence[s.ui.activeMode];
        canvas.zones = canvas.zones.filter((z) => z.id !== id);
      }),
    );
  },

  updateZone: (id, patch) =>
    set(
      produce((s: Store) => {
        const zone = s.sequence[s.ui.activeMode].zones.find((z) => z.id === id);
        if (zone) Object.assign(zone, patch);
      }),
    ),

  // ---- Copy IST → SOLL ----

  copyIstToSoll: (targetViewType) => {
    get().pushHistory();
    set(
      produce((s: Store) => {
        if (targetViewType === 'swimlane') {
          s.swimlane.SOLL = JSON.parse(JSON.stringify(s.swimlane.IST));
          s.swimlane.SOLL.viewport = { x: 0, y: 0, zoom: 1 };
        } else {
          s.sequence.SOLL = JSON.parse(JSON.stringify(s.sequence.IST));
        }
      }),
    );
  },

  // ---- History ----

  pushHistory: () =>
    set(
      produce((s: Store) => {
        s.past.push({
          swimlane: JSON.parse(JSON.stringify(s.swimlane)),
          sequence: JSON.parse(JSON.stringify(s.sequence)),
        });
        if (s.past.length > 50) s.past.shift();
        s.future = [];
      }),
    ),

  undo: () =>
    set(
      produce((s: Store) => {
        const entry = s.past.pop();
        if (!entry) return;
        s.future.push({
          swimlane: JSON.parse(JSON.stringify(s.swimlane)),
          sequence: JSON.parse(JSON.stringify(s.sequence)),
        });
        s.swimlane = entry.swimlane;
        s.sequence = entry.sequence;
      }),
    ),

  redo: () =>
    set(
      produce((s: Store) => {
        const entry = s.future.pop();
        if (!entry) return;
        s.past.push({
          swimlane: JSON.parse(JSON.stringify(s.swimlane)),
          sequence: JSON.parse(JSON.stringify(s.sequence)),
        });
        s.swimlane = entry.swimlane;
        s.sequence = entry.sequence;
      }),
    ),

  // ---- Persistence ----

  loadState: (state) =>
    set(
      produce((s: Store) => {
        s.meta = state.meta;
        s.swimlane = state.swimlane;
        s.sequence = state.sequence;
        // Migrate: ensure new fields exist in older saved files
        for (const mode of ['IST', 'SOLL'] as const) {
          if (!s.sequence[mode].zones)  s.sequence[mode].zones  = [];
          if (!s.sequence[mode].notes)  s.sequence[mode].notes  = [];
          if (!s.swimlane[mode].notes)  s.swimlane[mode].notes  = [];
        }
        s.past = [];
        s.future = [];
        s.ui.selectedNodeId = null;
        s.ui.selectedEdgeId = null;
        s.ui.selectedLaneId = null;
        s.ui.selectedLifelineId = null;
        s.ui.selectedMessageId = null;
        s.ui.selectedZoneId = null;
        s.ui.selectedBarId = null;
      }),
    ),
}));
