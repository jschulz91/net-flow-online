import type { MessageType, SequenceMessage } from '../../types';
import type { MessageLayout } from '../../utils/sequenceLayout';
import { SEQ_CONSTANTS } from '../../utils/sequenceLayout';
import { useAppStore } from '../../store/appStore';

type Props = {
  message: SequenceMessage;
  layout: MessageLayout;
  isSelected: boolean;
};

// UML spec:
//   sync/self  → solid line + filled triangle (▶)
//   async      → solid line + open arrowhead  (›)
//   return     → dashed line + open arrowhead
//   create     → dashed line + open arrowhead
//   destroy    → solid line + × at target

function isFilledArrow(type: MessageType) {
  return type === 'sync' || type === 'self';
}
function isDashedLine(type: MessageType) {
  return type === 'return' || type === 'create';
}

/** SVG <marker> inner shape — called inside <defs> */
function ArrowMarkerShape({ type, color }: { type: MessageType; color: string }) {
  if (type === 'destroy') {
    return (
      <>
        <line x1="0" y1="0" x2="10" y2="10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <line x1="10" y1="0" x2="0" y2="10" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </>
    );
  }
  if (isFilledArrow(type)) {
    // Filled solid triangle → UML synchronous call
    return <path d="M0,0 L10,5 L0,10 Z" fill={color} stroke="none" />;
  }
  // Open arrowhead (no fill) → UML asynchronous / return / create
  return (
    <polyline
      points="0,0 10,5 0,10"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
}

/** Marker dimensions differ slightly so the tip aligns correctly */
function markerProps(type: MessageType) {
  if (type === 'destroy') {
    // × is centred; refX/refY at centre so it lands on the lifeline
    return { markerWidth: 10, markerHeight: 10, refX: 5, refY: 5 };
  }
  // For both filled and open arrows the tip is at x=10
  return { markerWidth: 10, markerHeight: 10, refX: 10, refY: 5 };
}

export default function MessageArrow({ message, layout, isSelected }: Props) {
  const { selectMessage } = useAppStore();
  const { fromX, toX, y, isSelf } = layout;

  const color   = isSelected ? '#3b82f6' : '#475569';
  const strokeW = isSelected ? 2 : 1.5;
  const dashed  = isDashedLine(message.type) ? '7 4' : undefined;
  const markerId = `arrow-${message.id}`;
  const mp = markerProps(message.type);

  const onClick = () => selectMessage(message.id);

  // ─── Self-message (U-loop) ────────────────────────────────────────────────
  if (isSelf) {
    const off = SEQ_CONSTANTS.selfMessageOffset;
    const d = `M ${fromX} ${y - 14} L ${fromX + off} ${y - 14} L ${fromX + off} ${y + 14} L ${fromX} ${y + 14}`;
    return (
      <g onClick={onClick} style={{ cursor: 'pointer' }}>
        <defs>
          <marker id={markerId} {...mp} orient="auto">
            <ArrowMarkerShape type={message.type} color={color} />
          </marker>
        </defs>
        <path d={d} fill="none" stroke={color} strokeWidth={strokeW}
          strokeDasharray={dashed} markerEnd={`url(#${markerId})`} />
        <path d={d} fill="none" stroke="transparent" strokeWidth={14} />
        {message.label && (
          <text x={fromX + off + 6} y={y} fontSize={11} fontWeight={500}
            fill={color} dominantBaseline="middle">
            {message.label}
          </text>
        )}
        {message.note && (
          <text x={fromX + off + 6} y={y + 16} fontSize={10}
            fill="#94a3b8" fontStyle="italic" dominantBaseline="middle">
            {message.note}
          </text>
        )}
      </g>
    );
  }

  // ─── Normal message ───────────────────────────────────────────────────────
  const goingRight = toX > fromX;
  // Pull line endpoint back by markerWidth so the line doesn't poke through
  const lineEnd = goingRight ? toX - mp.refX : toX + mp.refX;
  const labelX  = (fromX + toX) / 2;

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <defs>
        <marker id={markerId} {...mp} orient="auto">
          <ArrowMarkerShape type={message.type} color={color} />
        </marker>
      </defs>

      {/* Invisible wide hit target */}
      <line x1={fromX} y1={y} x2={toX} y2={y} stroke="transparent" strokeWidth={16} />

      {/* Actual line */}
      <line
        x1={fromX} y1={y} x2={lineEnd} y2={y}
        stroke={color} strokeWidth={strokeW}
        strokeDasharray={dashed}
        markerEnd={`url(#${markerId})`}
      />

      {/* Label above line */}
      {message.label && (
        <text x={labelX} y={y - 7} textAnchor="middle"
          fontSize={11} fontWeight={500} fill={color}>
          {message.label}
        </text>
      )}

      {/* Note below line */}
      {message.note && (
        <text x={labelX} y={y + 15} textAnchor="middle"
          fontSize={10} fill="#94a3b8" fontStyle="italic">
          {message.note}
        </text>
      )}
    </g>
  );
}
