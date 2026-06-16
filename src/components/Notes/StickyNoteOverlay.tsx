import { useRef, useState, useEffect } from 'react';
import { useStore } from 'reactflow';
import { useAppStore } from '../../store/appStore';
import type { StickyNote } from '../../types';

export const NOTE_COLORS = [
  { value: '#fef08a', label: 'Gelb' },
  { value: '#bfdbfe', label: 'Blau' },
  { value: '#bbf7d0', label: 'Grün' },
  { value: '#fecdd3', label: 'Rosa' },
  { value: '#e9d5ff', label: 'Lila' },
  { value: '#fed7aa', label: 'Orange' },
];

type CardProps = {
  note: StickyNote;
  onUpdate: (patch: Partial<StickyNote>) => void;
  onRemove: () => void;
  onDragStart: (e: React.MouseEvent, note: StickyNote) => void;
};

function NoteCard({ note, onUpdate, onRemove, onDragStart }: CardProps) {
  const [showColors, setShowColors] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const darkerBorder = note.color + 'cc';

  return (
    <div
      className="shadow-lg rounded select-none"
      style={{ width: note.width, pointerEvents: 'auto' }}
    >
      {/* Header / drag handle */}
      <div
        className="flex items-center justify-between px-2 py-1 rounded-t cursor-grab active:cursor-grabbing"
        style={{ backgroundColor: darkerBorder }}
        onMouseDown={(e) => onDragStart(e, note)}
      >
        <div className="flex items-center gap-1">
          {/* Color swatches toggle */}
          <button
            className="w-3.5 h-3.5 rounded-full border border-white/60 hover:scale-110 transition-transform"
            style={{ backgroundColor: note.color }}
            title="Farbe ändern"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setShowColors((v) => !v); }}
          />
          {showColors && (
            <div
              className="flex gap-1 ml-1"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.value}
                  className="w-3.5 h-3.5 rounded-full border border-white/60 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                  onClick={(e) => { e.stopPropagation(); onUpdate({ color: c.value }); setShowColors(false); }}
                />
              ))}
            </div>
          )}
        </div>
        <button
          className="text-slate-600 hover:text-red-600 text-xs leading-none"
          title="Notiz löschen"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="rounded-b" style={{ backgroundColor: note.color }}>
        <textarea
          ref={textRef}
          className="w-full bg-transparent text-xs text-slate-800 resize-none outline-none px-2 py-1.5 placeholder:text-slate-500/60"
          style={{ minHeight: 72 }}
          placeholder="Kommentar…"
          value={note.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

// ─── Sequence: notes live in SVG/content coordinates and scroll with the diagram ──

type SeqDragState = {
  id: string;
  startMouseX: number;
  startMouseY: number;
  startNoteX: number;
  startNoteY: number;
};

export function SequenceStickyNotes({ width, height }: { width: number; height: number }) {
  const mode  = useAppStore((s) => s.ui.activeMode);
  const notes = useAppStore((s) => s.sequence[mode].notes ?? []);
  const { updateNote, removeNote } = useAppStore();

  const [drag, setDrag] = useState<SeqDragState | null>(null);

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - drag.startMouseX;
      const dy = e.clientY - drag.startMouseY;
      updateNote(drag.id, {
        x: Math.max(0, drag.startNoteX + dx),
        y: Math.max(0, drag.startNoteY + dy),
      });
    };
    const onUp = () => setDrag(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [drag, updateNote]);

  const handleDragStart = (e: React.MouseEvent, note: StickyNote) => {
    e.preventDefault();
    setDrag({ id: note.id, startMouseX: e.clientX, startMouseY: e.clientY, startNoteX: note.x, startNoteY: note.y });
  };

  if (notes.length === 0) return null;

  return (
    <div className="absolute top-0 left-0 pointer-events-none" style={{ width, height, zIndex: 55 }}>
      {notes.map((note) => (
        <div key={note.id} className="absolute" style={{ left: note.x, top: note.y, zIndex: 60 }}>
          <NoteCard
            note={note}
            onUpdate={(patch) => updateNote(note.id, patch)}
            onRemove={() => removeNote(note.id)}
            onDragStart={handleDragStart}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Swimlane: notes live in flow coordinates and follow ReactFlow's pan/zoom ──

type FlowDragState = {
  id: string;
  startMouseX: number;
  startMouseY: number;
  startNoteX: number;
  startNoteY: number;
  zoom: number;
};

export function SwimlaneStickyNotes() {
  const mode  = useAppStore((s) => s.ui.activeMode);
  const notes = useAppStore((s) => s.swimlane[mode].notes ?? []);
  const { updateNote, removeNote } = useAppStore();
  const transform = useStore((s) => s.transform);
  const [tx, ty, zoom] = transform;

  const [drag, setDrag] = useState<FlowDragState | null>(null);

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const dx = (e.clientX - drag.startMouseX) / drag.zoom;
      const dy = (e.clientY - drag.startMouseY) / drag.zoom;
      updateNote(drag.id, {
        x: Math.max(0, drag.startNoteX + dx),
        y: Math.max(0, drag.startNoteY + dy),
      });
    };
    const onUp = () => setDrag(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [drag, updateNote]);

  const handleDragStart = (e: React.MouseEvent, note: StickyNote) => {
    e.preventDefault();
    setDrag({ id: note.id, startMouseX: e.clientX, startMouseY: e.clientY, startNoteX: note.x, startNoteY: note.y, zoom });
  };

  if (notes.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 55, overflow: 'hidden' }}>
      {notes.map((note) => (
        <div
          key={note.id}
          className="absolute"
          style={{
            left: note.x * zoom + tx,
            top: note.y * zoom + ty,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            zIndex: 60,
          }}
        >
          <NoteCard
            note={note}
            onUpdate={(patch) => updateNote(note.id, patch)}
            onRemove={() => removeNote(note.id)}
            onDragStart={handleDragStart}
          />
        </div>
      ))}
    </div>
  );
}
