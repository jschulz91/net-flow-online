import { useStore } from 'reactflow';
import type { LaneLayout } from '../../utils/laneLayout';
import type { SwimLane } from '../../types';

type Props = {
  lanes: SwimLane[];
  layouts: LaneLayout[];
};

export default function SwimLaneBackground({ lanes, layouts }: Props) {
  const transform = useStore((s) => s.transform);
  const [, ty, zoom] = transform;

  const laneMap = new Map(lanes.map((l) => [l.id, l]));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {layouts.map((layout) => {
        const lane = laneMap.get(layout.laneId);
        if (!lane) return null;
        const screenY = layout.y * zoom + ty;
        const screenH = layout.height * zoom;
        return (
          <div
            key={layout.laneId}
            className="absolute left-0 right-0"
            style={{
              top: screenY,
              height: screenH,
              backgroundColor: lane.color,
              borderBottom: '1px solid rgba(0,0,0,0.08)',
            }}
          />
        );
      })}
    </div>
  );
}
