import { useRef, useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import {
  computeLifelineLayout,
  computeMessageLayout,
  computeActivationBarLayouts,
  computeFragmentLayouts,
  computeZoneLayouts,
  totalSequenceWidth,
  totalSequenceHeight,
  SEQ_CONSTANTS,
} from '../../utils/sequenceLayout';
import LifelineColumn from './LifelineColumn';
import MessageArrow from './MessageArrow';
import FragmentBox from './FragmentBox';
import ActivationBarEl from './ActivationBarEl';

// ─── drag types ──────────────────────────────────────────────────────────────
type MsgDrag = { kind: 'msg';  id: string; startOrder: number; targetOrder: number };
type LLDrag  = { kind: 'll';   id: string; startOrder: number; targetOrder: number };
type ZoneDrag= { kind: 'zone'; id: string; startX: number; originX: number };
type ZoneResize = { kind: 'zresize'; id: string; startMouseX: number; originWidth: number };
type Drag = MsgDrag | LLDrag | ZoneDrag | ZoneResize;

// ─── helpers ─────────────────────────────────────────────────────────────────
function yToMsgOrder(mouseY: number, count: number): number {
  const { lifelineHeaderHeight, rowHeight } = SEQ_CONSTANTS;
  return Math.max(0, Math.min(count - 1,
    Math.floor((mouseY - lifelineHeaderHeight) / rowHeight)));
}
function xToLLOrder(mouseX: number, count: number): number {
  const { leftMargin, lifelineSpacing } = SEQ_CONSTANTS;
  return Math.max(0, Math.min(count - 1,
    Math.round((mouseX - leftMargin) / lifelineSpacing)));
}

export default function SequenceCanvas() {
  const canvas         = useAppStore((s) => s.sequence[s.ui.activeMode]);
  const selectedLLId   = useAppStore((s) => s.ui.selectedLifelineId);
  const selectedMsgId  = useAppStore((s) => s.ui.selectedMessageId);
  const selectedZoneId = useAppStore((s) => s.ui.selectedZoneId);
  const { reorderMessage, reorderLifeline, selectZone, updateZone } = useAppStore();

  const svgRef   = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);

  const lifelineLayouts   = computeLifelineLayout(canvas.lifelines);
  const messageLayouts    = computeMessageLayout(canvas.messages, lifelineLayouts);
  const activationLayouts = computeActivationBarLayouts(canvas.activationBars, canvas.messages, lifelineLayouts);
  const fragmentLayouts   = computeFragmentLayouts(canvas.fragments, canvas.messages, lifelineLayouts);

  const width  = Math.max(900, totalSequenceWidth(canvas.lifelines));
  const height = Math.max(500, totalSequenceHeight(canvas.messages));

  const zones       = canvas.zones ?? [];
  const zoneLayouts = computeZoneLayouts(zones, lifelineLayouts, height);

  // Stable ref so mouseup closure always sees latest zones
  const zonesRef = useRef(zones);
  useEffect(() => { zonesRef.current = canvas.zones ?? []; });

  const lifelineMap  = new Map(canvas.lifelines.map((l) => [l.id, l]));
  const msgLayoutMap = new Map(messageLayouts.map((ml) => [ml.messageId, ml]));
  const msgOrderMap  = new Map(canvas.messages.map((m) => [m.id, m.order]));
  const llOrderMap   = new Map(canvas.lifelines.map((l) => [l.id, l.order]));
  const zoneMap      = new Map(zones.map((z) => [z.id, z]));

  // ─── global mouseup ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!drag) return;
    const onUp = (e: MouseEvent) => {
      if (!svgRef.current) { setDrag(null); return; }
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      if (drag.kind === 'msg') reorderMessage(drag.id, drag.targetOrder);

      if (drag.kind === 'll') {
        reorderLifeline(drag.id, drag.targetOrder);
        // Auto-update zone membership based on new x position
        const { leftMargin, lifelineSpacing } = SEQ_CONSTANTS;
        const newX = leftMargin + drag.targetOrder * lifelineSpacing;
        for (const zone of zonesRef.current) {
          const inside = newX >= zone.x && newX <= zone.x + zone.width;
          const wasIn  = zone.lifelineIds.includes(drag.id);
          if (inside && !wasIn)
            updateZone(zone.id, { lifelineIds: [...zone.lifelineIds, drag.id] });
          else if (!inside && wasIn)
            updateZone(zone.id, { lifelineIds: zone.lifelineIds.filter((id) => id !== drag.id) });
        }
      }

      if (drag.kind === 'zone') updateZone(drag.id, { x: drag.originX });

      if (drag.kind === 'zresize') {
        const newWidth = Math.max(60, drag.originWidth + (mouseX - drag.startMouseX));
        updateZone(drag.id, { width: newWidth });
      }
      setDrag(null);
    };
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, [drag, reorderMessage, reorderLifeline, updateZone]);

  // ─── svg mouse move ────────────────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!drag || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (drag.kind === 'msg') {
      const t = yToMsgOrder(mouseY, canvas.messages.length);
      if (t !== drag.targetOrder) setDrag({ ...drag, targetOrder: t });
    } else if (drag.kind === 'll') {
      const t = xToLLOrder(mouseX, canvas.lifelines.length);
      if (t !== drag.targetOrder) setDrag({ ...drag, targetOrder: t });
    } else if (drag.kind === 'zone') {
      const newX = Math.max(0, drag.originX + (mouseX - drag.startX));
      updateZone(drag.id, { x: newX });
      setDrag({ ...drag, startX: mouseX, originX: newX });
    } else if (drag.kind === 'zresize') {
      const zone = zoneMap.get(drag.id);
      if (zone) {
        const newWidth = Math.max(60, drag.originWidth + (mouseX - drag.startMouseX));
        updateZone(drag.id, { width: newWidth });
      }
    }
  };

  // ─── drag starters ────────────────────────────────────────────────────────
  const startMsgDrag = (id: string, order: number) => (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    setDrag({ kind: 'msg', id, startOrder: order, targetOrder: order });
  };
  const startLLDrag = (id: string, order: number) => (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    setDrag({ kind: 'll', id, startOrder: order, targetOrder: order });
  };
  const startZoneDrag = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const rect = svgRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const zone = zoneMap.get(id);
    setDrag({ kind: 'zone', id, startX: mouseX, originX: zone?.x ?? 0 });
  };
  const startZoneResize = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const rect = svgRef.current!.getBoundingClientRect();
    const zone = zoneMap.get(id);
    setDrag({ kind: 'zresize', id, startMouseX: e.clientX - rect.left, originWidth: zone?.width ?? 200 });
  };

  // ─── ghost indicators ─────────────────────────────────────────────────────
  const { lifelineHeaderHeight, rowHeight, lifelineSpacing, leftMargin, zoneHeaderHeight } = SEQ_CONSTANTS;
  const ghostMsgY = drag?.kind === 'msg'
    ? lifelineHeaderHeight + drag.targetOrder * rowHeight + rowHeight / 2 : null;
  const ghostLLX = drag?.kind === 'll'
    ? leftMargin + drag.targetOrder * lifelineSpacing : null;

  const isDraggingZone = drag?.kind === 'zone' || drag?.kind === 'zresize';

  return (
    <div
      className="flex-1 overflow-auto bg-slate-50"
      style={{ cursor: isDraggingZone ? 'grabbing' : drag ? 'ns-resize' : 'default' }}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="block select-none"
        style={{ minWidth: '100%', minHeight: '100%' }}
        onMouseMove={handleMouseMove}
      >
        <defs>
          <pattern id="seq-dot"
            width={lifelineSpacing / 4} height={rowHeight / 4}
            patternUnits="userSpaceOnUse"
            x={leftMargin} y={lifelineHeaderHeight}
          >
            <circle cx={0} cy={0} r={1} fill="#e2e8f0" />
          </pattern>
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill="#f8fafc" onClick={() => selectZone(null)} />
        <rect width={width} height={height} fill="url(#seq-dot)" style={{ pointerEvents: 'none' }} />

        {/* Column guides */}
        {lifelineLayouts.map((ll) => (
          <line key={`col-${ll.lifelineId}`}
            x1={ll.x} y1={lifelineHeaderHeight} x2={ll.x} y2={height}
            stroke="#e2e8f0" strokeWidth={1} style={{ pointerEvents: 'none' }}
          />
        ))}

        {/* Row bands */}
        {messageLayouts.map((ml, i) => i % 2 === 0 ? (
          <rect key={`band-${i}`}
            x={0} y={ml.y - rowHeight / 2} width={width} height={rowHeight}
            fill="rgba(241,245,249,0.5)" style={{ pointerEvents: 'none' }}
          />
        ) : null)}

        {/* ── Zones ─────────────────────────────────────────────────────── */}
        {zones.map((zone, i) => {
          const layout = zoneLayouts[i];
          if (!layout) return null;
          const isSelected = selectedZoneId === zone.id;
          const labelW = Math.min((zone.label.length || 4) * 7.5 + 18, 220);
          const resizeHandleW = 8;

          return (
            <g key={zone.id}>
              {/* Main zone rect — draggable */}
              <rect
                x={layout.x} y={layout.y}
                width={layout.width} height={layout.height}
                fill={zone.fillColor}
                stroke={zone.borderColor}
                strokeWidth={isSelected ? 2.5 : 1.5}
                strokeDasharray="10 5"
                rx={8}
                style={{ cursor: 'grab' }}
                onMouseDown={startZoneDrag(zone.id)}
                onClick={(e) => { e.stopPropagation(); selectZone(zone.id); }}
              />

              {/* Resize handle — right edge */}
              <rect
                x={layout.x + layout.width - resizeHandleW}
                y={layout.y + 30}
                width={resizeHandleW}
                height={layout.height - 60}
                fill={zone.borderColor}
                opacity={isSelected ? 0.4 : 0.15}
                rx={3}
                style={{ cursor: 'ew-resize' }}
                onMouseDown={startZoneResize(zone.id)}
                onClick={(e) => e.stopPropagation()}
              />
              <line
                x1={layout.x + layout.width - 4} y1={layout.y + layout.height / 2 - 10}
                x2={layout.x + layout.width - 4} y2={layout.y + layout.height / 2 + 10}
                stroke={zone.borderColor} strokeWidth={1.5} style={{ pointerEvents: 'none' }}
              />

              {/* Label badge — in zone header strip */}
              <rect
                x={layout.x + 10} y={4}
                width={labelW} height={20}
                rx={4} fill={zone.borderColor} opacity={0.95}
                style={{ pointerEvents: 'none' }}
              />
              <text
                x={layout.x + 18} y={14}
                fontSize={11} fontWeight={700} fill="white"
                dominantBaseline="middle"
                style={{ pointerEvents: 'none' }}
              >
                {zone.label}
              </text>
            </g>
          );
        })}

        {/* Fragment boxes */}
        {canvas.fragments.map((frag, i) => {
          const layout = fragmentLayouts[i];
          return layout ? <FragmentBox key={frag.id} fragment={frag} layout={layout} /> : null;
        })}

        {/* Lifelines */}
        {lifelineLayouts.map((ll) => {
          const lifeline = lifelineMap.get(ll.lifelineId);
          if (!lifeline) return null;
          const isDragging = drag?.kind === 'll' && drag.id === lifeline.id;
          const order = llOrderMap.get(lifeline.id) ?? 0;
          return (
            <LifelineColumn
              key={ll.lifelineId}
              lifeline={lifeline}
              x={ll.x}
              totalHeight={height}
              isSelected={selectedLLId === lifeline.id}
              isDragging={isDragging}
              onDragStart={startLLDrag(lifeline.id, order)}
            />
          );
        })}

        {/* Activation bars */}
        {activationLayouts.map((al) => {
          const bar = canvas.activationBars.find((b) => b.id === al.barId);
          const ll  = bar ? canvas.lifelines.find((l) => l.id === bar.lifelineId) : undefined;
          return <ActivationBarEl key={al.barId} layout={al} color={ll?.color} />;
        })}

        {/* Messages + drag handles */}
        {canvas.messages.map((msg) => {
          const layout = msgLayoutMap.get(msg.id);
          if (!layout) return null;
          const isDragging = drag?.kind === 'msg' && drag.id === msg.id;
          const order = msgOrderMap.get(msg.id) ?? 0;
          return (
            <g key={msg.id} opacity={isDragging ? 0.3 : 1}>
              <rect
                x={leftMargin - 24} y={layout.y - 14}
                width={16} height={28} rx={3}
                fill={isDragging ? '#bfdbfe' : '#f1f5f9'}
                stroke="#cbd5e1" strokeWidth={0.5}
                style={{ cursor: 'grab' }}
                onMouseDown={startMsgDrag(msg.id, order)}
              />
              {[0, 1, 2].map((row) => [0, 1].map((col) => (
                <circle key={`d-${row}-${col}`}
                  cx={leftMargin - 20 + col * 6} cy={layout.y - 6 + row * 8}
                  r={1.5} fill="#94a3b8" style={{ pointerEvents: 'none' }}
                />
              )))}
              <MessageArrow message={msg} layout={layout} isSelected={selectedMsgId === msg.id} />
            </g>
          );
        })}

        {/* Ghost: message row */}
        {ghostMsgY !== null && (
          <g pointerEvents="none">
            <line x1={leftMargin - 4} y1={ghostMsgY} x2={width - 16} y2={ghostMsgY}
              stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" />
            <circle cx={leftMargin - 4} cy={ghostMsgY} r={4} fill="#3b82f6" />
          </g>
        )}

        {/* Ghost: lifeline column */}
        {ghostLLX !== null && (
          <g pointerEvents="none">
            <line x1={ghostLLX} y1={0} x2={ghostLLX} y2={height}
              stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 3" opacity={0.7} />
            <circle cx={ghostLLX}
              cy={zoneHeaderHeight + 8 + SEQ_CONSTANTS.lifelineBoxHeight / 2}
              r={6} fill="#8b5cf6" opacity={0.8} />
          </g>
        )}
      </svg>
    </div>
  );
}
