import type { ActivationBarLayout } from '../../utils/sequenceLayout';
import { SEQ_CONSTANTS } from '../../utils/sequenceLayout';

type Props = {
  layout: ActivationBarLayout;
  color?: string;
};

export default function ActivationBarEl({ layout, color = '#3b82f6' }: Props) {
  const { x, y, height } = layout;
  const w = SEQ_CONSTANTS.activationBarWidth;
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={height}
      fill={`${color}33`}
      stroke={color}
      strokeWidth={1}
      rx={2}
    />
  );
}
