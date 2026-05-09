import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeData } from '../../../types';

type Props = {
  data: NodeData;
  selected: boolean;
  children: React.ReactNode;
};

export default function BaseNode({ data, selected, children }: Props) {
  return (
    <div
      title={data.description || undefined}
      className={`relative ${selected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
    >
      {data.stepNumber !== undefined && (
        <div className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center z-10">
          {data.stepNumber}
        </div>
      )}
      {children}
      <Handle type="source" position={Position.Top} id="top" className="!w-2 !h-2 !bg-slate-400" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-2 !h-2 !bg-slate-400" />
      <Handle type="source" position={Position.Left} id="left" className="!w-2 !h-2 !bg-slate-400" />
      <Handle type="source" position={Position.Right} id="right" className="!w-2 !h-2 !bg-slate-400" />
      <Handle type="target" position={Position.Top} id="top-t" className="!w-2 !h-2 !bg-slate-400 !opacity-0" />
      <Handle type="target" position={Position.Bottom} id="bottom-t" className="!w-2 !h-2 !bg-slate-400 !opacity-0" />
      <Handle type="target" position={Position.Left} id="left-t" className="!w-2 !h-2 !bg-slate-400 !opacity-0" />
      <Handle type="target" position={Position.Right} id="right-t" className="!w-2 !h-2 !bg-slate-400 !opacity-0" />
    </div>
  );
}
