import ProcessNode from './ProcessNode';
import DecisionNode from './DecisionNode';
import StartEndNode from './StartEndNode';
import ExternalSystemNode from './ExternalSystemNode';
import DatabaseNode from './DatabaseNode';
import EventNode from './EventNode';
import DocumentNode from './DocumentNode';
import CustomNode from './CustomNode';

export const nodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  startEnd: StartEndNode,
  externalSystem: ExternalSystemNode,
  database: DatabaseNode,
  event: EventNode,
  document: DocumentNode,
  custom: CustomNode,
} as const;
