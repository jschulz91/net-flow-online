import type { Lifeline, SequenceMessage, ActivationBar, SequenceFragment, SequenceZone } from '../types';

export const SEQ_CONSTANTS = {
  zoneHeaderHeight: 28,       // space above lifeline boxes reserved for zone labels
  lifelineBoxHeight: 64,      // height of each lifeline header box
  lifelineHeaderHeight: 120,  // zoneHeaderHeight(28) + gap(8) + boxHeight(64) + gap(20)
  rowHeight: 72,
  lifelineSpacing: 240,
  activationBarWidth: 14,
  leftMargin: 80,
  selfMessageOffset: 60,
};

export type LifelineLayout = {
  lifelineId: string;
  x: number;
  headerY: number;
};

export type MessageLayout = {
  messageId: string;
  fromX: number;
  toX: number;
  y: number;
  isSelf: boolean;
};

export type ActivationBarLayout = {
  barId: string;
  x: number;
  y: number;
  height: number;
};

export type FragmentLayout = {
  fragmentId: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export function computeLifelineLayout(lifelines: Lifeline[]): LifelineLayout[] {
  const sorted = [...lifelines].sort((a, b) => a.order - b.order);
  return sorted.map((ll, i) => ({
    lifelineId: ll.id,
    x: SEQ_CONSTANTS.leftMargin + i * SEQ_CONSTANTS.lifelineSpacing,
    headerY: 0,
  }));
}

export function computeMessageLayout(
  messages: SequenceMessage[],
  lifelineLayouts: LifelineLayout[],
): MessageLayout[] {
  const llMap = new Map(lifelineLayouts.map((l) => [l.lifelineId, l.x]));
  const sorted = [...messages].sort((a, b) => a.order - b.order);

  return sorted.map((msg, i) => {
    const fromX = llMap.get(msg.fromLifelineId) ?? 0;
    const toX = llMap.get(msg.toLifelineId) ?? 0;
    const isSelf = msg.fromLifelineId === msg.toLifelineId;
    const y =
      SEQ_CONSTANTS.lifelineHeaderHeight +
      i * SEQ_CONSTANTS.rowHeight +
      SEQ_CONSTANTS.rowHeight / 2;
    return { messageId: msg.id, fromX, toX, y, isSelf };
  });
}

// computeActivationBarLayouts kept for backward-compat but no longer used in canvas —
// bars now use explicit y/height from ActivationBar data directly.
export function computeActivationBarLayouts(
  _bars: ActivationBar[],
  _messages: SequenceMessage[],
  _lifelineLayouts: LifelineLayout[],
): ActivationBarLayout[] {
  return [];
}

export function computeFragmentLayouts(
  fragments: SequenceFragment[],
  messages: SequenceMessage[],
  lifelineLayouts: LifelineLayout[],
): FragmentLayout[] {
  const { rowHeight, lifelineHeaderHeight, lifelineSpacing, leftMargin } = SEQ_CONSTANTS;
  const sortedLL = [...lifelineLayouts].sort((a, b) => a.x - b.x);

  return fragments.map((frag) => {
    const msgsSorted = [...messages].sort((a, b) => a.order - b.order);
    const startMsg = msgsSorted.find((m) => m.order >= frag.startMessageOrder);
    const endMsg = [...msgsSorted].reverse().find((m) => m.order <= frag.endMessageOrder);
    const startIdx = startMsg ? msgsSorted.indexOf(startMsg) : 0;
    const endIdx = endMsg ? msgsSorted.indexOf(endMsg) : startIdx;

    const coveredLayouts = frag.lifelineIds.length > 0
      ? lifelineLayouts.filter((l) => frag.lifelineIds.includes(l.lifelineId))
      : sortedLL;
    const minX = coveredLayouts.reduce((m, l) => Math.min(m, l.x), Infinity) - lifelineSpacing / 2;
    const maxX = coveredLayouts.reduce((m, l) => Math.max(m, l.x), -Infinity) + lifelineSpacing / 2;

    return {
      fragmentId: frag.id,
      x: isFinite(minX) ? minX : leftMargin,
      y: lifelineHeaderHeight + startIdx * rowHeight - rowHeight / 4,
      width: isFinite(maxX) && isFinite(minX) ? maxX - minX : lifelineSpacing,
      height: (endIdx - startIdx + 1) * rowHeight + rowHeight / 2,
    };
  });
}

export type ZoneLayout = {
  zoneId: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export function computeZoneLayouts(
  zones: SequenceZone[],
  _lifelineLayouts: LifelineLayout[],
  totalHeight: number,
): ZoneLayout[] {
  return zones.map((zone) => ({
    zoneId: zone.id,
    x: zone.x,
    y: 0,
    width: zone.width,
    height: totalHeight,
  }));
}

export function totalSequenceWidth(lifelines: Lifeline[]): number {
  return SEQ_CONSTANTS.leftMargin + lifelines.length * SEQ_CONSTANTS.lifelineSpacing + 60;
}

export function totalSequenceHeight(messages: SequenceMessage[]): number {
  return (
    SEQ_CONSTANTS.lifelineHeaderHeight + messages.length * SEQ_CONSTANTS.rowHeight + 60
  );
}
