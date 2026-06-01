export type LifelineType =
  | 'actor'
  | 'system'
  | 'database'
  | 'boundary'
  | 'control'
  | 'entity'
  | 'custom';

export type Lifeline = {
  id: string;
  label: string;
  description: string;
  type: LifelineType;
  color: string;
  order: number;
  icon?: string;   // custom icon override (emoji/symbol), only used when type === 'custom'
};

export type SequenceZone = {
  id: string;
  label: string;
  lifelineIds: string[];   // informational (for properties display)
  x: number;               // explicit left edge in SVG coordinates
  width: number;           // explicit width; zone always spans full height
  fillColor: string;
  borderColor: string;
};

export type MessageType = 'sync' | 'async' | 'return' | 'self' | 'create' | 'destroy';

export type SequenceMessage = {
  id: string;
  order: number;
  fromLifelineId: string;
  toLifelineId: string;
  label: string;
  type: MessageType;
  note: string;
};

export type ActivationBar = {
  id: string;
  lifelineId: string;
  y: number;        // top edge in SVG coordinates
  height: number;   // min 20px
};

export type FragmentType = 'alt' | 'opt' | 'loop' | 'par' | 'ref';

export type SequenceFragment = {
  id: string;
  type: FragmentType;
  label: string;
  startMessageOrder: number;
  endMessageOrder: number;
  lifelineIds: string[];
};

export type SequenceCanvas = {
  lifelines: Lifeline[];
  messages: SequenceMessage[];
  activationBars: ActivationBar[];
  fragments: SequenceFragment[];
  zones: SequenceZone[];
  notes: import('./common').StickyNote[];
};
