import { useRef, useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store/appStore';
import {
  computeLifelineLayout,
  computeMessageLayout,
  computeFragmentLayouts,
  computeZoneLayouts,
  totalSequenceWidth,
  totalSequenceHeight,
  SEQ_CONSTANTS,
} from '../../utils/sequenceLayout';
import LifelineColumn, { LIFELINE_ICONS } from './LifelineColumn';
import MessageArrow from './MessageArrow';
import FragmentBox from './FragmentBox';
import ActivationBarEl from './ActivationBarEl';
import { SequenceStickyNotes } from '../Notes/StickyNoteOverlay';

// ─── drag union ──────────────────────────────────────────────────────────────
type MsgDrag     = { kind: 'msg';        id: string; startOrder: number; targetOrder: number };
type LLDrag      = { kind: 'll';         id: string; startOrder: number; targetOrder: number };
type ZoneDrag    = { kind: 'zone';       id: string; startX: number; originX: number };
type ZoneResize  = { kind: 'zresize';   id: string; startMouseX: number; originWidth: number };
type BarCreate   = { kind: 'bar-create'; lifelineId: string; llX: number; startY: number; currentY: number };
type BarMove     = { kind: 'bar-move';   barId: string; llX: number; startMouseY: number; originY: number; barH: number };
type BarRTop     = { kind: 'bar-rtop';   barId: string; llX: number; startMouseY: number; originY: number; originH: number };
type BarRBot     = { kind: 'bar-rbot';   barId: string; llX: number; startMouseY: number; originH: number; originY: number };
type Drag = MsgDrag | LLDrag | ZoneDrag | ZoneResize | BarCreate | BarMove | BarRTop | BarRBot;

// ─── helpers ─────────────────────────────────────────────────────────────────
const { lifelineHeaderHeight, rowHeight, lifelineSpacing, leftMargin, zoneHeaderHeight } = SEQ_CONSTANTS;

function yToMsgOrder(mouseY: number, count: number) {
  return Math.max(0, Math.min(count - 1, Math.floor((mouseY - lifelineHeaderHeight) / rowHeight)));
}
function xToLLOrder(mouseX: number, count: number) {
  return Math.max(0, Math.min(count - 1, Math.round((mouseX - leftMargin) / lifelineSpacing)));
}

export default function SequenceCanvas() {
  const canvas            = useAppStore((s) => s.sequence[s.ui.activeMode]);
  const selectedLLId      = useAppStore((s) => s.ui.selectedLifelineId);
  const selectedMsgId     = useAppStore((s) => s.ui.selectedMessageId);
  const selectedZoneId    = useAppStore((s) => s.ui.selectedZoneId);
  const selectedBarId     = useAppStore((s) => s.ui.selectedBarId);
  const selectedFragmentId = useAppStore((s) => s.ui.selectedFragmentId);
  const {
    reorderMessage, reorderLifeline, selectZone, updateZone,
    addActivationBar, updateActivationBar, removeActivationBar, selectBar,
    selectFragment,
  } = useAppStore();

  const svgRef         = useRef<SVGSVGElement>(null);
  const containerRef   = useRef<HTMLDivElement>(null);
  const stickyHdrRef   = useRef<SVGGElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);

  // Scroll → sticky header follows without causing React re-renders
  const handleScroll = useCallback(() => {
    const top = containerRef.current?.scrollTop ?? 0;
    stickyHdrRef.current?.setAttribute('transform', `translate(0,${top})`);
  }, []);

  const lifelineLayouts = computeLifelineLayout(canvas.lifelines);
  const messageLayouts  = computeMessageLayout(canvas.messages, lifelineLayouts);
  const fragmentLayouts = computeFragmentLayouts(canvas.fragments, canvas.messages, lifelineLayouts);

  const width  = Math.max(900, totalSequenceWidth(canvas.lifelines));
  const height = Math.max(500, totalSequenceHeight(canvas.messages));

  const zones       = canvas.zones ?? [];
  const zoneLayouts = computeZoneLayouts(zones, lifelineLayouts, height);
  const bars        = canvas.activationBars;

  // Stable refs so mouseup closures see latest state
  const zonesRef = useRef(zones);
  const barsRef  = useRef(bars);
  useEffect(() => { zonesRef.current = canvas.zones ?? []; });
  useEffect(() => { barsRef.current  = canvas.activationBars; });

  const lifelineMap  = new Map(canvas.lifelines.map((l) => [l.id, l]));
  const llLayoutMap  = new Map(lifelineLayouts.map((ll) => [ll.lifelineId, ll.x]));
  const msgLayoutMap = new Map(messageLayouts.map((ml) => [ml.messageId, ml]));
  const msgOrderMap  = new Map(canvas.messages.map((m) => [m.id, m.order]));
  const llOrderMap   = new Map(canvas.lifelines.map((l) => [l.id, l.order]));
  const zoneMap      = new Map(zones.map((z) => [z.id, z]));

  // ─── global mouseup ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!drag) return;
    const onUp = (e: MouseEvent) => {
      const rect = svgRef.current?.getBoundingClientRect();
      const mouseX = rect ? e.clientX - rect.left : 0;
      const mouseY = rect ? e.clientY - rect.top  : 0;

      if (drag.kind === 'msg') reorderMessage(drag.id, drag.targetOrder);

      if (drag.kind === 'll') {
        reorderLifeline(drag.id, drag.targetOrder);
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

      if (drag.kind === 'zone')    updateZone(drag.id, { x: drag.originX });
      if (drag.kind === 'zresize') {
        const w = Math.max(60, drag.originWidth + (mouseX - drag.startMouseX));
        updateZone(drag.id, { width: w });
      }

      if (drag.kind === 'bar-create') {
        const y = Math.min(drag.startY, drag.currentY);
        const h = Math.abs(drag.currentY - drag.startY);
        if (h >= 20) addActivationBar({ lifelineId: drag.lifelineId, y, height: h });
      }
      if (drag.kind === 'bar-move') {
        const delta = mouseY - drag.startMouseY;
        updateActivationBar(drag.barId, { y: Math.max(lifelineHeaderHeight, drag.originY + delta) });
      }
      if (drag.kind === 'bar-rtop') {
        const delta = mouseY - drag.startMouseY;
        const newY  = drag.originY + delta;
        const newH  = drag.originH - delta;
        if (newH >= 20) updateActivationBar(drag.barId, { y: newY, height: newH });
      }
      if (drag.kind === 'bar-rbot') {
        const delta = mouseY - drag.startMouseY;
        updateActivationBar(drag.barId, { height: Math.max(20, drag.originH + delta) });
      }
      setDrag(null);
    };
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, [drag, reorderMessage, reorderLifeline, updateZone, addActivationBar, updateActivationBar]);

  // ─── svg mousemove ────────────────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!drag || !svgRef.current) return;
    const rect  = svgRef.current.getBoundingClientRect();
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
      if (zone) updateZone(drag.id, { width: Math.max(60, drag.originWidth + (mouseX - drag.startMouseX)) });
    } else if (drag.kind === 'bar-create') {
      if (mouseY !== drag.currentY) setDrag({ ...drag, currentY: mouseY });
    } else if (drag.kind === 'bar-move') {
      const delta = mouseY - drag.startMouseY;
      updateActivationBar(drag.barId, { y: Math.max(lifelineHeaderHeight, drag.originY + delta) });
    } else if (drag.kind === 'bar-rtop') {
      const delta = mouseY - drag.startMouseY;
      const newY  = drag.originY + delta;
      const newH  = drag.originH - delta;
      if (newH >= 20) updateActivationBar(drag.barId, { y: newY, height: newH });
    } else if (drag.kind === 'bar-rbot') {
      const delta = mouseY - drag.startMouseY;
      updateActivationBar(drag.barId, { height: Math.max(20, drag.originH + delta) });
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
    setDrag({ kind: 'zone', id, startX: e.clientX - rect.left, originX: zoneMap.get(id)?.x ?? 0 });
  };
  const startZoneResize = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const rect = svgRef.current!.getBoundingClientRect();
    setDrag({ kind: 'zresize', id, startMouseX: e.clientX - rect.left, originWidth: zoneMap.get(id)?.width ?? 200 });
  };
  const startBarCreate = (lifelineId: string, llX: number) => (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const rect = svgRef.current!.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    setDrag({ kind: 'bar-create', lifelineId, llX, startY: mouseY, currentY: mouseY });
  };
  const startBarMove = (barId: string, llX: number, bar: { y: number; height: number }) => (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const rect = svgRef.current!.getBoundingClientRect();
    setDrag({ kind: 'bar-move', barId, llX, startMouseY: e.clientY - rect.top, originY: bar.y, barH: bar.height });
  };
  const startBarRTop = (barId: string, llX: number, bar: { y: number; height: number }) => (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const rect = svgRef.current!.getBoundingClientRect();
    setDrag({ kind: 'bar-rtop', barId, llX, startMouseY: e.clientY - rect.top, originY: bar.y, originH: bar.height });
  };
  const startBarRBot = (barId: string, llX: number, bar: { y: number; height: number }) => (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const rect = svgRef.current!.getBoundingClientRect();
    setDrag({ kind: 'bar-rbot', barId, llX, startMouseY: e.clientY - rect.top, originH: bar.height, originY: bar.y });
  };

  // ─── zone click: cycle through overlapping zones at the same x position ──
  const handleZoneClick = (zoneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!svgRef.current) { selectZone(zoneId); return; }

    const rect  = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    // All zones whose horizontal span contains the click point
    const hits = zones
      .map((zone, i) => ({ zone, layout: zoneLayouts[i] }))
      .filter(({ layout }) => layout && clickX >= layout.x && clickX <= layout.x + layout.width);

    if (hits.length <= 1) { selectZone(zoneId); return; }

    // If any zone at this point is already selected, cycle one step downward in render order
    const selIdx = hits.findIndex(({ zone }) => zone.id === selectedZoneId);
    if (selIdx === -1) { selectZone(zoneId); return; }

    // hits is in render order (index 0 = bottom, last = top); go downward to reach zones below
    const nextIdx = (selIdx - 1 + hits.length) % hits.length;
    selectZone(hits[nextIdx].zone.id);
  };

  // ─── ghost indicators ─────────────────────────────────────────────────────
  const ghostMsgY = drag?.kind === 'msg'
    ? lifelineHeaderHeight + drag.targetOrder * rowHeight + rowHeight / 2 : null;
  const ghostLLX  = drag?.kind === 'll'
    ? leftMargin + drag.targetOrder * lifelineSpacing : null;

  const barPreview = drag?.kind === 'bar-create' && Math.abs(drag.currentY - drag.startY) >= 8
    ? { x: drag.llX, y: Math.min(drag.startY, drag.currentY), h: Math.abs(drag.currentY - drag.startY) }
    : null;

  const cursorStyle = drag
    ? (drag.kind === 'zone' ? 'grabbing'
     : drag.kind === 'zresize' || drag.kind === 'bar-rtop' || drag.kind === 'bar-rbot' ? 'ns-resize'
     : drag.kind === 'bar-create' ? 'crosshair'
     : 'grabbing')
    : 'default';

  // ─── keyboard: Del to remove selected bar ────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedBarId) {
        removeActivationBar(selectedBarId);
        selectBar(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedBarId, removeActivationBar, selectBar]);

  const { lifelineBoxHeight } = SEQ_CONSTANTS;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-auto bg-slate-50"
      style={{ cursor: cursorStyle }}
    >
      <div className="relative" style={{ width, height, minWidth: '100%', minHeight: '100%' }}>
      <svg
        ref={svgRef}
        width={width} height={height}
        className="block select-none absolute top-0 left-0"
        onMouseMove={handleMouseMove}
        onClick={() => { selectZone(null); selectBar(null); selectFragment(null); }}
      >
        <defs>
          <pattern id="seq-dot"
            width={lifelineSpacing / 4} height={rowHeight / 4}
            patternUnits="userSpaceOnUse" x={leftMargin} y={lifelineHeaderHeight}>
            <circle cx={0} cy={0} r={1} fill="#e2e8f0" />
          </pattern>
        </defs>

        <rect width={width} height={height} fill="#f8fafc" />
        <rect width={width} height={height} fill="url(#seq-dot)" style={{ pointerEvents: 'none' }} />

        {/* Column guides */}
        {lifelineLayouts.map((ll) => (
          <line key={`col-${ll.lifelineId}`}
            x1={ll.x} y1={lifelineHeaderHeight} x2={ll.x} y2={height}
            stroke="#e2e8f0" strokeWidth={1} style={{ pointerEvents: 'none' }} />
        ))}

        {/* Row bands */}
        {messageLayouts.map((ml, i) => i % 2 === 0 ? (
          <rect key={`band-${i}`}
            x={0} y={ml.y - rowHeight / 2} width={width} height={rowHeight}
            fill="rgba(241,245,249,0.5)" style={{ pointerEvents: 'none' }} />
        ) : null)}

        {/* Zones */}
        {zones.map((zone, i) => {
          const layout = zoneLayouts[i];
          if (!layout) return null;
          const isSelected = selectedZoneId === zone.id;
          const lw = Math.min((zone.label.length || 4) * 7.5 + 18, 220);
          return (
            <g key={zone.id}>
              <rect x={layout.x} y={0} width={layout.width} height={height}
                fill={zone.fillColor} stroke={zone.borderColor}
                strokeWidth={isSelected ? 2.5 : 1.5} strokeDasharray="10 5" rx={8}
                style={{ cursor: 'grab' }}
                onMouseDown={startZoneDrag(zone.id)}
                onClick={(e) => handleZoneClick(zone.id, e)} />
              <rect x={layout.x + layout.width - 8} y={30} width={8} height={height - 60}
                fill={zone.borderColor} opacity={isSelected ? 0.4 : 0.15} rx={3}
                style={{ cursor: 'ew-resize' }}
                onMouseDown={startZoneResize(zone.id)}
                onClick={(e) => e.stopPropagation()} />
              <rect x={layout.x + 10} y={4} width={lw} height={20} rx={4} fill={zone.borderColor} opacity={0.95} style={{ pointerEvents: 'none' }} />
              <text x={layout.x + 18} y={14} fontSize={11} fontWeight={700} fill="white" dominantBaseline="middle" style={{ pointerEvents: 'none' }}>{zone.label}</text>
            </g>
          );
        })}

        {/* Fragments */}
        {canvas.fragments.map((frag, i) => {
          const layout = fragmentLayouts[i];
          return layout ? (
            <FragmentBox
              key={frag.id}
              fragment={frag}
              layout={layout}
              isSelected={selectedFragmentId === frag.id}
              onSelect={() => selectFragment(frag.id)}
            />
          ) : null;
        })}

        {/* Lifelines (with bar-create hit area) */}
        {lifelineLayouts.map((ll) => {
          const lifeline = lifelineMap.get(ll.lifelineId);
          if (!lifeline) return null;
          const isDragging = drag?.kind === 'll' && drag.id === lifeline.id;
          return (
            <LifelineColumn
              key={ll.lifelineId}
              lifeline={lifeline}
              x={ll.x}
              totalHeight={height}
              isSelected={selectedLLId === lifeline.id}
              isDragging={isDragging}
              onDragStart={startLLDrag(lifeline.id, llOrderMap.get(lifeline.id) ?? 0)}
              onBarCreateStart={startBarCreate(lifeline.id, ll.x)}
            />
          );
        })}

        {/* Activation bars */}
        {bars.map((bar) => {
          const llX = llLayoutMap.get(bar.lifelineId);
          const ll  = lifelineMap.get(bar.lifelineId);
          if (llX === undefined || !ll) return null;
          return (
            <ActivationBarEl
              key={bar.id}
              bar={bar}
              x={llX}
              color={ll.color}
              isSelected={selectedBarId === bar.id}
              onSelect={() => selectBar(bar.id)}
              onMoveStart={startBarMove(bar.id, llX, bar)}
              onResizeTopStart={startBarRTop(bar.id, llX, bar)}
              onResizeBotStart={startBarRBot(bar.id, llX, bar)}
            />
          );
        })}

        {/* Bar creation preview */}
        {barPreview && (
          <rect
            x={barPreview.x - 7} y={barPreview.y}
            width={14} height={barPreview.h}
            fill="rgba(99,102,241,0.2)" stroke="#6366f1"
            strokeWidth={1.5} strokeDasharray="4 2" rx={2}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Messages + drag handles */}
        {canvas.messages.map((msg) => {
          const layout = msgLayoutMap.get(msg.id);
          if (!layout) return null;
          const isDragging = drag?.kind === 'msg' && drag.id === msg.id;
          const order = msgOrderMap.get(msg.id) ?? 0;
          return (
            <g key={msg.id} opacity={isDragging ? 0.3 : 1}>
              <rect x={leftMargin - 24} y={layout.y - 14} width={16} height={28} rx={3}
                fill={isDragging ? '#bfdbfe' : '#f1f5f9'} stroke="#cbd5e1" strokeWidth={0.5}
                style={{ cursor: 'grab' }}
                onMouseDown={startMsgDrag(msg.id, order)} />
              {[0, 1, 2].map((row) => [0, 1].map((col) => (
                <circle key={`d-${row}-${col}`}
                  cx={leftMargin - 20 + col * 6} cy={layout.y - 6 + row * 8}
                  r={1.5} fill="#94a3b8" style={{ pointerEvents: 'none' }} />
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

        {/* Ghost: lifeline drop indicator */}
        {ghostLLX !== null && (
          <g pointerEvents="none">
            <line x1={ghostLLX} y1={0} x2={ghostLLX} y2={height}
              stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 3" opacity={0.7} />
            <circle cx={ghostLLX}
              cy={zoneHeaderHeight + 8 + lifelineBoxHeight / 2}
              r={6} fill="#8b5cf6" opacity={0.8} />
          </g>
        )}

        {/* ── Sticky header (rendered last = on top; scrolls via setAttribute) ── */}
        <g ref={stickyHdrRef} style={{ pointerEvents: 'none' }}>
          {/* Opaque background strip */}
          <rect x={0} y={0} width={width} height={lifelineHeaderHeight}
            fill="#f8fafc" />
          {/* Zone fill strips in header area */}
          {zones.map((zone, i) => {
            const layout = zoneLayouts[i];
            if (!layout) return null;
            const lw = Math.min((zone.label.length || 4) * 7.5 + 18, 220);
            return (
              <g key={`shdr-zone-${zone.id}`}>
                <rect x={layout.x} y={0} width={layout.width} height={lifelineHeaderHeight}
                  fill={zone.fillColor} />
                {/* Top border of zone */}
                <rect x={layout.x} y={0} width={layout.width} height={2}
                  fill={zone.borderColor} opacity={0.5} />
                {/* Label badge */}
                <rect x={layout.x + 10} y={4} width={lw} height={20}
                  rx={4} fill={zone.borderColor} opacity={0.95} />
                <text x={layout.x + 18} y={14} fontSize={11} fontWeight={700}
                  fill="white" dominantBaseline="middle">{zone.label}</text>
              </g>
            );
          })}
          {/* Column guide lines in header */}
          {lifelineLayouts.map((ll) => (
            <line key={`shdr-col-${ll.lifelineId}`}
              x1={ll.x} y1={zoneHeaderHeight} x2={ll.x} y2={lifelineHeaderHeight}
              stroke="#e2e8f0" strokeWidth={1} />
          ))}
          {/* Lifeline header boxes */}
          {lifelineLayouts.map((ll) => {
            const lifeline = lifelineMap.get(ll.lifelineId);
            if (!lifeline) return null;
            const isSelected = selectedLLId === lifeline.id;
            const boxTop = zoneHeaderHeight + 8;
            const boxW = 130;
            const icon = lifeline.type === 'custom' && lifeline.icon
              ? lifeline.icon
              : (LIFELINE_ICONS[lifeline.type] ?? '▪');
            return (
              <g key={`shdr-ll-${ll.lifelineId}`}>
                <rect
                  x={ll.x - boxW / 2} y={boxTop}
                  width={boxW} height={lifelineBoxHeight}
                  rx={5}
                  fill={isSelected ? lifeline.color : 'white'}
                  stroke={lifeline.color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />
                <text x={ll.x} y={boxTop + 22} textAnchor="middle"
                  fontSize={18} dominantBaseline="middle">{icon}</text>
                <text x={ll.x} y={boxTop + 50} textAnchor="middle"
                  fontSize={11} fontWeight={600}
                  fill={isSelected ? 'white' : '#1e293b'}>{lifeline.label}</text>
              </g>
            );
          })}
          {/* Bottom shadow line */}
          <line x1={0} y1={lifelineHeaderHeight} x2={width} y2={lifelineHeaderHeight}
            stroke="#e2e8f0" strokeWidth={1.5} />
        </g>
      </svg>
      <SequenceStickyNotes width={width} height={height} />
      </div>
    </div>
  );
}
