import type { AppState } from '../store/appStore';
import type { DiagramMeta } from '../types';

export type ExportFile = {
  version: '2.0';
  exportedAt: string;
  meta: DiagramMeta;
  swimlane: AppState['swimlane'];
  sequence: AppState['sequence'];
};

export function serializeState(state: AppState): ExportFile {
  return {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    meta: state.meta,
    swimlane: state.swimlane,
    sequence: state.sequence,
  };
}

export function deserializeState(file: ExportFile): AppState {
  return {
    meta: file.meta,
    swimlane: file.swimlane,
    sequence: file.sequence,
  };
}
