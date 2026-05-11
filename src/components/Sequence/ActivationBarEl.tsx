import type { ActivationBar } from '../../types';

const BAR_W = 14;
const HANDLE_H = 6;

type Props = {
  bar: ActivationBar;
  x: number;
  color: string;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onMoveStart: (e: React.MouseEvent) => void;
  onResizeTopStart: (e: React.MouseEvent) => void;
  onResizeBotStart: (e: React.MouseEvent) => void;
};

export default function ActivationBarEl({
  bar, x, color, isSelected,
  onSelect, onMoveStart, onResizeTopStart, onResizeBotStart,
}: Props) {
  const bx = x - BAR_W / 2;

  return (
    <g onClick={(e) => { e.stopPropagation(); onSelect(e); }}>
      {/* Main bar body */}
      <rect
        x={bx}
        y={bar.y}
        width={BAR_W}
        height={bar.height}
        fill={`${color}30`}
        stroke={isSelected ? '#3b82f6' : color}
        strokeWidth={isSelected ? 2 : 1.5}
        rx={2}
        style={{ cursor: 'grab' }}
        onMouseDown={(e) => { e.stopPropagation(); onMoveStart(e); }}
      />

      {/* Top resize handle */}
      <rect
        x={bx}
        y={bar.y}
        width={BAR_W}
        height={HANDLE_H}
        fill={isSelected ? '#3b82f620' : 'transparent'}
        style={{ cursor: 'ns-resize' }}
        onMouseDown={(e) => { e.stopPropagation(); onResizeTopStart(e); }}
      />
      {/* Grip line on top handle */}
      {isSelected && (
        <line
          x1={bx + 3} y1={bar.y + 3}
          x2={bx + BAR_W - 3} y2={bar.y + 3}
          stroke="#3b82f6" strokeWidth={1.5} strokeLinecap="round"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Bottom resize handle */}
      <rect
        x={bx}
        y={bar.y + bar.height - HANDLE_H}
        width={BAR_W}
        height={HANDLE_H}
        fill={isSelected ? '#3b82f620' : 'transparent'}
        style={{ cursor: 'ns-resize' }}
        onMouseDown={(e) => { e.stopPropagation(); onResizeBotStart(e); }}
      />
      {isSelected && (
        <line
          x1={bx + 3} y1={bar.y + bar.height - 3}
          x2={bx + BAR_W - 3} y2={bar.y + bar.height - 3}
          stroke="#3b82f6" strokeWidth={1.5} strokeLinecap="round"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </g>
  );
}
