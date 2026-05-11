import { useAppStore } from '../../store/appStore';

export default function ActivationBarProperties() {
  const selectedBarId = useAppStore((s) => s.ui.selectedBarId);
  const bar = useAppStore((s) =>
    s.sequence[s.ui.activeMode].activationBars.find((b) => b.id === selectedBarId),
  );
  const lifelines = useAppStore((s) => s.sequence[s.ui.activeMode].lifelines);
  const { updateActivationBar, removeActivationBar, selectBar } = useAppStore();

  if (!bar) return null;
  const ll = lifelines.find((l) => l.id === bar.lifelineId);

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-400">Aktivierungsbalken</p>
      {ll && (
        <p className="text-xs font-medium text-slate-600">{ll.label}</p>
      )}
      <div>
        <label className="label">Höhe (px)</label>
        <input
          className="input"
          type="number"
          min={20}
          step={10}
          value={Math.round(bar.height)}
          onChange={(e) => updateActivationBar(bar.id, { height: Number(e.target.value) })}
        />
      </div>
      <p className="text-[10px] text-slate-400">
        Ziehen: Balken verschieben<br />
        Oberer / unterer Rand: Größe ändern<br />
        Entf: Balken löschen
      </p>
      <button
        className="w-full btn-danger"
        onClick={() => { removeActivationBar(bar.id); selectBar(null); }}
      >
        Balken löschen
      </button>
    </div>
  );
}
