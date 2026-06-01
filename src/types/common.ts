export type DiagramMode = 'IST' | 'SOLL';
export type ViewType = 'swimlane' | 'sequence';

export type StickyNote = {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  width: number;
};

export type DiagramMeta = {
  title: string;
  creator: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  description: string;
};
