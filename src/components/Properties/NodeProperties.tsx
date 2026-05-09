import { useAppStore } from '../../store/appStore';
import type { NodeData, NodeType } from '../../types';
import { NODE_COLORS, NODE_BORDER_COLORS } from '../../utils/colors';

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  process: 'Prozess',
  decision: 'Entscheidung',
  startEnd: 'Start / Ende',
  externalSystem: 'Ext. System',
  database: 'Datenbank',
  event: 'Event',
  document: 'Dokument',
  custom: 'Benutzerdefiniert',
};

export default function NodeProperties() {
  const selectedNodeId = useAppStore((s) => s.ui.selectedNodeId);
  const node = useAppStore((s) =>
    s.swimlane[s.ui.activeMode].nodes.find((n) => n.id === selectedNodeId),
  );
  const lanes = useAppStore((s) => s.swimlane[s.ui.activeMode].lanes);
  const { updateNode } = useAppStore();

  if (!node) return null;
  const d = node.data;

  const update = (patch: Partial<NodeData>) => updateNode(node.id, patch);

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Typ</label>
        <select
          className="input"
          value={d.nodeType}
          onChange={(e) => {
            const t = e.target.value as NodeType;
            update({ nodeType: t, color: NODE_COLORS[t], borderColor: NODE_BORDER_COLORS[t] });
          }}
        >
          {Object.entries(NODE_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Bezeichnung</label>
        <input
          className="input"
          value={d.label}
          onChange={(e) => update({ label: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Beschreibung / Tooltip</label>
        <textarea
          className="input resize-none"
          rows={3}
          value={d.description}
          onChange={(e) => update({ description: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Schritt-Nr.</label>
        <input
          className="input"
          type="number"
          min={1}
          placeholder="(leer = kein Badge)"
          value={d.stepNumber ?? ''}
          onChange={(e) =>
            update({ stepNumber: e.target.value ? Number(e.target.value) : undefined })
          }
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="label">Füllfarbe</label>
          <input type="color" className="w-full h-8 rounded border border-slate-200 cursor-pointer" value={d.color} onChange={(e) => update({ color: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="label">Rahmenfarbe</label>
          <input type="color" className="w-full h-8 rounded border border-slate-200 cursor-pointer" value={d.borderColor} onChange={(e) => update({ borderColor: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="label">Lane</label>
        <select
          className="input"
          value={d.laneId}
          onChange={(e) => update({ laneId: e.target.value })}
        >
          {[...lanes].sort((a, b) => a.order - b.order).map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
