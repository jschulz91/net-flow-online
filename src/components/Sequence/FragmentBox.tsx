import type { SequenceFragment } from '../../types';
import type { FragmentLayout } from '../../utils/sequenceLayout';

const FRAGMENT_COLORS: Record<string, string> = {
  alt: '#3b82f6',
  opt: '#10b981',
  loop: '#f59e0b',
  par: '#8b5cf6',
  ref: '#6b7280',
};

type Props = {
  fragment: SequenceFragment;
  layout: FragmentLayout;
  isSelected: boolean;
  onSelect: () => void;
};

export default function FragmentBox({ fragment, layout, isSelected, onSelect }: Props) {
  const color = FRAGMENT_COLORS[fragment.type] ?? '#6b7280';
  const { x, y, width, height } = layout;

  return (
    <g onClick={(e) => { e.stopPropagation(); onSelect(); }} style={{ cursor: 'pointer' }}>
      {/* Invisible wide hit area so the interior is also clickable */}
      <rect x={x} y={y} width={width} height={height} fill="transparent" />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={isSelected ? `${color}18` : 'none'}
        stroke={color}
        strokeWidth={isSelected ? 2.5 : 1.5}
        strokeDasharray="8 4"
        rx={4}
        opacity={isSelected ? 1 : 0.7}
        style={{ pointerEvents: 'none' }}
      />
      {/* Type badge */}
      <rect x={x} y={y} width={44} height={20} fill={color} rx={2} style={{ pointerEvents: 'none' }} />
      <text x={x + 22} y={y + 10} textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight={700} fill="white" style={{ pointerEvents: 'none' }}>
        {fragment.type.toUpperCase()}
      </text>
      {/* Label */}
      {fragment.label && (
        <text x={x + 50} y={y + 10} dominantBaseline="middle" fontSize={11} fill={color} style={{ pointerEvents: 'none' }}>
          [{fragment.label}]
        </text>
      )}
    </g>
  );
}
