import { useAppStore } from '../../store/appStore';
import NodeProperties from './NodeProperties';
import EdgeProperties from './EdgeProperties';
import LaneProperties from './LaneProperties';
import LifelineProperties from './LifelineProperties';
import MessageProperties from './MessageProperties';
import MetaProperties from './MetaProperties';
import ZoneProperties from './ZoneProperties';
import ActivationBarProperties from './ActivationBarProperties';
import FragmentProperties from './FragmentProperties';

export default function PropertiesPanel() {
  const ui = useAppStore((s) => s.ui);
  const show = ui.showRightPanel;

  const hasSelection =
    ui.selectedNodeId ||
    ui.selectedEdgeId ||
    ui.selectedLaneId ||
    ui.selectedLifelineId ||
    ui.selectedMessageId ||
    ui.selectedZoneId ||
    ui.selectedBarId;

  return (
    <div className={`shrink-0 overflow-hidden transition-all duration-200 ${show ? 'w-56' : 'w-0'}`}>
    <div className="w-56 bg-white border-l border-slate-200 flex flex-col overflow-y-auto h-full">
      <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
        Eigenschaften
      </div>
      <div className="p-3 flex-1">
        {!hasSelection && <MetaProperties />}
        {ui.selectedNodeId && <NodeProperties />}
        {ui.selectedEdgeId && <EdgeProperties />}
        {ui.selectedLaneId && <LaneProperties />}
        {ui.selectedLifelineId && <LifelineProperties />}
        {ui.selectedMessageId && <MessageProperties />}
        {ui.selectedZoneId && <ZoneProperties />}
        {ui.selectedBarId && <ActivationBarProperties />}
        {ui.selectedFragmentId && <FragmentProperties />}
      </div>
    </div>
    </div>
  );
}
