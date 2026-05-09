import type { AppState } from './appStore';
import type { SwimlaneCanvas, SequenceCanvas, SwimLane } from '../types';

type S = AppState & { ui: { activeMode: 'IST' | 'SOLL'; viewType: 'swimlane' | 'sequence' } };

export const selectActiveSwimCanvas = (s: S): SwimlaneCanvas => s.swimlane[s.ui.activeMode];
export const selectActiveSeqCanvas = (s: S): SequenceCanvas => s.sequence[s.ui.activeMode];
export const selectLanesSorted = (s: S): SwimLane[] =>
  [...s.swimlane[s.ui.activeMode].lanes].sort((a, b) => a.order - b.order);
