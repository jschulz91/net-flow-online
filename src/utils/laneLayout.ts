import type { SwimLane } from '../types';

export type LaneLayout = {
  laneId: string;
  y: number;
  height: number;
};

export function computeLaneLayout(lanes: SwimLane[]): LaneLayout[] {
  const sorted = [...lanes].sort((a, b) => a.order - b.order);
  let y = 0;
  return sorted.map((lane) => {
    const layout: LaneLayout = { laneId: lane.id, y, height: lane.height };
    y += lane.height;
    return layout;
  });
}

export function getLaneForY(y: number, layouts: LaneLayout[]): string | null {
  for (const layout of layouts) {
    if (y >= layout.y && y < layout.y + layout.height) return layout.laneId;
  }
  // return last lane if below
  if (layouts.length > 0) return layouts[layouts.length - 1].laneId;
  return null;
}

export function totalCanvasHeight(layouts: LaneLayout[]): number {
  if (layouts.length === 0) return 0;
  const last = layouts[layouts.length - 1];
  return last.y + last.height;
}
