import LifelinePalette from './LifelinePalette';
import SequenceCanvas from './SequenceCanvas';

export default function SequenceEditor() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <LifelinePalette />
      <div className="relative flex-1 flex flex-col overflow-hidden">
        <SequenceCanvas />
      </div>
    </div>
  );
}
