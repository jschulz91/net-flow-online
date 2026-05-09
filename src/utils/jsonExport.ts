import type { AppState } from '../store/appStore';
import { serializeState } from './serialization';

export function downloadJson(state: AppState, title: string) {
  const data = serializeState(state);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_') || 'diagramm'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function readJsonFile(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        // Basic validation
        if (!parsed.swimlane || !parsed.sequence || !parsed.meta) {
          throw new Error('Ungültiges Dateiformat');
        }
        resolve({ meta: parsed.meta, swimlane: parsed.swimlane, sequence: parsed.sequence });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
    reader.readAsText(file);
  });
}
