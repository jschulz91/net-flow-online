import { type NodeProps } from 'reactflow';
import type { NodeData } from '../../../types';
import BaseNode from './BaseNode';

export default function DecisionNode({ data, selected }: NodeProps<NodeData>) {
  return (
    <BaseNode data={data} selected={selected}>
      <div className="relative w-[120px] h-[60px] flex items-center justify-center">
        <div
          className="absolute inset-0 rotate-45 rounded"
          style={{ backgroundColor: data.color, border: `2px solid ${data.borderColor}` }}
        />
        <span className="relative z-10 text-xs font-medium text-center px-6 leading-tight">
          {data.label}
        </span>
      </div>
    </BaseNode>
  );
}
