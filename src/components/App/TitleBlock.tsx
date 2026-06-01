import { useAppStore } from '../../store/appStore';

export default function TitleBlock() {
  const meta = useAppStore((s) => s.meta);
  const mode = useAppStore((s) => s.ui.activeMode);
  const viewType = useAppStore((s) => s.ui.viewType);
  const show = useAppStore((s) => s.ui.showInfoBlock);

  if (!show) return null;

  return (
    <div className="absolute bottom-3 right-3 z-20 border border-slate-300 bg-white/95 shadow text-[10px] text-slate-600 pointer-events-none"
      style={{ minWidth: 200 }}>
      <table className="border-collapse w-full">
        <tbody>
          <tr>
            <td className="border border-slate-200 px-2 py-0.5 font-semibold" colSpan={2}>
              {meta.title || '—'} &nbsp;
              <span className={`font-bold ${mode === 'IST' ? 'text-amber-600' : 'text-green-600'}`}>
                [{mode}]
              </span>
            </td>
          </tr>
          <tr>
            <td className="border border-slate-200 px-2 py-0.5 text-slate-400">Ersteller</td>
            <td className="border border-slate-200 px-2 py-0.5">{meta.creator || '—'}</td>
          </tr>
          <tr>
            <td className="border border-slate-200 px-2 py-0.5 text-slate-400">Version</td>
            <td className="border border-slate-200 px-2 py-0.5">{meta.version || '—'}</td>
          </tr>
          <tr>
            <td className="border border-slate-200 px-2 py-0.5 text-slate-400">Datum</td>
            <td className="border border-slate-200 px-2 py-0.5">{new Date().toLocaleDateString('de-DE')}</td>
          </tr>
          <tr>
            <td className="border border-slate-200 px-2 py-0.5 text-slate-400">Typ</td>
            <td className="border border-slate-200 px-2 py-0.5 capitalize">{viewType}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
