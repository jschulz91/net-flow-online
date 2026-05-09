import { type NodeProps } from 'reactflow';
import type { NodeData } from '../../../types';
import BaseNode from './BaseNode';

export default function DatabaseNode({ data, selected }: NodeProps<NodeData>) {
  const w = 110;
  const h = 64;
  const rx = w / 2;
  const ry = 10;

  return (
    <BaseNode data={data} selected={selected}>
      <div className="relative" style={{ width: w, height: h }}>
        <svg width={w} height={h} className="absolute inset-0">
          {/* Body */}
          <rect x={1} y={ry} width={w - 2} height={h - ry - 1} fill={data.color} stroke={data.borderColor} strokeWidth={2} />
          {/* Top ellipse */}
          <ellipse cx={rx} cy={ry} rx={rx - 1} ry={ry} fill={data.color} stroke={data.borderColor} strokeWidth={2} />
          {/* Bottom ellipse arc (front) */}
          <ellipse cx={rx} cy={h - ry} rx={rx - 1} ry={ry} fill={data.color} stroke={data.borderColor} strokeWidth={2} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-center px-2 pt-2">
          {data.label}
        </div>
      </div>
    </BaseNode>
  );
}
