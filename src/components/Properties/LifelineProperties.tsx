import { useAppStore } from '../../store/appStore';
import type { LifelineType } from '../../types';

const LIFELINE_TYPE_LABELS: Record<LifelineType, string> = {
  actor: 'Akteur (Mensch)',
  system: 'System / Komponente',
  database: 'Datenbank',
  boundary: 'Boundary (UI / Interface)',
  control: 'Control (Controller)',
  entity: 'Entity (Datenentität)',
  custom: 'Benutzerdefiniert',
};

export const ICON_OPTIONS = [
  // IT / Systems
  '💻', '🖥️', '📱', '⚙️', '🔧', '🔌', '📡', '🌐', '🏭', '🖨️',
  // People
  '👤', '👥', '🧑‍💻', '👨‍🔧', '👷',
  // Data / Documents
  '🗄️', '📊', '📁', '📄', '📋', '🔑',
  // Communication / Events
  '📨', '🔔', '⚡', '🔗', '🔄', '✅', '❌', '⚠️',
  // Generic shapes
  '▪', '◯', '△', '★', '⬡',
];

export default function LifelineProperties() {
  const selectedLifelineId = useAppStore((s) => s.ui.selectedLifelineId);
  const lifeline = useAppStore((s) =>
    s.sequence[s.ui.activeMode].lifelines.find((l) => l.id === selectedLifelineId),
  );
  const { updateLifeline, removeLifeline, selectLifeline } = useAppStore();

  if (!lifeline) return null;

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Typ</label>
        <select
          className="input"
          value={lifeline.type}
          onChange={(e) => updateLifeline(lifeline.id, { type: e.target.value as LifelineType })}
        >
          {Object.entries(LIFELINE_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {lifeline.type === 'custom' && (
        <div>
          <label className="label">Icon</label>
          <div className="grid grid-cols-5 gap-1 p-2 bg-slate-50 rounded border border-slate-200 max-h-40 overflow-y-auto">
            {ICON_OPTIONS.map((icon) => (
              <button
                key={icon}
                onClick={() => updateLifeline(lifeline.id, { icon })}
                className={`text-lg h-8 w-full rounded flex items-center justify-center transition-colors ${
                  lifeline.icon === icon
                    ? 'bg-blue-100 ring-2 ring-blue-400'
                    : 'hover:bg-slate-200'
                }`}
                title={icon}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="label">Bezeichnung</label>
        <input
          className="input"
          value={lifeline.label}
          onChange={(e) => updateLifeline(lifeline.id, { label: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Beschreibung</label>
        <textarea
          className="input resize-none"
          rows={2}
          value={lifeline.description}
          onChange={(e) => updateLifeline(lifeline.id, { description: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Farbe</label>
        <input
          type="color"
          className="w-full h-8 rounded border border-slate-200 cursor-pointer"
          value={lifeline.color}
          onChange={(e) => updateLifeline(lifeline.id, { color: e.target.value })}
        />
      </div>
      <button
        className="w-full btn-danger"
        onClick={() => {
          if (confirm(`Lebenslinie "${lifeline.label}" löschen?`)) {
            removeLifeline(lifeline.id);
            selectLifeline(null);
          }
        }}
      >
        Lebenslinie löschen
      </button>
    </div>
  );
}
