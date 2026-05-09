import { useAppStore } from '../../store/appStore';
import type { MessageType } from '../../types';

const MSG_TYPE_LABELS: Record<MessageType, string> = {
  sync: 'Synchron (→)',
  async: 'Asynchron (→ offen)',
  return: 'Rückgabe (-- →)',
  self: 'Selbst-Aufruf',
  create: 'Erstellen (-- →)',
  destroy: 'Zerstören (→ ×)',
};

export default function MessageProperties() {
  const selectedMessageId = useAppStore((s) => s.ui.selectedMessageId);
  const message = useAppStore((s) =>
    s.sequence[s.ui.activeMode].messages.find((m) => m.id === selectedMessageId),
  );
  const lifelines = useAppStore((s) => s.sequence[s.ui.activeMode].lifelines);
  const { updateMessage, removeMessage, selectMessage } = useAppStore();

  if (!message) return null;

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Typ</label>
        <select
          className="input"
          value={message.type}
          onChange={(e) => updateMessage(message.id, { type: e.target.value as MessageType })}
        >
          {Object.entries(MSG_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Bezeichnung / Methodenname</label>
        <input
          className="input"
          value={message.label}
          onChange={(e) => updateMessage(message.id, { label: e.target.value })}
          placeholder="z.B. createOrder(id, qty)"
        />
      </div>
      <div>
        <label className="label">Von</label>
        <select
          className="input"
          value={message.fromLifelineId}
          onChange={(e) => updateMessage(message.id, { fromLifelineId: e.target.value })}
        >
          {[...lifelines].sort((a, b) => a.order - b.order).map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
      </div>
      <button
        className="w-full text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded py-1 transition-colors"
        title="Richtung tauschen"
        onClick={() =>
          updateMessage(message.id, {
            fromLifelineId: message.toLifelineId,
            toLifelineId: message.fromLifelineId,
          })
        }
      >
        ⇄ Richtung tauschen
      </button>
      <div>
        <label className="label">An</label>
        <select
          className="input"
          value={message.toLifelineId}
          onChange={(e) => updateMessage(message.id, { toLifelineId: e.target.value })}
        >
          {[...lifelines].sort((a, b) => a.order - b.order).map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Notiz</label>
        <input
          className="input"
          value={message.note}
          onChange={(e) => updateMessage(message.id, { note: e.target.value })}
          placeholder="optionale Erklärung"
        />
      </div>
      <button
        className="w-full btn-danger"
        onClick={() => {
          removeMessage(message.id);
          selectMessage(null);
        }}
      >
        Nachricht löschen
      </button>
    </div>
  );
}
