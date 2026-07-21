"use client";

import { CheckCircle, ChevronRight, Clock, XCircle } from "lucide-react";

type GateStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

interface TimelineGroup {
  phase: number;
  projectPlanApproved: boolean;
  gate1Status: GateStatus;
  gate2Status: GateStatus;
  gate3Status: GateStatus;
  gate4Status: GateStatus;
}

interface PhaseGateTimelineProps {
  group: TimelineGroup;
  effectivePhase: number;
  viewingPhase: number | null;
  onNavigate: (phase: number | null) => void;
}

const PHASES = [
  { num: 1, name: "Projektdefinition", activeClass: "bg-blue-100 text-blue-700" },
  { num: 2, name: "Projektplan", activeClass: "bg-purple-100 text-purple-700" },
  { num: 3, name: "Utredning", activeClass: "bg-orange-100 text-orange-700" },
  { num: 4, name: "Redovisning", activeClass: "bg-green-100 text-green-700" },
];

const GATE_LABELS: Record<number, string> = {
  1: "Projektdirektiv",
  2: "Projektplan",
  3: "Utredningsrapport",
  4: "Slutredovisning",
};

// The marker between/after phases shows the gate's state at a glance
function GateMarker({ gateNumber, status }: { gateNumber: number; status: GateStatus }) {
  const label = `Gate ${gateNumber} (${GATE_LABELS[gateNumber]})`;
  switch (status) {
    case "approved":
      return (
        <span title={`${label}: godkänd`} aria-label={`${label}: godkänd`}>
          <CheckCircle className="w-3.5 h-3.5 text-green-500 mx-0.5" />
        </span>
      );
    case "pending":
      return (
        <span title={`${label}: väntar på lärarens godkännande`} aria-label={`${label}: väntar på godkännande`}>
          <Clock className="w-3.5 h-3.5 text-yellow-500 mx-0.5 animate-pulse" />
        </span>
      );
    case "rejected":
      return (
        <span title={`${label}: begär komplettering`} aria-label={`${label}: begär komplettering`}>
          <XCircle className="w-3.5 h-3.5 text-red-500 mx-0.5" />
        </span>
      );
    default:
      return <ChevronRight className="w-3 h-3 text-gray-300 mx-0.5" aria-hidden="true" />;
  }
}

export function PhaseGateTimeline({ group, effectivePhase, viewingPhase, onNavigate }: PhaseGateTimelineProps) {
  const gateStatus = (num: number): GateStatus => {
    switch (num) {
      case 1: return group.gate1Status;
      case 2: return group.gate2Status;
      case 3: return group.gate3Status;
      default: return group.gate4Status;
    }
  };

  return (
    <div className="flex items-center gap-1" aria-label="Fas- och gate-status">
      {PHASES.map((phase, index) => {
        const isActive = group.phase === phase.num;
        const isCompleted = group.phase > phase.num ||
          (phase.num === 1 && (group.gate1Status === 'approved' || group.projectPlanApproved)) ||
          gateStatus(phase.num) === 'approved';
        const isPending = gateStatus(phase.num) === 'pending';
        const isViewing = effectivePhase === phase.num;
        const canNavigate = isCompleted || isActive;

        const bgColor = isViewing && viewingPhase !== null
          ? "bg-blue-200 text-blue-800 ring-2 ring-blue-400"
          : isCompleted
          ? "bg-green-100 text-green-700"
          : isPending
          ? "bg-yellow-100 text-yellow-700"
          : isActive
          ? phase.activeClass
          : "bg-gray-100 text-gray-400";

        return (
          <div key={phase.num} className="flex items-center">
            <button
              onClick={() => {
                if (canNavigate) {
                  onNavigate(phase.num === group.phase ? null : phase.num);
                }
              }}
              disabled={!canNavigate}
              className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${bgColor} ${canNavigate ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
            >
              {isCompleted && <CheckCircle className="w-3 h-3 inline mr-1" />}
              {isPending && <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1 animate-pulse" />}
              <span className="hidden sm:inline">{phase.num}. {phase.name}</span>
              <span className="sm:hidden">{phase.num}</span>
            </button>
            <GateMarker gateNumber={phase.num} status={gateStatus(phase.num)} />
          </div>
        );
      })}
    </div>
  );
}
