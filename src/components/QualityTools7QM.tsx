"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, ChevronDown, ChevronUp, CheckCircle, Plus, Trash2 } from "lucide-react";

interface QualityTools7QMProps {
  groupCode: string;
}

interface AffinityData {
  title: string;
  groups: {
    name: string;
    items: string[];
  }[];
}

interface RelationsData {
  title: string;
  items: string[];
  relations: { from: number; to: number }[];
}

interface TreeData {
  title: string;
  goal: string;
  branches: {
    name: string;
    subBranches: string[];
  }[];
}

interface MatrixData {
  title: string;
  rowLabels: string[];
  colLabels: string[];
  values: string[][];
}

interface ArrowData {
  title: string;
  activities: {
    name: string;
    duration: number;
    dependencies: number[];
  }[];
}

interface PDPCData {
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

interface PrioritizationData {
  title: string;
  criteria: string[];
  options: string[];
  scores: number[][];
}

interface ToolsState {
  affinity: AffinityData;
  relations: RelationsData;
  tree: TreeData;
  matrix: MatrixData;
  arrow: ArrowData;
  pdpc: PDPCData;
  prioritization: PrioritizationData;
  completedTools: string[];
}

const defaultState: ToolsState = {
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

const toolDescriptions = {
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

export function QualityTools7QM({ groupCode }: QualityTools7QMProps) {
  const [state, setState] = useState<ToolsState>(defaultState);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [relFrom, setRelFrom] = useState<number | "">("");
  const [relTo, setRelTo] = useState<number | "">("");

  useEffect(() => {
    const savedData = localStorage.getItem(`7qm-${groupCode}`);
    if (savedData) {
      setState(JSON.parse(savedData));
    }
  }, [groupCode]);

  const handleSave = () => {
    localStorage.setItem(`7qm-${groupCode}`, JSON.stringify(state));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const markToolComplete = (toolKey: string) => {
    if (!state.completedTools.includes(toolKey)) {
      setState(prev => ({
        ...prev,
        completedTools: [...prev.completedTools, toolKey]
      }));
    }
  };

  const completedCount = state.completedTools.length;
  const requiredCount = 2;

  // Affinity Diagram
  const renderAffinity = () => {
    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.affinity.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            affinity: { ...prev.affinity, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <p className="text-sm text-gray-600">
          Gruppera relaterade idéer och observationer för att hitta mönster.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.affinity.groups.map((group, groupIdx) => (
            <div key={groupIdx} className="border rounded-lg p-3 bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={group.name}
                  onChange={(e) => {
                    const newGroups = [...state.affinity.groups];
                    newGroups[groupIdx].name = e.target.value;
                    setState(prev => ({
                      ...prev,
                      affinity: { ...prev.affinity, groups: newGroups }
                    }));
                  }}
                  className="flex-1 font-medium bg-transparent border-b border-yellow-300 focus:border-yellow-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    const newGroups = state.affinity.groups.filter((_, i) => i !== groupIdx);
                    setState(prev => ({
                      ...prev,
                      affinity: { ...prev.affinity, groups: newGroups }
                    }));
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {group.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center gap-1 bg-white rounded p-1">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newGroups = [...state.affinity.groups];
                        newGroups[groupIdx].items[itemIdx] = e.target.value;
                        setState(prev => ({
                          ...prev,
                          affinity: { ...prev.affinity, groups: newGroups }
                        }));
                      }}
                      className="flex-1 text-sm px-2 py-1 focus:outline-none"
                      placeholder="Idé/observation..."
                    />
                    <button
                      onClick={() => {
                        const newGroups = [...state.affinity.groups];
                        newGroups[groupIdx].items = newGroups[groupIdx].items.filter((_, i) => i !== itemIdx);
                        setState(prev => ({
                          ...prev,
                          affinity: { ...prev.affinity, groups: newGroups }
                        }));
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newGroups = [...state.affinity.groups];
                    newGroups[groupIdx].items.push("");
                    setState(prev => ({
                      ...prev,
                      affinity: { ...prev.affinity, groups: newGroups }
                    }));
                  }}
                  className="text-xs text-yellow-700 hover:text-yellow-800 w-full text-left py-1"
                >
                  + Lägg till idé
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              setState(prev => ({
                ...prev,
                affinity: {
                  ...prev.affinity,
                  groups: [...prev.affinity.groups, { name: `Grupp ${prev.affinity.groups.length + 1}`, items: [] }]
                }
              }));
            }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center text-gray-500 hover:border-yellow-400 hover:text-yellow-600 transition-colors"
          >
            <Plus className="w-5 h-5 mr-1" />
            Ny grupp
          </button>
        </div>

        <Button size="sm" onClick={() => markToolComplete("affinity")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
  };

  // Tree Diagram
  const renderTree = () => {
    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.tree.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            tree: { ...prev.tree, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <div>
          <label className="block text-sm text-gray-600 mb-1">Övergripande mål</label>
          <input
            type="text"
            value={state.tree.goal}
            onChange={(e) => setState(prev => ({
              ...prev,
              tree: { ...prev.tree, goal: e.target.value }
            }))}
            placeholder="Vad vill ni uppnå?"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {state.tree.goal && (
          <div className="p-4 bg-gray-50 rounded-lg overflow-x-auto">
            {/* Root node */}
            <div className="flex flex-col items-center">
              <div className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium text-center shadow">
                {state.tree.goal}
              </div>
              {state.tree.branches.length > 0 && (
                <div className="w-0.5 h-6 bg-yellow-400" />
              )}
            </div>

            {/* Branches */}
            {state.tree.branches.length > 0 && (
              <div className="relative">
                {/* Horizontal connector line between branches */}
                {state.tree.branches.length > 1 && (
                  <div className="absolute top-0 h-0.5 bg-yellow-300" style={{
                    left: `${100 / (state.tree.branches.length * 2)}%`,
                    right: `${100 / (state.tree.branches.length * 2)}%`
                  }} />
                )}

                <div className="flex justify-center gap-6">
                  {state.tree.branches.map((branch, branchIdx) => (
                    <div key={branchIdx} className="flex flex-col items-center flex-1" style={{ minWidth: '180px', maxWidth: '280px' }}>
                      {/* Vertical connector from horizontal line to branch */}
                      <div className="w-0.5 h-4 bg-yellow-300" />

                      {/* Branch node */}
                      <div className="w-full border-2 border-yellow-400 rounded-lg p-2 bg-white shadow-sm">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={branch.name}
                            onChange={(e) => {
                              const newBranches = [...state.tree.branches];
                              newBranches[branchIdx].name = e.target.value;
                              setState(prev => ({
                                ...prev,
                                tree: { ...prev.tree, branches: newBranches }
                              }));
                            }}
                            placeholder="Delmål/strategi"
                            className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 font-medium"
                          />
                          <button
                            onClick={() => {
                              const newBranches = state.tree.branches.filter((_, i) => i !== branchIdx);
                              setState(prev => ({
                                ...prev,
                                tree: { ...prev.tree, branches: newBranches }
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 flex-shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Sub-branches */}
                      {branch.subBranches.length > 0 && (
                        <div className="w-0.5 h-3 bg-gray-300" />
                      )}
                      <div className="w-full space-y-1">
                        {branch.subBranches.map((sub, subIdx) => (
                          <div key={subIdx} className="flex items-center gap-1 w-full">
                            <div className="w-4 h-0.5 bg-gray-300 flex-shrink-0" />
                            <div className="flex-1 flex items-center gap-1 border rounded px-2 py-1 bg-white text-sm">
                              <input
                                type="text"
                                value={sub}
                                onChange={(e) => {
                                  const newBranches = [...state.tree.branches];
                                  newBranches[branchIdx].subBranches[subIdx] = e.target.value;
                                  setState(prev => ({
                                    ...prev,
                                    tree: { ...prev.tree, branches: newBranches }
                                  }));
                                }}
                                placeholder="Åtgärd"
                                className="flex-1 focus:outline-none text-sm"
                              />
                              <button
                                onClick={() => {
                                  const newBranches = [...state.tree.branches];
                                  newBranches[branchIdx].subBranches = newBranches[branchIdx].subBranches.filter((_, i) => i !== subIdx);
                                  setState(prev => ({
                                    ...prev,
                                    tree: { ...prev.tree, branches: newBranches }
                                  }));
                                }}
                                className="text-gray-400 hover:text-red-500 flex-shrink-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          const newBranches = [...state.tree.branches];
                          newBranches[branchIdx].subBranches.push("");
                          setState(prev => ({
                            ...prev,
                            tree: { ...prev.tree, branches: newBranches }
                          }));
                        }}
                        className="text-xs text-gray-500 hover:text-yellow-600 mt-1"
                      >
                        + Lägg till åtgärd
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setState(prev => ({
                    ...prev,
                    tree: {
                      ...prev.tree,
                      branches: [...prev.tree.branches, { name: "", subBranches: [] }]
                    }
                  }));
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Lägg till delmål
              </Button>
            </div>
          </div>
        )}

        <Button size="sm" onClick={() => markToolComplete("tree")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
  };

  // Matrix Diagram
  const renderMatrix = () => {
    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.matrix.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            matrix: { ...prev.matrix, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <p className="text-sm text-gray-600">
          Använd symboler för att visa styrkan i samband: ◎ (stark), ○ (medel), △ (svag), tom (inget).
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-50"></th>
                {state.matrix.colLabels.map((col, colIdx) => (
                  <th key={colIdx} className="border p-2 bg-gray-50 min-w-[100px]">
                    <input
                      type="text"
                      value={col}
                      onChange={(e) => {
                        const newCols = [...state.matrix.colLabels];
                        newCols[colIdx] = e.target.value;
                        setState(prev => ({
                          ...prev,
                          matrix: { ...prev.matrix, colLabels: newCols }
                        }));
                      }}
                      className="w-full text-center bg-transparent focus:outline-none"
                    />
                  </th>
                ))}
                <th className="border p-2 bg-gray-50 w-10">
                  <button
                    onClick={() => {
                      const newCols = [...state.matrix.colLabels, `Alt ${state.matrix.colLabels.length + 1}`];
                      const newValues = state.matrix.values.map(row => [...row, ""]);
                      setState(prev => ({
                        ...prev,
                        matrix: { ...prev.matrix, colLabels: newCols, values: newValues }
                      }));
                    }}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {state.matrix.rowLabels.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="border p-2 font-medium bg-gray-50">
                    <input
                      type="text"
                      value={row}
                      onChange={(e) => {
                        const newRows = [...state.matrix.rowLabels];
                        newRows[rowIdx] = e.target.value;
                        setState(prev => ({
                          ...prev,
                          matrix: { ...prev.matrix, rowLabels: newRows }
                        }));
                      }}
                      className="w-full bg-transparent focus:outline-none"
                    />
                  </td>
                  {state.matrix.values[rowIdx]?.map((val, colIdx) => (
                    <td key={colIdx} className="border p-2 text-center">
                      <select
                        value={val}
                        onChange={(e) => {
                          const newValues = [...state.matrix.values];
                          newValues[rowIdx][colIdx] = e.target.value;
                          setState(prev => ({
                            ...prev,
                            matrix: { ...prev.matrix, values: newValues }
                          }));
                        }}
                        className="text-center focus:outline-none bg-transparent text-xl"
                      >
                        <option value="">-</option>
                        <option value="◎">◎</option>
                        <option value="○">○</option>
                        <option value="△">△</option>
                      </select>
                    </td>
                  ))}
                  <td className="border p-2">
                    <button
                      onClick={() => {
                        const newRows = state.matrix.rowLabels.filter((_, i) => i !== rowIdx);
                        const newValues = state.matrix.values.filter((_, i) => i !== rowIdx);
                        setState(prev => ({
                          ...prev,
                          matrix: { ...prev.matrix, rowLabels: newRows, values: newValues }
                        }));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="border p-2" colSpan={state.matrix.colLabels.length + 2}>
                  <button
                    onClick={() => {
                      const newRows = [...state.matrix.rowLabels, `Faktor ${state.matrix.rowLabels.length + 1}`];
                      const newValues = [...state.matrix.values, Array(state.matrix.colLabels.length).fill("")];
                      setState(prev => ({
                        ...prev,
                        matrix: { ...prev.matrix, rowLabels: newRows, values: newValues }
                      }));
                    }}
                    className="text-yellow-600 hover:text-yellow-700 text-sm"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Lägg till rad
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Button size="sm" onClick={() => markToolComplete("matrix")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
  };

  // PDPC (Process Decision Program Chart)
  const renderPDPC = () => {
    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.pdpc.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            pdpc: { ...prev.pdpc, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <div>
          <label className="block text-sm text-gray-600 mb-1">Mål/syfte</label>
          <input
            type="text"
            value={state.pdpc.goal}
            onChange={(e) => setState(prev => ({
              ...prev,
              pdpc: { ...prev.pdpc, goal: e.target.value }
            }))}
            placeholder="Vad ska uppnås?"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div className="space-y-4">
          {state.pdpc.steps.map((step, stepIdx) => (
            <div key={stepIdx} className="border rounded-lg p-4 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-yellow-500 text-white px-2 py-1 rounded text-sm font-medium">
                  Steg {stepIdx + 1}
                </span>
                <input
                  type="text"
                  value={step.name}
                  onChange={(e) => {
                    const newSteps = [...state.pdpc.steps];
                    newSteps[stepIdx].name = e.target.value;
                    setState(prev => ({
                      ...prev,
                      pdpc: { ...prev.pdpc, steps: newSteps }
                    }));
                  }}
                  placeholder="Aktivitet/steg"
                  className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
                <button
                  onClick={() => {
                    const newSteps = state.pdpc.steps.filter((_, i) => i !== stepIdx);
                    setState(prev => ({
                      ...prev,
                      pdpc: { ...prev.pdpc, steps: newSteps }
                    }));
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="ml-4 space-y-2">
                <div className="text-xs text-gray-500 font-medium">Möjliga problem och motåtgärder:</div>
                {step.problems.map((prob, probIdx) => (
                  <div key={probIdx} className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded">
                    <div>
                      <label className="text-xs text-red-600">Problem:</label>
                      <input
                        type="text"
                        value={prob.problem}
                        onChange={(e) => {
                          const newSteps = [...state.pdpc.steps];
                          newSteps[stepIdx].problems[probIdx].problem = e.target.value;
                          setState(prev => ({
                            ...prev,
                            pdpc: { ...prev.pdpc, steps: newSteps }
                          }));
                        }}
                        placeholder="Vad kan gå fel?"
                        className="w-full text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-green-600">Motåtgärd:</label>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={prob.countermeasure}
                          onChange={(e) => {
                            const newSteps = [...state.pdpc.steps];
                            newSteps[stepIdx].problems[probIdx].countermeasure = e.target.value;
                            setState(prev => ({
                              ...prev,
                              pdpc: { ...prev.pdpc, steps: newSteps }
                            }));
                          }}
                          placeholder="Hur hanteras det?"
                          className="flex-1 text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        />
                        <button
                          onClick={() => {
                            const newSteps = [...state.pdpc.steps];
                            newSteps[stepIdx].problems = newSteps[stepIdx].problems.filter((_, i) => i !== probIdx);
                            setState(prev => ({
                              ...prev,
                              pdpc: { ...prev.pdpc, steps: newSteps }
                            }));
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newSteps = [...state.pdpc.steps];
                    newSteps[stepIdx].problems.push({ problem: "", countermeasure: "" });
                    setState(prev => ({
                      ...prev,
                      pdpc: { ...prev.pdpc, steps: newSteps }
                    }));
                  }}
                  className="text-xs text-yellow-600 hover:text-yellow-700"
                >
                  + Lägg till problem/motåtgärd
                </button>
              </div>
            </div>
          ))}

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setState(prev => ({
                ...prev,
                pdpc: {
                  ...prev.pdpc,
                  steps: [...prev.pdpc.steps, { name: "", problems: [] }]
                }
              }));
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till steg
          </Button>
        </div>

        <Button size="sm" onClick={() => markToolComplete("pdpc")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
  };

  // Prioritization Matrix
  const renderPrioritization = () => {
    const calculateScore = (optionIdx: number): number => {
      if (!state.prioritization.scores[optionIdx]) return 0;
      return state.prioritization.scores[optionIdx].reduce((sum, score) => sum + (score || 0), 0);
    };

    const sortedOptions = state.prioritization.options
      .map((opt, idx) => ({ name: opt, score: calculateScore(idx), idx }))
      .sort((a, b) => b.score - a.score);

    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.prioritization.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            prioritization: { ...prev.prioritization, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Kriterier (kommaseparerade)</label>
            <input
              type="text"
              value={state.prioritization.criteria.join(", ")}
              onChange={(e) => {
                const criteria = e.target.value.split(",").map(c => c.trim()).filter(c => c);
                const newScores = state.prioritization.scores.map(row => {
                  const newRow = [...row];
                  while (newRow.length < criteria.length) newRow.push(0);
                  return newRow.slice(0, criteria.length);
                });
                setState(prev => ({
                  ...prev,
                  prioritization: { ...prev.prioritization, criteria, scores: newScores }
                }));
              }}
              placeholder="Effekt, Kostnad, Tid..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <p className="font-medium text-gray-600">Poängskala (0-10):</p>
              <p><span className="font-medium">Effekt:</span> 10 = stor positiv effekt på kvalitet, 1 = liten effekt</p>
              <p><span className="font-medium">Kostnad:</span> 10 = låg kostnad (billig), 1 = hög kostnad (dyr)</p>
              <p><span className="font-medium">Tid:</span> 10 = snabb att genomföra, 1 = lång tid</p>
              <p className="text-gray-400 italic">Högre poäng = bättre. Anpassa kriterierna efter ert projekt.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Alternativ</label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setState(prev => ({
                  ...prev,
                  prioritization: {
                    ...prev.prioritization,
                    options: [...prev.prioritization.options, `Alternativ ${prev.prioritization.options.length + 1}`],
                    scores: [...prev.prioritization.scores, Array(prev.prioritization.criteria.length).fill(0)]
                  }
                }));
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Lägg till alternativ
            </Button>
          </div>
        </div>

        {state.prioritization.options.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-50">Alternativ</th>
                  {state.prioritization.criteria.map((crit, idx) => {
                    const explanations: Record<string, string> = {
                      "Effekt": "10 = stor positiv effekt, 1 = liten effekt",
                      "Kostnad": "10 = låg kostnad (billig), 1 = hög kostnad (dyr)",
                      "Tid": "10 = snabb att genomföra, 1 = lång tid"
                    };
                    return (
                      <th key={idx} className="border p-2 bg-gray-50 min-w-[80px] cursor-help" title={explanations[crit] || `Poäng 0-10 för ${crit}`}>
                        {crit}
                        {explanations[crit] && <span className="text-gray-400 ml-1">ⓘ</span>}
                      </th>
                    );
                  })}
                  <th className="border p-2 bg-yellow-50 font-bold">Summa</th>
                  <th className="border p-2 bg-gray-50 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {state.prioritization.options.map((opt, optIdx) => (
                  <tr key={optIdx}>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...state.prioritization.options];
                          newOptions[optIdx] = e.target.value;
                          setState(prev => ({
                            ...prev,
                            prioritization: { ...prev.prioritization, options: newOptions }
                          }));
                        }}
                        className="w-full focus:outline-none"
                      />
                    </td>
                    {state.prioritization.criteria.map((_, critIdx) => (
                      <td key={critIdx} className="border p-2">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={state.prioritization.scores[optIdx]?.[critIdx] || 0}
                          onChange={(e) => {
                            const newScores = [...state.prioritization.scores];
                            if (!newScores[optIdx]) newScores[optIdx] = [];
                            newScores[optIdx][critIdx] = parseInt(e.target.value) || 0;
                            setState(prev => ({
                              ...prev,
                              prioritization: { ...prev.prioritization, scores: newScores }
                            }));
                          }}
                          className="w-full text-center focus:outline-none focus:ring-1 focus:ring-yellow-500 rounded"
                        />
                      </td>
                    ))}
                    <td className="border p-2 text-center font-bold bg-yellow-50">
                      {calculateScore(optIdx)}
                    </td>
                    <td className="border p-2">
                      <button
                        onClick={() => {
                          const newOptions = state.prioritization.options.filter((_, i) => i !== optIdx);
                          const newScores = state.prioritization.scores.filter((_, i) => i !== optIdx);
                          setState(prev => ({
                            ...prev,
                            prioritization: { ...prev.prioritization, options: newOptions, scores: newScores }
                          }));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {sortedOptions.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h5 className="font-medium text-green-800 mb-2">Prioritering:</h5>
            <ol className="list-decimal list-inside space-y-1">
              {sortedOptions.map((opt, idx) => (
                <li key={opt.idx} className={`text-sm ${idx === 0 ? 'font-bold text-green-700' : 'text-gray-600'}`}>
                  {opt.name} ({opt.score} poäng)
                </li>
              ))}
            </ol>
          </div>
        )}

        <Button size="sm" onClick={() => markToolComplete("prioritization")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
  };

  // Relations Diagram (simplified)
  const renderRelations = () => {
    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.relations.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            relations: { ...prev.relations, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <p className="text-sm text-gray-600">
          Lista faktorer och definiera orsak-verkan-relationer mellan dem.
        </p>

        <div className="space-y-2">
          <label className="block text-sm text-gray-600">Faktorer:</label>
          {state.relations.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newItems = [...state.relations.items];
                  newItems[idx] = e.target.value;
                  setState(prev => ({
                    ...prev,
                    relations: { ...prev.relations, items: newItems }
                  }));
                }}
                className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                placeholder="Faktor..."
              />
              <button
                onClick={() => {
                  const newItems = state.relations.items.filter((_, i) => i !== idx);
                  const newRelations = state.relations.relations.filter(r => r.from !== idx && r.to !== idx);
                  setState(prev => ({
                    ...prev,
                    relations: { ...prev.relations, items: newItems, relations: newRelations }
                  }));
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setState(prev => ({
                ...prev,
                relations: {
                  ...prev.relations,
                  items: [...prev.relations.items, ""]
                }
              }));
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till faktor
          </Button>
        </div>

        {state.relations.items.length > 1 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm text-gray-600 mb-2">Relationer (orsak → verkan):</label>
            <div className="space-y-2">
              {state.relations.relations.map((rel, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="bg-yellow-100 px-2 py-1 rounded">
                    {state.relations.items[rel.from] || `#${rel.from + 1}`}
                  </span>
                  <span>→</span>
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    {state.relations.items[rel.to] || `#${rel.to + 1}`}
                  </span>
                  <button
                    onClick={() => {
                      const newRelations = state.relations.relations.filter((_, i) => i !== idx);
                      setState(prev => ({
                        ...prev,
                        relations: { ...prev.relations, relations: newRelations }
                      }));
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <div className="space-y-2">
                <p className="text-xs text-gray-500">
                  Välj en orsak (Från) och en verkan (Till), klicka sedan på &quot;Lägg till&quot;.
                </p>
                <div className="flex items-center gap-2">
                  <select
                    value={relFrom}
                    onChange={(e) => setRelFrom(e.target.value === "" ? "" : parseInt(e.target.value))}
                    className="px-2 py-1 border rounded text-sm flex-1"
                  >
                    <option value="">Från (orsak)...</option>
                    {state.relations.items.map((item, idx) => (
                      <option key={idx} value={idx}>{item || `#${idx + 1}`}</option>
                    ))}
                  </select>
                  <span className="text-lg">→</span>
                  <select
                    value={relTo}
                    onChange={(e) => setRelTo(e.target.value === "" ? "" : parseInt(e.target.value))}
                    className="px-2 py-1 border rounded text-sm flex-1"
                  >
                    <option value="">Till (verkan)...</option>
                    {state.relations.items.map((item, idx) => (
                      <option key={idx} value={idx}>{item || `#${idx + 1}`}</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={relFrom === "" || relTo === "" || relFrom === relTo}
                    onClick={() => {
                      if (relFrom !== "" && relTo !== "" && relFrom !== relTo &&
                          !state.relations.relations.some(r => r.from === relFrom && r.to === relTo)) {
                        setState(prev => ({
                          ...prev,
                          relations: {
                            ...prev.relations,
                            relations: [...prev.relations.relations, { from: relFrom as number, to: relTo as number }]
                          }
                        }));
                        setRelFrom("");
                        setRelTo("");
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Lägg till
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button size="sm" onClick={() => markToolComplete("relations")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
  };

  // Arrow Diagram (simplified)
  const renderArrow = () => {
    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.arrow.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            arrow: { ...prev.arrow, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <p className="text-sm text-gray-600">
          Definiera aktiviteter, deras varaktighet och beroenden. Använd Gantt-schemat för visuell planering.
        </p>

        <div className="space-y-3">
          {state.arrow.activities.map((act, idx) => (
            <div key={idx} className="p-3 border rounded-lg bg-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={act.name}
                  onChange={(e) => {
                    const newActivities = [...state.arrow.activities];
                    newActivities[idx].name = e.target.value;
                    setState(prev => ({
                      ...prev,
                      arrow: { ...prev.arrow, activities: newActivities }
                    }));
                  }}
                  placeholder="Aktivitetsnamn"
                  className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
                <button
                  onClick={() => {
                    const newActivities = state.arrow.activities.filter((_, i) => i !== idx);
                    setState(prev => ({
                      ...prev,
                      arrow: { ...prev.arrow, activities: newActivities }
                    }));
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Varaktighet (veckor)</label>
                  <input
                    type="number"
                    min="1"
                    value={act.duration}
                    onChange={(e) => {
                      const newActivities = [...state.arrow.activities];
                      newActivities[idx].duration = parseInt(e.target.value) || 1;
                      setState(prev => ({
                        ...prev,
                        arrow: { ...prev.arrow, activities: newActivities }
                      }));
                    }}
                    className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Beroende av (nummer)</label>
                  <input
                    type="text"
                    value={act.dependencies.join(", ")}
                    onChange={(e) => {
                      const deps = e.target.value.split(",").map(d => parseInt(d.trim()) - 1).filter(d => !isNaN(d) && d >= 0 && d < idx);
                      const newActivities = [...state.arrow.activities];
                      newActivities[idx].dependencies = deps;
                      setState(prev => ({
                        ...prev,
                        arrow: { ...prev.arrow, activities: newActivities }
                      }));
                    }}
                    placeholder="t.ex. 1, 2"
                    className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setState(prev => ({
                ...prev,
                arrow: {
                  ...prev.arrow,
                  activities: [...prev.arrow.activities, { name: "", duration: 1, dependencies: [] }]
                }
              }));
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till aktivitet
          </Button>
        </div>

        <Button size="sm" onClick={() => markToolComplete("arrow")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
  };

  const renderToolContent = (toolKey: string) => {
    switch (toolKey) {
      case "affinity": return renderAffinity();
      case "relations": return renderRelations();
      case "tree": return renderTree();
      case "matrix": return renderMatrix();
      case "arrow": return renderArrow();
      case "pdpc": return renderPDPC();
      case "prioritization": return renderPrioritization();
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">7 Ledningsverktyg (7QM)</h3>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            {saved ? "Sparat!" : "Spara"}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Använd minst {requiredCount} av de 7 ledningsverktygen för planering och beslutsfattande.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${completedCount >= requiredCount ? 'bg-green-500' : 'bg-yellow-500'}`}
              style={{ width: `${(completedCount / 7) * 100}%` }}
            />
          </div>
          <span className={`text-sm font-medium ${completedCount >= requiredCount ? 'text-green-600' : 'text-gray-600'}`}>
            {completedCount}/{requiredCount} klara
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {Object.entries(toolDescriptions).map(([key, tool]) => {
            const isCompleted = state.completedTools.includes(key);
            const isActive = activeTool === key;

            return (
              <div key={key} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveTool(isActive ? null : key)}
                  className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
                    isCompleted ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tool.icon}</span>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {tool.name}
                        {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="text-sm text-gray-500">{tool.description}</div>
                    </div>
                  </div>
                  {isActive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {isActive && (
                  <div className="p-4 border-t bg-gray-50">
                    {renderToolContent(key)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
