import { useAppStore } from '../../store/appStore';
import { SEQ_CONSTANTS } from '../../utils/sequenceLayout';

function rgbaToHex(color: string): string {
  const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!m) return color.startsWith('#') ? color : '#3b82f6';
  return '#' + [m[1], m[2], m[3]]
    .map((v) => parseInt(v).toString(16).padStart(2, '0'))
    .join('');
}

export default function ZoneProperties() {
  const selectedZoneId = useAppStore((s) => s.ui.selectedZoneId);
  const zone = useAppStore((s) =>
    (s.sequence[s.ui.activeMode].zones ?? []).find((z) => z.id === selectedZoneId),
  );
  const lifelines = useAppStore((s) => s.sequence[s.ui.activeMode].lifelines);
  const { updateZone, removeZone, selectZone } = useAppStore();

  if (!zone) return null;

  const sortedLifelines = [...lifelines].sort((a, b) => a.order - b.order);

  const toggleLifeline = (id: string) => {
    const next = zone.lifelineIds.includes(id)
      ? zone.lifelineIds.filter((l) => l !== id)
      : [...zone.lifelineIds, id];
    updateZone(zone.id, { lifelineIds: next });
  };

  const autoFit = () => {
    const { leftMargin, lifelineSpacing } = SEQ_CONSTANTS;
    const xs = zone.lifelineIds.map((id) => {
      const idx = sortedLifelines.findIndex((l) => l.id === id);
      return idx >= 0 ? leftMargin + idx * lifelineSpacing : null;
    }).filter((x): x is number => x !== null);
    if (xs.length === 0) return;
    const padding = lifelineSpacing / 2;
    updateZone(zone.id, {
      x: Math.max(0, Math.min(...xs) - padding),
      width: Math.max(...xs) - Math.min(...xs) + padding * 2,
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Bezeichnung</label>
        <input
          className="input"
          value={zone.label}
          onChange={(e) => updateZone(zone.id, { label: e.target.value })}
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="label">Hintergrund</label>
          <input
            type="color"
            className="w-full h-8 rounded border border-slate-200 cursor-pointer"
            value={rgbaToHex(zone.fillColor)}
            onChange={(e) => {
              const hex = e.target.value;
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              updateZone(zone.id, { fillColor: `rgba(${r},${g},${b},0.15)` });
            }}
          />
        </div>
        <div className="flex-1">
          <label className="label">Rahmen</label>
          <input
            type="color"
            className="w-full h-8 rounded border border-slate-200 cursor-pointer"
            value={zone.borderColor}
            onChange={(e) => updateZone(zone.id, { borderColor: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="label">Position X</label>
          <input
            className="input"
            type="number"
            min={0}
            step={10}
            value={Math.round(zone.x)}
            onChange={(e) => updateZone(zone.id, { x: Number(e.target.value) })}
          />
        </div>
        <div className="flex-1">
          <label className="label">Breite</label>
          <input
            className="input"
            type="number"
            min={60}
            step={10}
            value={Math.round(zone.width)}
            onChange={(e) => updateZone(zone.id, { width: Number(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <label className="label">Lebenslinien (informell)</label>
        <div className="flex flex-col gap-1">
          {sortedLifelines.map((ll) => (
            <label key={ll.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={zone.lifelineIds.includes(ll.id)}
                onChange={() => toggleLifeline(ll.id)}
                className="rounded"
              />
              <span className="text-xs text-slate-700 truncate">{ll.label}</span>
            </label>
          ))}
          {sortedLifelines.length === 0 && (
            <p className="text-[11px] text-slate-400">Keine Lebenslinien vorhanden</p>
          )}
        </div>
        {zone.lifelineIds.length > 0 && (
          <button
            className="mt-2 w-full text-xs text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 rounded py-1 transition-colors"
            onClick={autoFit}
            title="Bereich automatisch an gewählte Lebenslinien anpassen"
          >
            Auto-Fit zu Lebenslinien
          </button>
        )}
      </div>

      <button
        className="w-full btn-danger"
        onClick={() => { removeZone(zone.id); selectZone(null); }}
      >
        Bereich löschen
      </button>
    </div>
  );
}
