import { type NodeProps } from 'reactflow';
import type { NodeData } from '../../../types';
import BaseNode from './BaseNode';

export default function ExternalSystemNode({ data, selected }: NodeProps<NodeData>) {
  return (
    <BaseNode data={data} selected={selected}>
      <div
        className="min-w-[130px] min-h-[48px] px-3 py-2 rounded flex items-center justify-center text-sm font-medium text-center"
        style={{
          backgroundColor: data.color,
          border: `2px dashed ${data.borderColor}`,
        }}
      >
        <span className="text-xs text-slate-500 mr-1">[ext]</span>
        {data.label}
      </div>
    </BaseNode>
  );
}
