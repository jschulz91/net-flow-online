import {
  getBezierPath,
  EdgeLabelRenderer,
  type EdgeProps,
} from 'reactflow';
import type { EdgeData } from '../types';
import { useAppStore } from '../store/appStore';

export default function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<EdgeData>) {
  const { selectEdge } = useAppStore();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const lineStyle = data?.lineStyle ?? 'solid';
  const color = data?.color ?? '#64748b';
  const arrowDir = data?.arrowDirection ?? 'forward';

  const strokeDasharray =
    lineStyle === 'dashed' ? '8 4' : lineStyle === 'dotted' ? '2 4' : undefined;

  const markerEnd =
    arrowDir === 'forward' || arrowDir === 'both'
      ? `url(#arrow-${id})`
      : undefined;
  const markerStart =
    arrowDir === 'back' || arrowDir === 'both'
      ? `url(#arrow-start-${id})`
      : undefined;

  return (
    <>
      <defs>
        <marker id={`arrow-${id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={color} />
        </marker>
        <marker id={`arrow-start-${id}`} markerWidth="8" markerHeight="8" refX="2" refY="3" orient="auto-start-reverse">
          <path d="M0,0 L0,6 L8,3 z" fill={color} />
        </marker>
      </defs>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        stroke={color}
        strokeWidth={selected ? 2.5 : 1.5}
        strokeDasharray={strokeDasharray}
        fill="none"
        markerEnd={markerEnd}
        markerStart={markerStart}
        onClick={() => selectEdge(id)}
        style={{ cursor: 'pointer' }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            className="absolute pointer-events-all text-[11px] font-medium text-slate-600 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200 shadow-sm"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
