import { type NodeProps } from 'reactflow';
import type { NodeData } from '../../../types';
import BaseNode from './BaseNode';

export default function ProcessNode({ data, selected }: NodeProps<NodeData>) {
  return (
    <BaseNode data={data} selected={selected}>
      <div
        className="min-w-[120px] min-h-[48px] px-3 py-2 rounded flex items-center justify-center text-sm font-medium text-center"
        style={{ backgroundColor: data.color, border: `2px solid ${data.borderColor}` }}
      >
        {data.label}
      </div>
    </BaseNode>
  );
}
