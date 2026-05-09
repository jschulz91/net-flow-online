import LifelinePalette from './LifelinePalette';
import SequenceCanvas from './SequenceCanvas';

export default function SequenceEditor() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <LifelinePalette />
      <SequenceCanvas />
    </div>
  );
}
