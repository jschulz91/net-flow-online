import { useAppStore } from '../../store/appStore';
import type { LifelineType, MessageType } from '../../types';

const LIFELINE_TYPES: { type: LifelineType; label: string; icon: string }[] = [
  { type: 'actor', label: 'Akteur', icon: '👤' },
  { type: 'system', label: 'System', icon: '⬜' },
  { type: 'database', label: 'Datenbank', icon: '🗄️' },
  { type: 'boundary', label: 'Boundary', icon: '⊏' },
  { type: 'control', label: 'Control', icon: '⟳' },
  { type: 'entity', label: 'Entity', icon: '◯' },
  { type: 'custom', label: 'Benutzerd.', icon: '▪' },
];

const MSG_TYPES: { type: MessageType; label: string; desc: string }[] = [
  { type: 'sync', label: 'Synchron', desc: '→ (ausgefüllt)' },
  { type: 'async', label: 'Asynchron', desc: '→ (offen)' },
  { type: 'return', label: 'Rückgabe', desc: '-- →' },
  { type: 'self', label: 'Selbst', desc: '↩ Selbstaufruf' },
  { type: 'create', label: 'Erstellen', desc: 'create →' },
  { type: 'destroy', label: 'Zerstören', desc: '→ ×' },
];

export default function LifelinePalette() {
  const { addLifeline, addMessage, addZone, sequence, ui } = useAppStore();
  const selectedLifelineId = useAppStore((s) => s.ui.selectedLifelineId);

  const lifelines = sequence[ui.activeMode].lifelines;

  const handleAddMessage = (type: MessageType) => {
    if (lifelines.length < 2) {
      alert('Mindestens 2 Lebenslinien erforderlich, um eine Nachricht hinzuzufügen.');
      return;
    }
    const sorted = [...lifelines].sort((a, b) => a.order - b.order);
    // Use the selected lifeline as starting point if it exists
    const fromId =
      selectedLifelineId && lifelines.find((l) => l.id === selectedLifelineId)
        ? selectedLifelineId
        : sorted[0].id;
    const toId = sorted.find((l) => l.id !== fromId)?.id ?? sorted[1].id;
    addMessage({ fromLifelineId: fromId, toLifelineId: toId, label: '', type, note: '' });
  };

  return (
    <div className="w-36 bg-white border-r border-slate-200 flex flex-col overflow-y-auto shrink-0">
      <div className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
        Lebenslinien
      </div>
      <div className="flex flex-col gap-1 p-2">
        {LIFELINE_TYPES.map((entry) => (
          <button
            key={entry.type}
            onClick={() => addLifeline(entry.type)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-colors text-left"
          >
            <span>{entry.icon}</span>
            <span>{entry.label}</span>
          </button>
        ))}
      </div>

      <div className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-b border-slate-100 mt-1">
        Nachrichten
      </div>
      <div className="flex flex-col gap-1 p-2">
        {MSG_TYPES.map((entry) => (
          <button
            key={entry.type}
            onClick={() => handleAddMessage(entry.type)}
            className="px-2 py-1.5 rounded text-xs font-medium text-slate-700 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 hover:border-purple-300 transition-colors text-left"
            title={entry.desc}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-b border-slate-100 mt-1">
        Bereiche
      </div>
      <div className="p-2">
        <button
          onClick={() => {
            const sorted = [...lifelines].sort((a, b) => a.order - b.order);
            // Use selected lifeline as initial member, else first two
            const initial = selectedLifelineId && lifelines.find((l) => l.id === selectedLifelineId)
              ? [selectedLifelineId]
              : sorted.slice(0, Math.min(2, sorted.length)).map((l) => l.id);
            addZone(initial);
          }}
          className="w-full px-2 py-1.5 rounded text-xs font-medium text-slate-700 bg-slate-50 hover:bg-orange-50 hover:text-orange-700 border border-slate-200 hover:border-orange-300 transition-colors text-left"
          title="Gestrichelten Bereich um Lebenslinien hinzufügen"
        >
          + Bereich
        </button>
      </div>
    </div>
  );
}
