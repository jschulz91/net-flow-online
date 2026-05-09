import { useAppStore } from '../../store/appStore';

export default function LaneProperties() {
  const selectedLaneId = useAppStore((s) => s.ui.selectedLaneId);
  const lane = useAppStore((s) =>
    s.swimlane[s.ui.activeMode].lanes.find((l) => l.id === selectedLaneId),
  );
  const { renameLane, setLaneColor, removeLane, selectLane, resizeLane } = useAppStore();

  if (!lane) return null;

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Bezeichnung</label>
        <input
          className="input"
          value={lane.label}
          onChange={(e) => renameLane(lane.id, e.target.value)}
        />
      </div>
      <div>
        <label className="label">Hintergrundfarbe</label>
        <input
          type="color"
          className="w-full h-8 rounded border border-slate-200 cursor-pointer"
          value={lane.color.startsWith('rgba') ? '#f8fafc' : lane.color}
          onChange={(e) => {
            const hex = e.target.value;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            setLaneColor(lane.id, `rgba(${r},${g},${b},0.12)`);
          }}
        />
      </div>
      <div>
        <label className="label">Höhe (px)</label>
        <input
          className="input"
          type="number"
          min={80}
          step={40}
          value={lane.height}
          onChange={(e) => resizeLane(lane.id, Number(e.target.value))}
        />
      </div>
      <button
        className="w-full btn-danger"
        onClick={() => {
          if (confirm(`Lane "${lane.label}" und alle enthaltenen Elemente löschen?`)) {
            removeLane(lane.id);
            selectLane(null);
          }
        }}
      >
        Lane löschen
      </button>
    </div>
  );
}
