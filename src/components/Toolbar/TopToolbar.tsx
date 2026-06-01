import { useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { downloadJson, readJsonFile } from '../../utils/jsonExport';
import { exportToPdf } from '../../utils/pdfExport';

type Props = {
  canvasRef: React.RefObject<HTMLDivElement>;
};

export default function TopToolbar({ canvasRef }: Props) {
  const {
    ui,
    meta,
    swimlane,
    sequence,
    addLane,
    undo,
    redo,
    past,
    future,
    setMode,
    setViewType,
    loadState,
    copyIstToSoll,
    addLifeline,
    addNote,
    toggleLeftPanel,
    toggleRightPanel,
    toggleInfoBlock,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfExport = async () => {
    if (!canvasRef.current) return;
    await exportToPdf(
      canvasRef.current,
      ui.viewType,
      meta.title,
      meta.creator,
      meta.version,
      ui.activeMode,
    );
  };

  const handleJsonExport = () => {
    downloadJson({ meta, swimlane, sequence }, meta.title);
  };

  const handleJsonImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const state = await readJsonFile(file);
      loadState(state);
    } catch {
      alert('Datei konnte nicht importiert werden.');
    }
    e.target.value = '';
  };

  return (
    <div className="h-10 bg-slate-800 flex items-center px-3 gap-2 shrink-0 text-white">
      {/* Left panel toggle */}
      <button
        className="toolbar-btn px-1.5 text-slate-400 hover:text-white"
        onClick={toggleLeftPanel}
        title={ui.showLeftPanel ? 'Linkes Panel ausblenden' : 'Linkes Panel einblenden'}
      >
        {ui.showLeftPanel ? '◀' : '▶'}
      </button>

      <div className="w-px h-5 bg-slate-600" />

      {/* Title */}
      <span className="text-sm font-semibold text-slate-200 mr-2 truncate max-w-[160px]">
        {meta.title}
      </span>

      {/* Diagram type */}
      <div className="flex rounded overflow-hidden border border-slate-600 text-xs">
        <button
          className={`px-3 py-1 ${ui.viewType === 'swimlane' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          onClick={() => setViewType('swimlane')}
        >
          Swimlane
        </button>
        <button
          className={`px-3 py-1 ${ui.viewType === 'sequence' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          onClick={() => setViewType('sequence')}
        >
          Sequenz
        </button>
      </div>

      {/* Mode IST/SOLL */}
      <div className="flex rounded overflow-hidden border border-slate-600 text-xs ml-1">
        <button
          className={`px-3 py-1 ${ui.activeMode === 'IST' ? 'bg-amber-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          onClick={() => setMode('IST')}
        >
          IST
        </button>
        <button
          className={`px-3 py-1 ${ui.activeMode === 'SOLL' ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          onClick={() => setMode('SOLL')}
        >
          SOLL
        </button>
      </div>

      <div className="w-px h-5 bg-slate-600 mx-1" />

      {/* Add Lane / Lifeline */}
      {ui.viewType === 'swimlane' && (
        <button
          className="toolbar-btn"
          onClick={addLane}
          title="Lane hinzufügen"
        >
          + Lane
        </button>
      )}
      {ui.viewType === 'sequence' && (
        <button
          className="toolbar-btn"
          onClick={() => addLifeline('system')}
          title="Lebenslinie hinzufügen"
        >
          + Lebenslinie
        </button>
      )}

      {/* Copy IST → SOLL */}
      {ui.activeMode === 'SOLL' && (
        <button
          className="toolbar-btn text-green-300 hover:text-green-200"
          onClick={() => {
            if (confirm('IST-Diagramm als Basis für SOLL übernehmen? Bestehende SOLL-Inhalte werden überschrieben.')) {
              copyIstToSoll(ui.viewType);
            }
          }}
          title="IST als Basis für SOLL kopieren"
        >
          IST → SOLL
        </button>
      )}

      <div className="w-px h-5 bg-slate-600 mx-1" />

      {/* Sticky note */}
      <button className="toolbar-btn" onClick={addNote} title="Notizzettel hinzufügen">
        📝 Notiz
      </button>

      <div className="w-px h-5 bg-slate-600 mx-1" />

      {/* Undo / Redo */}
      <button
        className="toolbar-btn disabled:opacity-30"
        onClick={undo}
        disabled={past.length === 0}
        title="Rückgängig (Ctrl+Z)"
      >
        ↩
      </button>
      <button
        className="toolbar-btn disabled:opacity-30"
        onClick={redo}
        disabled={future.length === 0}
        title="Wiederholen (Ctrl+Y)"
      >
        ↪
      </button>

      <div className="flex-1" />

      {/* Export / Import */}
      <button className="toolbar-btn" onClick={handleJsonExport} title="Als JSON exportieren">
        JSON ↓
      </button>
      <button className="toolbar-btn" onClick={() => fileInputRef.current?.click()} title="JSON importieren">
        JSON ↑
      </button>
      <button className="toolbar-btn" onClick={handlePdfExport} title="Als PDF exportieren">
        PDF ↓
      </button>
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleJsonImport} />

      <div className="w-px h-5 bg-slate-600" />

      {/* Info block toggle */}
      <button
        className="toolbar-btn px-1.5 text-slate-400 hover:text-white"
        onClick={toggleInfoBlock}
        title={ui.showInfoBlock ? 'Info-Block ausblenden' : 'Info-Block einblenden'}
      >
        {ui.showInfoBlock ? '⊞' : '⊟'}
      </button>

      {/* Right panel toggle */}
      <button
        className="toolbar-btn px-1.5 text-slate-400 hover:text-white"
        onClick={toggleRightPanel}
        title={ui.showRightPanel ? 'Rechtes Panel ausblenden' : 'Rechtes Panel einblenden'}
      >
        {ui.showRightPanel ? '▶' : '◀'}
      </button>
    </div>
  );
}
