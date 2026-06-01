import { PALETTE_ENTRIES } from './palette.config';
import { useAppStore } from '../../store/appStore';

type Props = {
  onNodeClick?: (nodeType: string) => void;
};

export default function NodePalette({ onNodeClick }: Props) {
  const show = useAppStore((s) => s.ui.showLeftPanel);

  const onDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('application/reactflow-nodetype', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={`shrink-0 overflow-hidden transition-all duration-200 ${show ? 'w-36' : 'w-0'}`}>
    <div className="w-36 bg-white border-r border-slate-200 flex flex-col overflow-y-auto h-full">
      <div className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
        Elemente
      </div>
      <div className="flex flex-col gap-1 p-2">
        {PALETTE_ENTRIES.map((entry) => (
          <div
            key={entry.nodeType}
            draggable
            onDragStart={(e) => onDragStart(e, entry.nodeType)}
            onClick={() => onNodeClick?.(entry.nodeType)}
            className="cursor-pointer px-2 py-1.5 rounded text-xs font-medium text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-colors select-none"
            title={entry.description}
          >
            {entry.label}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
