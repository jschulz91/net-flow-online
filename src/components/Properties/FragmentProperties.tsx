import { useAppStore } from '../../store/appStore';
import type { FragmentType } from '../../types';

const FRAGMENT_TYPE_LABELS: Record<FragmentType, string> = {
  alt:  'alt – Alternative',
  opt:  'opt – Optional',
  loop: 'loop – Schleife',
  par:  'par – Parallel',
  ref:  'ref – Referenz',
};

export default function FragmentProperties() {
  const selectedFragmentId = useAppStore((s) => s.ui.selectedFragmentId);
  const fragment = useAppStore((s) =>
    s.sequence[s.ui.activeMode].fragments.find((f) => f.id === selectedFragmentId),
  );
  const messages = useAppStore((s) => s.sequence[s.ui.activeMode].messages);
  const { updateFragment, removeFragment, selectFragment } = useAppStore();

  if (!fragment) return null;

  const sortedMsgs = [...messages].sort((a, b) => a.order - b.order);
  const maxOrder = sortedMsgs.length > 0 ? sortedMsgs[sortedMsgs.length - 1].order : 0;

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-400">Fragment</p>

      <div>
        <label className="label">Typ</label>
        <select
          className="input"
          value={fragment.type}
          onChange={(e) => updateFragment(fragment.id, { type: e.target.value as FragmentType })}
        >
          {(Object.keys(FRAGMENT_TYPE_LABELS) as FragmentType[]).map((t) => (
            <option key={t} value={t}>{FRAGMENT_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Bezeichnung</label>
        <input
          className="input"
          value={fragment.label}
          onChange={(e) => updateFragment(fragment.id, { label: e.target.value })}
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="label">Von Nachricht</label>
          <input
            className="input"
            type="number"
            min={0}
            max={maxOrder}
            value={fragment.startMessageOrder}
            onChange={(e) =>
              updateFragment(fragment.id, { startMessageOrder: Number(e.target.value) })
            }
          />
        </div>
        <div className="flex-1">
          <label className="label">Bis Nachricht</label>
          <input
            className="input"
            type="number"
            min={0}
            max={maxOrder}
            value={fragment.endMessageOrder}
            onChange={(e) =>
              updateFragment(fragment.id, { endMessageOrder: Number(e.target.value) })
            }
          />
        </div>
      </div>

      <button
        className="w-full btn-danger"
        onClick={() => { removeFragment(fragment.id); selectFragment(null); }}
      >
        Fragment löschen
      </button>
    </div>
  );
}
