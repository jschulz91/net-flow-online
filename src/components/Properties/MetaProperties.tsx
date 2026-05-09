import { useAppStore } from '../../store/appStore';

export default function MetaProperties() {
  const meta = useAppStore((s) => s.meta);
  const { updateMeta } = useAppStore();

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-400">Projekt-Informationen</p>
      <div>
        <label className="label">Titel</label>
        <input className="input" value={meta.title} onChange={(e) => updateMeta({ title: e.target.value })} />
      </div>
      <div>
        <label className="label">Ersteller</label>
        <input className="input" value={meta.creator} onChange={(e) => updateMeta({ creator: e.target.value })} />
      </div>
      <div>
        <label className="label">Version</label>
        <input className="input" value={meta.version} onChange={(e) => updateMeta({ version: e.target.value })} />
      </div>
      <div>
        <label className="label">Beschreibung</label>
        <textarea
          className="input resize-none"
          rows={3}
          value={meta.description}
          onChange={(e) => updateMeta({ description: e.target.value })}
        />
      </div>
    </div>
  );
}
