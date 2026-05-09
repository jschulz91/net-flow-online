import type { SequenceMessage } from '../../types';
import type { MessageLayout } from '../../utils/sequenceLayout';
import { SEQ_CONSTANTS } from '../../utils/sequenceLayout';
import { useAppStore } from '../../store/appStore';

type Props = {
  message: SequenceMessage;
  layout: MessageLayout;
  isSelected: boolean;
};

export default function MessageArrow({ message, layout, isSelected }: Props) {
  const { selectMessage } = useAppStore();
  const { fromX, toX, y, isSelf } = layout;
  const color = isSelected ? '#3b82f6' : '#475569';
  const strokeW = isSelected ? 2 : 1.5;

  const isDashed = message.type === 'return' || message.type === 'create';
  const dashArray = isDashed ? '6 4' : undefined;

  // Arrow marker
  const markerId = `arrowhead-${message.id}`;
  const isDestroy = message.type === 'destroy';

  const handleClick = () => selectMessage(message.id);

  if (isSelf) {
    const loopOffset = SEQ_CONSTANTS.selfMessageOffset;
    const path = `M ${fromX} ${y - 12} L ${fromX + loopOffset} ${y - 12} L ${fromX + loopOffset} ${y + 12} L ${fromX} ${y + 12}`;
    return (
      <g onClick={handleClick} style={{ cursor: 'pointer' }}>
        <defs>
          <marker id={markerId} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L0,7 L7,3.5 z" fill={color} />
          </marker>
        </defs>
        <path d={path} fill="none" stroke={color} strokeWidth={strokeW} strokeDasharray={dashArray} markerEnd={`url(#${markerId})`} />
        <text x={fromX + loopOffset + 4} y={y} fontSize={11} fill={color} dominantBaseline="middle">{message.label}</text>
        {/* invisible hit area */}
        <path d={path} fill="none" stroke="transparent" strokeWidth={12} />
      </g>
    );
  }

  const goingRight = toX > fromX;
  const arrowX = goingRight ? toX - 2 : toX + 2;

  return (
    <g onClick={handleClick} style={{ cursor: 'pointer' }}>
      <defs>
        <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          {isDestroy ? (
            <>
              <line x1="0" y1="0" x2="8" y2="8" stroke={color} strokeWidth="1.5" />
              <line x1="8" y1="0" x2="0" y2="8" stroke={color} strokeWidth="1.5" />
            </>
          ) : (
            <path d="M0,1 L6,4 L0,7 Z" fill={color} />
          )}
        </marker>
      </defs>

      {/* Line */}
      <line
        x1={fromX}
        y1={y}
        x2={arrowX}
        y2={y}
        stroke={color}
        strokeWidth={strokeW}
        strokeDasharray={dashArray}
        markerEnd={`url(#${markerId})`}
      />

      {/* Invisible wide hit target */}
      <line x1={fromX} y1={y} x2={arrowX} y2={y} stroke="transparent" strokeWidth={14} />

      {/* Label */}
      {message.label && (
        <text
          x={(fromX + toX) / 2}
          y={y - 6}
          textAnchor="middle"
          fontSize={11}
          fontWeight={500}
          fill={color}
        >
          {message.label}
        </text>
      )}

      {/* Note */}
      {message.note && (
        <text
          x={(fromX + toX) / 2}
          y={y + 14}
          textAnchor="middle"
          fontSize={10}
          fill="#94a3b8"
          fontStyle="italic"
        >
          {message.note}
        </text>
      )}

      {/* Sequence number */}
      <text
        x={Math.min(fromX, toX) + 4}
        y={y - 6}
        fontSize={9}
        fill="#94a3b8"
      />
    </g>
  );
}
