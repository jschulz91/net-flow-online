import { useStore } from 'reactflow';
import type { LaneLayout } from '../../utils/laneLayout';
import type { SwimLane } from '../../types';
import { useAppStore } from '../../store/appStore';

type Props = {
  lanes: SwimLane[];
  layouts: LaneLayout[];
};

export default function LaneLabelColumn({ lanes, layouts }: Props) {
  const transform = useStore((s) => s.transform);
  const [, ty, zoom] = transform;
  const { selectLane, renameLane } = useAppStore();
  const selectedLaneId = useAppStore((s) => s.ui.selectedLaneId);
  const laneMap = new Map(lanes.map((l) => [l.id, l]));

  return (
    <div className="absolute left-0 top-0 bottom-0 w-36 z-10 pointer-events-none">
      {layouts.map((layout) => {
        const lane = laneMap.get(layout.laneId);
        if (!lane) return null;
        const screenY = layout.y * zoom + ty;
        const screenH = layout.height * zoom;
        return (
          <div
            key={layout.laneId}
            className="absolute left-0 right-0 flex items-center justify-center pointer-events-auto cursor-pointer group"
            style={{ top: screenY, height: screenH }}
            onClick={() => selectLane(lane.id)}
          >
            <div
              className={`w-full h-full flex items-center justify-center border-r border-slate-200 ${
                selectedLaneId === lane.id ? 'bg-blue-50' : 'bg-white/80'
              }`}
            >
              <span
                className="text-xs font-semibold text-slate-600 rotate-[-90deg] whitespace-nowrap max-w-[120px] truncate select-none"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  const newLabel = prompt('Lane umbenennen:', lane.label);
                  if (newLabel !== null && newLabel.trim()) renameLane(lane.id, newLabel.trim());
                }}
              >
                {lane.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
