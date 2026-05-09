import { type NodeProps } from 'reactflow';
import type { NodeData } from '../../../types';
import BaseNode from './BaseNode';

export default function DocumentNode({ data, selected }: NodeProps<NodeData>) {
  return (
    <BaseNode data={data} selected={selected}>
      <div
        className="relative min-w-[120px] min-h-[48px] px-3 py-2 rounded-bl rounded-br flex items-center justify-center text-sm font-medium text-center overflow-hidden"
        style={{ backgroundColor: data.color, border: `2px solid ${data.borderColor}` }}
      >
        {/* Folded corner */}
        <div
          className="absolute top-0 right-0 w-5 h-5"
          style={{
            background: `linear-gradient(225deg, white 50%, ${data.borderColor} 50%)`,
          }}
        />
        <span className="pr-3">{data.label}</span>
      </div>
    </BaseNode>
  );
}
