import type { Lifeline } from '../../types';
import { SEQ_CONSTANTS } from '../../utils/sequenceLayout';
import { useAppStore } from '../../store/appStore';

type Props = {
  lifeline: Lifeline;
  x: number;
  totalHeight: number;
  isSelected: boolean;
  isDragging?: boolean;
  onDragStart?: (e: React.MouseEvent) => void;
  onBarCreateStart?: (e: React.MouseEvent) => void;
};

// Exported so SequenceCanvas can use the same icons in the sticky header
export const LIFELINE_ICONS: Record<string, string> = {
  actor: '👤',
  system: '⬜',
  database: '🗄️',
  boundary: '⊏',
  control: '⟳',
  entity: '◯',
  custom: '▪',
};

export default function LifelineColumn({
  lifeline, x, totalHeight, isSelected, isDragging = false, onDragStart, onBarCreateStart,
}: Props) {
  const { selectLifeline } = useAppStore();

  const { zoneHeaderHeight, lifelineBoxHeight, lifelineHeaderHeight } = SEQ_CONSTANTS;
  const boxTop = zoneHeaderHeight + 8;   // = 36
  const boxW = 130;
  const boxH = lifelineBoxHeight;        // = 64

  const icon = lifeline.type === 'custom' && lifeline.icon
    ? lifeline.icon
    : (LIFELINE_ICONS[lifeline.type] ?? '▪');

  return (
    <g
      opacity={isDragging ? 0.4 : 1}
      onClick={() => !isDragging && selectLifeline(lifeline.id)}
      style={{ cursor: onDragStart ? 'grab' : 'pointer' }}
    >
      {/* Dashed vertical lifeline */}
      <line
        x1={x} y1={lifelineHeaderHeight}
        x2={x} y2={totalHeight}
        stroke={lifeline.color}
        strokeWidth={1.5}
        strokeDasharray="6 4"
        opacity={0.5}
        style={{ pointerEvents: 'none' }}
      />
      {/* Wide transparent hit-area on lifeline body — drag here to create activation bar */}
      {onBarCreateStart && (
        <rect
          x={x - 10} y={lifelineHeaderHeight}
          width={20} height={totalHeight - lifelineHeaderHeight}
          fill="transparent"
          style={{ cursor: 'crosshair' }}
          onMouseDown={(e) => { e.stopPropagation(); onBarCreateStart(e); }}
        />
      )}

      {/* Header box */}
      <rect
        x={x - boxW / 2}
        y={boxTop}
        width={boxW}
        height={boxH}
        rx={5}
        fill={isSelected ? lifeline.color : 'white'}
        stroke={lifeline.color}
        strokeWidth={isSelected ? 2.5 : 1.5}
        filter={isSelected ? undefined : 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))'}
        onMouseDown={onDragStart}
        style={{ cursor: onDragStart ? 'grab' : 'pointer' }}
      />

      {/* Grip dots on top edge of box */}
      {onDragStart && [0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={x - 9 + i * 9}
          cy={boxTop + 6}
          r={1.8}
          fill={isSelected ? 'rgba(255,255,255,0.7)' : '#cbd5e1'}
          style={{ pointerEvents: 'none' }}
        />
      ))}

      {/* Icon */}
      <text
        x={x}
        y={boxTop + 22}
        textAnchor="middle"
        fontSize={18}
        dominantBaseline="middle"
        style={{ pointerEvents: 'none' }}
      >
        {icon}
      </text>

      {/* Label */}
      <foreignObject x={x - boxW / 2 + 4} y={boxTop + 38} width={boxW - 8} height={22}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: isSelected ? 'white' : '#1e293b',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {lifeline.label}
        </div>
      </foreignObject>
    </g>
  );
}
