import { useAppStore } from '../../store/appStore';
import type { EdgeLineStyle, EdgeArrowDirection } from '../../types';
import { EDGE_COLORS } from '../../utils/colors';

const LINE_STYLE_LABELS: Record<EdgeLineStyle, string> = {
  solid: 'Durchgezogen (Sync)',
  dashed: 'Gestrichelt (Async)',
  dotted: 'Gepunktet (Event)',
};

const ARROW_DIR_LABELS: Record<EdgeArrowDirection, string> = {
  forward: 'Vorwärts (→)',
  back: 'Rückwärts (←)',
  both: 'Beidseitig (↔)',
  none: 'Kein Pfeil',
};

export default function EdgeProperties() {
  const selectedEdgeId = useAppStore((s) => s.ui.selectedEdgeId);
  const edge = useAppStore((s) =>
    s.swimlane[s.ui.activeMode].edges.find((e) => e.id === selectedEdgeId),
  );
  const { updateEdge } = useAppStore();

  if (!edge?.data) return null;
  const d = edge.data;

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Bezeichnung / Interface</label>
        <input
          className="input"
          value={d.label}
          onChange={(e) => updateEdge(edge.id, { label: e.target.value })}
          placeholder="z.B. REST API, OPC-UA..."
        />
      </div>
      <div>
        <label className="label">Linienstil</label>
        <select
          className="input"
          value={d.lineStyle}
          onChange={(e) => updateEdge(edge.id, { lineStyle: e.target.value as EdgeLineStyle })}
        >
          {Object.entries(LINE_STYLE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Pfeilrichtung</label>
        <select
          className="input"
          value={d.arrowDirection}
          onChange={(e) => updateEdge(edge.id, { arrowDirection: e.target.value as EdgeArrowDirection })}
        >
          {Object.entries(ARROW_DIR_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Farbe</label>
        <div className="flex flex-wrap gap-1 mb-1">
          {EDGE_COLORS.map((c) => (
            <button
              key={c}
              className={`w-6 h-6 rounded border-2 ${d.color === c ? 'border-blue-500' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
              onClick={() => updateEdge(edge.id, { color: c })}
            />
          ))}
        </div>
        <input type="color" className="w-full h-8 rounded border border-slate-200 cursor-pointer" value={d.color} onChange={(e) => updateEdge(edge.id, { color: e.target.value })} />
      </div>
    </div>
  );
}
