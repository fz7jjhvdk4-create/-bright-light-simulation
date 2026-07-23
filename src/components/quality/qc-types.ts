import type { Dispatch, SetStateAction } from "react";

export interface ChecksheetData {
  title: string;
  categories: string[];
  data: number[][];
}

export interface HistogramData {
  title: string;
  bins: { label: string; count: number }[];
}

export interface ParetoData {
  title: string;
  items: { name: string; count: number }[];
}

export interface CauseEffectDiagram {
  id: string;
  problem: string;
  categories: {
    name: string;
    causes: string[];
  }[];
}

export interface CauseEffectData {
  problem: string;
  categories: {
    name: string;
    causes: string[];
  }[];
}

export interface ScatterData {
  title: string;
  xLabel: string;
  yLabel: string;
  points: { x: number; y: number }[];
}

export interface ControlChartData {
  title: string;
  measurements: number[];
  ucl: number;
  lcl: number;
  cl: number;
}

export interface StratificationData {
  title: string;
  groups: {
    name: string;
    values: number[];
  }[];
}

export interface ToolsState {
  checksheet: ChecksheetData;
  histogram: HistogramData;
  pareto: ParetoData;
  causeEffect: CauseEffectData | CauseEffectDiagram[];
  scatter: ScatterData;
  controlChart: ControlChartData;
  stratification: StratificationData;
  completedTools: string[];
}

export const defaultState: ToolsState = {
  checksheet: {
    title: "Feltypsregistrering",
    categories: ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag"],
    data: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
  },
  histogram: {
    title: "Frekvensfördelning",
    bins: [
      { label: "0-10", count: 0 },
      { label: "11-20", count: 0 },
      { label: "21-30", count: 0 },
      { label: "31-40", count: 0 },
      { label: "41-50", count: 0 }
    ]
  },
  pareto: {
    title: "Felorsaker",
    items: [
      { name: "Materialfel", count: 0 },
      { name: "Maskinfel", count: 0 },
      { name: "Mänskligt fel", count: 0 },
      { name: "Metodfel", count: 0 }
    ]
  },
  causeEffect: [
    {
      id: "ce-1",
      problem: "Kvalitetsproblem",
      categories: [
        { name: "Människa", causes: [] },
        { name: "Maskin", causes: [] },
        { name: "Material", causes: [] },
        { name: "Metod", causes: [] },
        { name: "Miljö", causes: [] },
        { name: "Mätning", causes: [] }
      ]
    }
  ],
  scatter: {
    title: "Sambandsdiagram",
    xLabel: "Variabel X",
    yLabel: "Variabel Y",
    points: []
  },
  controlChart: {
    title: "Styrdiagram",
    measurements: [],
    ucl: 0,
    lcl: 0,
    cl: 0
  },
  stratification: {
    title: "Stratifiering",
    groups: []
  },
  completedTools: []
};

export const toolDescriptions = {
  checksheet: {
    name: "Datainsamlingsblad",
    description: "Systematisk insamling av data för analys",
    icon: "📋"
  },
  histogram: {
    name: "Histogram",
    description: "Visar frekvensfördelning av data",
    icon: "📊"
  },
  pareto: {
    name: "Paretodiagram",
    description: "Identifierar de viktigaste orsakerna (80/20-regeln)",
    icon: "📈"
  },
  causeEffect: {
    name: "Orsak-verkan (Ishikawa)",
    description: "Fiskbensdiagram för rotorsaksanalys",
    icon: "🐟"
  },
  scatter: {
    name: "Spridningsdiagram",
    description: "Visar samband mellan två variabler",
    icon: "⚬"
  },
  controlChart: {
    name: "Styrdiagram",
    description: "Övervakar processvariation över tid",
    icon: "📉"
  },
  stratification: {
    name: "Stratifiering",
    description: "Grupperar data för djupare analys",
    icon: "📑"
  }
};

export interface QCToolProps {
  state: ToolsState;
  setState: Dispatch<SetStateAction<ToolsState>>;
  markToolComplete: (toolKey: string) => void;
}
