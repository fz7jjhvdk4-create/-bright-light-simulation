// Gate 3 submission requirements — shared between the submit-gate API
// (enforcement) and the student UI (live checklist), so they always agree.

export const GATE3_MIN_INTERVIEWS = 6;
export const GATE3_MIN_QC_TOOLS = 4;
export const GATE3_MIN_QM_TOOLS = 2;

// Valid tool keys; completedTools may contain stale entries (e.g. the
// retired matrix tool), so counts are filtered against these
export const QC_TOOL_KEYS = [
  "checksheet", "histogram", "pareto", "causeEffect",
  "scatter", "controlChart", "stratification",
];
export const QM_TOOL_KEYS = [
  "affinity", "relations", "tree", "arrow", "pdpc", "prioritization",
];

export interface Gate3Requirement {
  label: string;
  current: number;
  required: number;
  met: boolean;
}

export function evaluateGate3(
  interviewsCount: number,
  completed7qc: string[],
  completed7qm: string[]
): { items: Gate3Requirement[]; allMet: boolean } {
  const qcCount = completed7qc.filter(key => QC_TOOL_KEYS.includes(key)).length;
  const qmCount = completed7qm.filter(key => QM_TOOL_KEYS.includes(key)).length;

  const items: Gate3Requirement[] = [
    {
      label: "Roller intervjuade",
      current: interviewsCount,
      required: GATE3_MIN_INTERVIEWS,
      met: interviewsCount >= GATE3_MIN_INTERVIEWS,
    },
    {
      label: "7QC-verktyg avklarade",
      current: qcCount,
      required: GATE3_MIN_QC_TOOLS,
      met: qcCount >= GATE3_MIN_QC_TOOLS,
    },
    {
      label: "7QM-verktyg avklarade",
      current: qmCount,
      required: GATE3_MIN_QM_TOOLS,
      met: qmCount >= GATE3_MIN_QM_TOOLS,
    },
  ];

  return { items, allMet: items.every(item => item.met) };
}
