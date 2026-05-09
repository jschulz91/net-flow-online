import { type NodeProps } from 'reactflow';
import type { NodeData } from '../../../types';
import BaseNode from './BaseNode';

export default function StartEndNode({ data, selected }: NodeProps<NodeData>) {
  return (
    <BaseNode data={data} selected={selected}>
      <div
        className="min-w-[100px] px-4 py-2 rounded-full flex items-center justify-center text-sm font-semibold text-center"
        style={{ backgroundColor: data.color, border: `2px solid ${data.borderColor}` }}
      >
        {data.label}
      </div>
    </BaseNode>
  );
}
