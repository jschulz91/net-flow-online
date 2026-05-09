import { useRef } from 'react';
import { useAppStore } from './store/appStore';
import TopToolbar from './components/Toolbar/TopToolbar';
import SwimlaneEditor from './components/Swimlane/SwimlaneEditor';
import SequenceEditor from './components/Sequence/SequenceEditor';
import PropertiesPanel from './components/Properties/PropertiesPanel';
import TitleBlock from './components/App/TitleBlock';
import ErrorBoundary from './components/App/ErrorBoundary';
import { useUndoRedo } from './hooks/useUndoRedo';

export default function App() {
  const viewType = useAppStore((s) => s.ui.viewType);
  const canvasRef = useRef<HTMLDivElement>(null);
  useUndoRedo();

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
        <TopToolbar canvasRef={canvasRef} />
        <div className="flex flex-1 overflow-hidden relative" ref={canvasRef}>
          <ErrorBoundary>
            {viewType === 'swimlane' && <SwimlaneEditor />}
            {viewType === 'sequence' && <SequenceEditor />}
          </ErrorBoundary>
          <ErrorBoundary>
            <PropertiesPanel />
          </ErrorBoundary>
          <TitleBlock />
        </div>
      </div>
    </ErrorBoundary>
  );
}
