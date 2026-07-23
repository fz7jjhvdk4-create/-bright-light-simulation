import type { Dispatch, SetStateAction } from "react";

export interface AffinityData {
  title: string;
  groups: {
    name: string;
    items: string[];
  }[];
}

export interface RelationsData {
  title: string;
  items: string[];
  relations: { from: number; to: number }[];
}

export interface TreeData {
  title: string;
  goal: string;
  branches: {
    name: string;
    subBranches: string[];
  }[];
}

export interface MatrixData {
  title: string;
  rowLabels: string[];
  colLabels: string[];
  values: string[][];
}

export interface ArrowData {
  title: string;
  activities: {
    name: string;
    duration: number;
    dependencies: number[];
  }[];
}

export interface PDPCData {
  title: string;
  goal: string;
  steps: {
    name: string;
    problems: {
      problem: string;
      countermeasure: string;
    }[];
  }[];
}

export interface PrioritizationData {
  title: string;
  criteria: string[];
  options: string[];
  scores: number[][];
}

export interface ToolsState {
  affinity: AffinityData;
  relations: RelationsData;
  tree: TreeData;
  matrix: MatrixData;
  arrow: ArrowData;
  pdpc: PDPCData;
  prioritization: PrioritizationData;
  completedTools: string[];
}

export const defaultState: ToolsState = {
  affinity: {
    title: "Affinitetsdiagram",
    groups: [
      { name: "Grupp 1", items: [] },
      { name: "Grupp 2", items: [] }
    ]
  },
  relations: {
    title: "Relationsdiagram",
    items: [],
    relations: []
  },
  tree: {
    title: "Träddiagram",
    goal: "",
    branches: []
  },
  matrix: {
    title: "Matrisdiagram",
    rowLabels: ["Faktor 1", "Faktor 2"],
    colLabels: ["Alternativ A", "Alternativ B"],
    values: [["", ""], ["", ""]]
  },
  arrow: {
    title: "Pildiagram (nätverksplan)",
    activities: []
  },
  pdpc: {
    title: "PDPC",
    goal: "",
    steps: []
  },
  prioritization: {
    title: "Prioriteringsmatris",
    criteria: ["Effekt", "Kostnad", "Tid"],
    options: [],
    scores: []
  },
  completedTools: []
};

export const toolDescriptions = {
  affinity: {
    name: "Affinitetsdiagram",
    description: "Organisera idéer och data i naturliga grupperingar",
    icon: "🗂️"
  },
  relations: {
    name: "Relationsdiagram",
    description: "Visa orsak-verkan-samband mellan faktorer",
    icon: "🔗"
  },
  tree: {
    name: "Träddiagram",
    description: "Bryt ned mål i delmål och åtgärder",
    icon: "🌳"
  },
  matrix: {
    name: "Matrisdiagram",
    description: "Analysera samband mellan olika faktorer",
    icon: "📋"
  },
  arrow: {
    name: "Pildiagram",
    description: "Planera aktiviteter och beroenden över tid",
    icon: "➡️"
  },
  pdpc: {
    name: "PDPC",
    description: "Process Decision Program Chart - planera för problem",
    icon: "🛡️"
  },
  prioritization: {
    name: "Prioriteringsmatris",
    description: "Rangordna alternativ baserat på kriterier",
    icon: "⚖️"
  }
};

export interface QMToolProps {
  state: ToolsState;
  setState: Dispatch<SetStateAction<ToolsState>>;
  markToolComplete: (toolKey: string) => void;
}
