import type { NodeType } from '../../types';
import { NODE_COLORS, NODE_BORDER_COLORS } from '../../utils/colors';

export type PaletteEntry = {
  nodeType: NodeType;
  label: string;
  description: string;
  defaultColor: string;
  defaultBorderColor: string;
};

export const PALETTE_ENTRIES: PaletteEntry[] = [
  {
    nodeType: 'process',
    label: 'Prozess',
    description: 'Prozessschritt / Aktion',
    defaultColor: NODE_COLORS.process,
    defaultBorderColor: NODE_BORDER_COLORS.process,
  },
  {
    nodeType: 'decision',
    label: 'Entscheidung',
    description: 'Verzweigung / Bedingung',
    defaultColor: NODE_COLORS.decision,
    defaultBorderColor: NODE_BORDER_COLORS.decision,
  },
  {
    nodeType: 'startEnd',
    label: 'Start / Ende',
    description: 'Anfang oder Ende des Ablaufs',
    defaultColor: NODE_COLORS.startEnd,
    defaultBorderColor: NODE_BORDER_COLORS.startEnd,
  },
  {
    nodeType: 'externalSystem',
    label: 'Ext. System',
    description: 'Externes Partnersystem (ERP, SCADA…)',
    defaultColor: NODE_COLORS.externalSystem,
    defaultBorderColor: NODE_BORDER_COLORS.externalSystem,
  },
  {
    nodeType: 'database',
    label: 'Datenbank',
    description: 'Datenbank / Datenspeicher',
    defaultColor: NODE_COLORS.database,
    defaultBorderColor: NODE_BORDER_COLORS.database,
  },
  {
    nodeType: 'event',
    label: 'Event',
    description: 'Trigger / Nachricht / Event',
    defaultColor: NODE_COLORS.event,
    defaultBorderColor: NODE_BORDER_COLORS.event,
  },
  {
    nodeType: 'document',
    label: 'Dokument',
    description: 'Dokument / Report / Datei',
    defaultColor: NODE_COLORS.document,
    defaultBorderColor: NODE_BORDER_COLORS.document,
  },
  {
    nodeType: 'custom',
    label: 'Benutzerdefiniert',
    description: 'Frei konfigurierbarer Block',
    defaultColor: NODE_COLORS.custom,
    defaultBorderColor: NODE_BORDER_COLORS.custom,
  },
];
