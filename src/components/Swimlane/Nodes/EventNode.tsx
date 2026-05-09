import { type NodeProps } from 'reactflow';
import type { NodeData } from '../../../types';
import BaseNode from './BaseNode';

export default function EventNode({ data, selected }: NodeProps<NodeData>) {
  return (
    <BaseNode data={data} selected={selected}>
      <div
        className="min-w-[120px] min-h-[48px] px-3 py-2 flex items-center justify-center text-sm font-medium text-center"
        style={{
          backgroundColor: data.color,
          border: `2px solid ${data.borderColor}`,
          clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)',
          paddingRight: '20px',
        }}
      >
        {data.label}
      </div>
    </BaseNode>
  );
}
