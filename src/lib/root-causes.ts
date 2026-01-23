// Root causes definitions from the PRD

export interface RootCause {
  id: string;
  name: string;
  impact: number;
  description: string;
}

export const rootCauses: RootCause[] = [
  {
    id: "supplier",
    name: "AsiaCore drivdon (ny leverantör 2022)",
    impact: 0.35,
    description: "Billigare leverantör med MTBF 35000h istället för spec 50000h. Står för 78% av drivdonsfel."
  },
  {
    id: "training",
    name: "Bristande utbildning på JUKI-lödstation",
    impact: 0.25,
    description: "Ny lödstation feb 2023. Endast 2 halvdagar utbildning istället för rekommenderade 5 dagar."
  },
  {
    id: "turnover",
    name: "Hög personalomsättning kvällsskift",
    impact: 0.25,
    description: "35% omsättning på kvällsskift vs 8% på dagskift. Kvällsskift står för 60% av monteringsfel."
  },
  {
    id: "handover",
    name: "Bristande överlämning mellan skift",
    impact: 0.10,
    description: "Överlappning minskad från 30 till 15 minuter. Information faller mellan stolarna."
  },
  {
    id: "testing",
    name: "Otillräcklig inkommande kontroll",
    impact: 0.05,
    description: "Endast 5% stickprov på drivdon. Bristfälliga komponenter upptäcks inte."
  }
];

export function getRootCauseById(id: string): RootCause | undefined {
  return rootCauses.find(rc => rc.id === id);
}
