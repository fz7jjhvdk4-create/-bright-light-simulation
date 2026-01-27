"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, ChevronDown, ChevronUp, CheckCircle, Plus, Trash2 } from "lucide-react";

interface QualityTools7QCProps {
  groupCode: string;
}

interface ChecksheetData {
  title: string;
  categories: string[];
  data: number[][];
}

interface HistogramData {
  title: string;
  bins: { label: string; count: number }[];
}

interface ParetoData {
  title: string;
  items: { name: string; count: number }[];
}

interface CauseEffectDiagram {
  id: string;
  problem: string;
  categories: {
    name: string;
    causes: string[];
  }[];
}

interface CauseEffectData {
  problem: string;
  categories: {
    name: string;
    causes: string[];
  }[];
}

interface ScatterData {
  title: string;
  xLabel: string;
  yLabel: string;
  points: { x: number; y: number }[];
}

interface ControlChartData {
  title: string;
  measurements: number[];
  ucl: number;
  lcl: number;
  cl: number;
}

interface StratificationData {
  title: string;
  groups: {
    name: string;
    values: number[];
  }[];
}

interface ToolsState {
  checksheet: ChecksheetData;
  histogram: HistogramData;
  pareto: ParetoData;
  causeEffect: CauseEffectData | CauseEffectDiagram[];
  scatter: ScatterData;
  controlChart: ControlChartData;
  stratification: StratificationData;
  completedTools: string[];
}

const defaultState: ToolsState = {
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

const toolDescriptions = {
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

export function QualityTools7QC({ groupCode }: QualityTools7QCProps) {
  const [state, setState] = useState<ToolsState>(defaultState);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [rawStratValues, setRawStratValues] = useState<Record<number, string>>({});
  const [activeCEDiagram, setActiveCEDiagram] = useState(0);

  useEffect(() => {
    const savedData = localStorage.getItem(`7qc-${groupCode}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Migrate old causeEffect format (single object) to new format (array)
      if (parsed.causeEffect && !Array.isArray(parsed.causeEffect)) {
        parsed.causeEffect = [{
          id: "ce-1",
          problem: parsed.causeEffect.problem,
          categories: parsed.causeEffect.categories
        }];
      }
      setState(parsed);
    }
  }, [groupCode]);

  const handleSave = () => {
    localStorage.setItem(`7qc-${groupCode}`, JSON.stringify(state));
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
  const requiredCount = 4;

  // Checksheet component
  const renderChecksheet = () => {
    const rowLabels = ["Typ A", "Typ B", "Typ C"];

    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.checksheet.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            checksheet: { ...prev.checksheet, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-50">Feltyp</th>
                {state.checksheet.categories.map((cat, i) => (
                  <th key={i} className="border p-2 bg-gray-50 min-w-[80px]">
                    <input
                      type="text"
                      value={cat}
                      onChange={(e) => {
                        const newCats = [...state.checksheet.categories];
                        newCats[i] = e.target.value;
                        setState(prev => ({
                          ...prev,
                          checksheet: { ...prev.checksheet, categories: newCats }
                        }));
                      }}
                      className="w-full text-center bg-transparent focus:outline-none"
                    />
                  </th>
                ))}
                <th className="border p-2 bg-gray-50">Summa</th>
              </tr>
            </thead>
            <tbody>
              {state.checksheet.data.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="border p-2 font-medium">{rowLabels[rowIdx]}</td>
                  {row.map((val, colIdx) => (
                    <td key={colIdx} className="border p-2">
                      <input
                        type="number"
                        min="0"
                        value={val}
                        onChange={(e) => {
                          const newData = [...state.checksheet.data];
                          newData[rowIdx][colIdx] = parseInt(e.target.value) || 0;
                          setState(prev => ({
                            ...prev,
                            checksheet: { ...prev.checksheet, data: newData }
                          }));
                        }}
                        className="w-full text-center focus:outline-none focus:ring-1 focus:ring-yellow-500 rounded"
                      />
                    </td>
                  ))}
                  <td className="border p-2 text-center font-medium bg-gray-50">
                    {row.reduce((a, b) => a + b, 0)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td className="border p-2 font-medium">Totalt</td>
                {state.checksheet.categories.map((_, colIdx) => (
                  <td key={colIdx} className="border p-2 text-center font-medium">
                    {state.checksheet.data.reduce((sum, row) => sum + row[colIdx], 0)}
                  </td>
                ))}
                <td className="border p-2 text-center font-bold">
                  {state.checksheet.data.flat().reduce((a, b) => a + b, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Button size="sm" onClick={() => markToolComplete("checksheet")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
  };

  // Pareto component
  const renderPareto = () => {
    const sortedItems = [...state.pareto.items].sort((a, b) => b.count - a.count);
    const total = sortedItems.reduce((sum, item) => sum + item.count, 0);
    let cumulative = 0;
    const maxCount = Math.max(...sortedItems.map(i => i.count), 1);

    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.pareto.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            pareto: { ...prev.pareto, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <div className="space-y-2">
          {state.pareto.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => {
                  const newItems = [...state.pareto.items];
                  newItems[idx].name = e.target.value;
                  setState(prev => ({
                    ...prev,
                    pareto: { ...prev.pareto, items: newItems }
                  }));
                }}
                className="w-32 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <input
                type="number"
                min="0"
                value={item.count}
                onChange={(e) => {
                  const newItems = [...state.pareto.items];
                  newItems[idx].count = parseInt(e.target.value) || 0;
                  setState(prev => ({
                    ...prev,
                    pareto: { ...prev.pareto, items: newItems }
                  }));
                }}
                className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <button
                onClick={() => {
                  const newItems = state.pareto.items.filter((_, i) => i !== idx);
                  setState(prev => ({
                    ...prev,
                    pareto: { ...prev.pareto, items: newItems }
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
                pareto: {
                  ...prev.pareto,
                  items: [...prev.pareto.items, { name: "Ny orsak", count: 0 }]
                }
              }));
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till
          </Button>
        </div>

        {/* Visual Pareto chart */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-end gap-1 h-40">
            {sortedItems.map((item, idx) => {
              cumulative += item.count;
              const barHeight = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              const cumulativePercent = total > 0 ? (cumulative / total) * 100 : 0;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">{cumulativePercent.toFixed(0)}%</div>
                  <div
                    className="w-full bg-yellow-500 rounded-t"
                    style={{ height: `${barHeight}%`, minHeight: item.count > 0 ? '4px' : '0' }}
                  />
                  <div className="text-xs mt-1 text-center truncate w-full" title={item.name}>
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500">{item.count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <Button size="sm" onClick={() => markToolComplete("pareto")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
  };

  // Cause-Effect (Ishikawa) component
  const renderCauseEffect = () => {
    const diagrams = Array.isArray(state.causeEffect) ? state.causeEffect : [{
      id: "ce-1",
      problem: (state.causeEffect as CauseEffectData).problem,
      categories: (state.causeEffect as CauseEffectData).categories
    }];
    const currentIdx = Math.min(activeCEDiagram, diagrams.length - 1);
    const current = diagrams[currentIdx];

    const updateCurrentDiagram = (updater: (d: CauseEffectDiagram) => CauseEffectDiagram) => {
      setState(prev => {
        const arr = Array.isArray(prev.causeEffect) ? [...prev.causeEffect] : [{
          id: "ce-1",
          problem: (prev.causeEffect as CauseEffectData).problem,
          categories: (prev.causeEffect as CauseEffectData).categories
        }];
        arr[currentIdx] = updater(arr[currentIdx]);
        return { ...prev, causeEffect: arr };
      });
    };

    const addNewDiagram = () => {
      setState(prev => {
        const arr = Array.isArray(prev.causeEffect) ? [...prev.causeEffect] : [{
          id: "ce-1",
          problem: (prev.causeEffect as CauseEffectData).problem,
          categories: (prev.causeEffect as CauseEffectData).categories
        }];
        const newDiagram: CauseEffectDiagram = {
          id: `ce-${Date.now()}`,
          problem: "Nytt problem",
          categories: [
            { name: "Människa", causes: [] },
            { name: "Maskin", causes: [] },
            { name: "Material", causes: [] },
            { name: "Metod", causes: [] },
            { name: "Miljö", causes: [] },
            { name: "Mätning", causes: [] }
          ]
        };
        arr.push(newDiagram);
        return { ...prev, causeEffect: arr };
      });
      setActiveCEDiagram(diagrams.length);
    };

    const deleteDiagram = (idx: number) => {
      if (diagrams.length <= 1) return;
      setState(prev => {
        const arr = Array.isArray(prev.causeEffect) ? [...prev.causeEffect] : [];
        arr.splice(idx, 1);
        return { ...prev, causeEffect: arr };
      });
      if (currentIdx >= diagrams.length - 1) {
        setActiveCEDiagram(Math.max(0, diagrams.length - 2));
      }
    };

    return (
      <div className="space-y-4">
        {/* Diagram tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {diagrams.map((d, idx) => (
            <div key={d.id} className="flex items-center">
              <button
                onClick={() => setActiveCEDiagram(idx)}
                className={`px-3 py-1.5 text-sm rounded-t-lg border border-b-0 ${
                  idx === currentIdx
                    ? "bg-white font-medium text-yellow-700 border-yellow-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200"
                }`}
              >
                {d.problem || `Diagram ${idx + 1}`}
              </button>
              {diagrams.length > 1 && (
                <button
                  onClick={() => deleteDiagram(idx)}
                  className="ml-0.5 px-1 py-1.5 text-xs text-gray-400 hover:text-red-500 border border-b-0 border-gray-200 rounded-tr-lg bg-gray-50"
                  title="Ta bort diagram"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addNewDiagram}
            className="px-3 py-1.5 text-sm text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg border border-dashed border-yellow-300"
          >
            <Plus className="w-3 h-3 inline mr-1" />
            Nytt diagram
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Problem:</span>
          <input
            type="text"
            value={current.problem}
            onChange={(e) => updateCurrentDiagram(d => ({ ...d, problem: e.target.value }))}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Fishbone diagram representation */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="flex-1 h-1 bg-gray-400"></div>
            <div className="px-4 py-2 bg-red-100 border-2 border-red-400 rounded font-medium text-center">
              {current.problem || "Problem"}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {current.categories.map((category, catIdx) => (
              <div key={catIdx} className="border rounded-lg p-3 bg-white">
                <h5 className="font-medium text-sm mb-2 text-yellow-700">{category.name}</h5>
                <div className="space-y-1">
                  {category.causes.map((cause, causeIdx) => (
                    <div key={causeIdx} className="flex items-center gap-1">
                      <span className="text-xs">→</span>
                      <input
                        type="text"
                        value={cause}
                        onChange={(e) => {
                          updateCurrentDiagram(d => {
                            const newCategories = d.categories.map((c, i) =>
                              i === catIdx ? { ...c, causes: c.causes.map((cs, j) => j === causeIdx ? e.target.value : cs) } : c
                            );
                            return { ...d, categories: newCategories };
                          });
                        }}
                        className="flex-1 text-xs px-1 py-0.5 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                      <button
                        onClick={() => {
                          updateCurrentDiagram(d => {
                            const newCategories = d.categories.map((c, i) =>
                              i === catIdx ? { ...c, causes: c.causes.filter((_, j) => j !== causeIdx) } : c
                            );
                            return { ...d, categories: newCategories };
                          });
                        }}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      updateCurrentDiagram(d => {
                        const newCategories = d.categories.map((c, i) =>
                          i === catIdx ? { ...c, causes: [...c.causes, ""] } : c
                        );
                        return { ...d, categories: newCategories };
                      });
                    }}
                    className="text-xs text-yellow-600 hover:text-yellow-700"
                  >
                    + Lägg till orsak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button size="sm" onClick={() => markToolComplete("causeEffect")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
  };

  // Histogram component
  const renderHistogram = () => {
    const maxCount = Math.max(...state.histogram.bins.map(b => b.count), 1);

    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.histogram.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            histogram: { ...prev.histogram, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <div className="space-y-2">
          {state.histogram.bins.map((bin, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={bin.label}
                onChange={(e) => {
                  const newBins = [...state.histogram.bins];
                  newBins[idx].label = e.target.value;
                  setState(prev => ({
                    ...prev,
                    histogram: { ...prev.histogram, bins: newBins }
                  }));
                }}
                className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <input
                type="number"
                min="0"
                value={bin.count}
                onChange={(e) => {
                  const newBins = [...state.histogram.bins];
                  newBins[idx].count = parseInt(e.target.value) || 0;
                  setState(prev => ({
                    ...prev,
                    histogram: { ...prev.histogram, bins: newBins }
                  }));
                }}
                className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <button
                onClick={() => {
                  const newBins = state.histogram.bins.filter((_, i) => i !== idx);
                  setState(prev => ({
                    ...prev,
                    histogram: { ...prev.histogram, bins: newBins }
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
                histogram: {
                  ...prev.histogram,
                  bins: [...prev.histogram.bins, { label: "Ny", count: 0 }]
                }
              }));
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till intervall
          </Button>
        </div>

        {/* Visual histogram */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-end gap-1" style={{ height: '160px' }}>
            {state.histogram.bins.map((bin, idx) => {
              const barHeight = maxCount > 0 ? (bin.count / maxCount) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end" style={{ height: '100%' }}>
                  <div className="text-xs text-gray-500 mb-1">{bin.count}</div>
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${barHeight}%`, minHeight: bin.count > 0 ? '4px' : '0' }}
                  />
                  <div className="text-xs mt-1 text-center flex-shrink-0">{bin.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <Button size="sm" onClick={() => markToolComplete("histogram")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
  };

  // Control Chart component
  const renderControlChart = () => {
    const measurements = state.controlChart.measurements;
    const mean = measurements.length > 0 ? measurements.reduce((a, b) => a + b, 0) / measurements.length : 0;
    const stdDev = measurements.length > 0
      ? Math.sqrt(measurements.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / measurements.length)
      : 0;

    const autoUCL = mean + 3 * stdDev;
    const autoLCL = mean - 3 * stdDev;

    const maxVal = Math.max(...measurements, state.controlChart.ucl || autoUCL, 1);
    const minVal = Math.min(...measurements, state.controlChart.lcl || autoLCL, 0);
    const range = maxVal - minVal || 1;

    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.controlChart.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            controlChart: { ...prev.controlChart, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">UCL (Övre gräns)</label>
            <input
              type="number"
              value={state.controlChart.ucl || ""}
              placeholder={autoUCL.toFixed(2)}
              onChange={(e) => setState(prev => ({
                ...prev,
                controlChart: { ...prev.controlChart, ucl: parseFloat(e.target.value) || 0 }
              }))}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">CL (Mittlinje)</label>
            <input
              type="number"
              value={state.controlChart.cl || ""}
              placeholder={mean.toFixed(2)}
              onChange={(e) => setState(prev => ({
                ...prev,
                controlChart: { ...prev.controlChart, cl: parseFloat(e.target.value) || 0 }
              }))}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">LCL (Undre gräns)</label>
            <input
              type="number"
              value={state.controlChart.lcl || ""}
              placeholder={autoLCL.toFixed(2)}
              onChange={(e) => setState(prev => ({
                ...prev,
                controlChart: { ...prev.controlChart, lcl: parseFloat(e.target.value) || 0 }
              }))}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Mätvärden (kommaseparerade)</label>
          <input
            type="text"
            value={measurements.join(", ")}
            onChange={(e) => {
              const values = e.target.value.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
              setState(prev => ({
                ...prev,
                controlChart: { ...prev.controlChart, measurements: values }
              }));
            }}
            placeholder="10, 12, 11, 13, 10, 14..."
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Visual control chart */}
        {measurements.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="relative h-40">
              {/* UCL line */}
              <div
                className="absolute w-full border-t-2 border-dashed border-red-400"
                style={{ top: `${((maxVal - (state.controlChart.ucl || autoUCL)) / range) * 100}%` }}
              >
                <span className="absolute right-0 text-xs text-red-500 -top-3">UCL</span>
              </div>
              {/* CL line */}
              <div
                className="absolute w-full border-t-2 border-green-500"
                style={{ top: `${((maxVal - (state.controlChart.cl || mean)) / range) * 100}%` }}
              >
                <span className="absolute right-0 text-xs text-green-600 -top-3">CL</span>
              </div>
              {/* LCL line */}
              <div
                className="absolute w-full border-t-2 border-dashed border-red-400"
                style={{ top: `${((maxVal - (state.controlChart.lcl || autoLCL)) / range) * 100}%` }}
              >
                <span className="absolute right-0 text-xs text-red-500 -top-3">LCL</span>
              </div>
              {/* Data points */}
              <svg className="w-full h-full">
                <polyline
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="2"
                  points={measurements.map((val, idx) =>
                    `${(idx / (measurements.length - 1 || 1)) * 100}%,${((maxVal - val) / range) * 100}%`
                  ).join(" ")}
                />
                {measurements.map((val, idx) => (
                  <circle
                    key={idx}
                    cx={`${(idx / (measurements.length - 1 || 1)) * 100}%`}
                    cy={`${((maxVal - val) / range) * 100}%`}
                    r="4"
                    fill="#eab308"
                  />
                ))}
              </svg>
            </div>
          </div>
        )}

        <Button size="sm" onClick={() => markToolComplete("controlChart")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
  };

  // Scatter diagram component
  const renderScatter = () => {
    const points = state.scatter.points;
    const maxX = Math.max(...points.map(p => p.x), 10);
    const maxY = Math.max(...points.map(p => p.y), 10);

    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.scatter.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            scatter: { ...prev.scatter, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">X-axel</label>
            <input
              type="text"
              value={state.scatter.xLabel}
              onChange={(e) => setState(prev => ({
                ...prev,
                scatter: { ...prev.scatter, xLabel: e.target.value }
              }))}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Y-axel</label>
            <input
              type="text"
              value={state.scatter.yLabel}
              onChange={(e) => setState(prev => ({
                ...prev,
                scatter: { ...prev.scatter, yLabel: e.target.value }
              }))}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-600">Datapunkter:</div>
          {points.map((point, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-gray-500">X:</span>
              <input
                type="number"
                value={point.x}
                onChange={(e) => {
                  const newPoints = [...points];
                  newPoints[idx].x = parseFloat(e.target.value) || 0;
                  setState(prev => ({
                    ...prev,
                    scatter: { ...prev.scatter, points: newPoints }
                  }));
                }}
                className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <span className="text-xs text-gray-500">Y:</span>
              <input
                type="number"
                value={point.y}
                onChange={(e) => {
                  const newPoints = [...points];
                  newPoints[idx].y = parseFloat(e.target.value) || 0;
                  setState(prev => ({
                    ...prev,
                    scatter: { ...prev.scatter, points: newPoints }
                  }));
                }}
                className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <button
                onClick={() => {
                  const newPoints = points.filter((_, i) => i !== idx);
                  setState(prev => ({
                    ...prev,
                    scatter: { ...prev.scatter, points: newPoints }
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
                scatter: {
                  ...prev.scatter,
                  points: [...prev.scatter.points, { x: 0, y: 0 }]
                }
              }));
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till punkt
          </Button>
        </div>

        {/* Visual scatter plot */}
        {points.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="relative h-48 border-l-2 border-b-2 border-gray-400 ml-8 mb-6">
              <span className="absolute -left-8 top-1/2 -rotate-90 text-xs text-gray-600">{state.scatter.yLabel}</span>
              <span className="absolute bottom-[-24px] left-1/2 text-xs text-gray-600">{state.scatter.xLabel}</span>
              {points.map((point, idx) => (
                <div
                  key={idx}
                  className="absolute w-3 h-3 bg-yellow-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${(point.x / maxX) * 100}%`,
                    bottom: `${(point.y / maxY) * 100}%`
                  }}
                  title={`(${point.x}, ${point.y})`}
                />
              ))}
            </div>
          </div>
        )}

        <Button size="sm" onClick={() => markToolComplete("scatter")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
  };

  // Stratification component
  const renderStratification = () => {
    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.stratification.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            stratification: { ...prev.stratification, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <p className="text-sm text-gray-600">
          Dela upp data i grupper för att identifiera mönster och skillnader.
        </p>

        <div className="space-y-3">
          {state.stratification.groups.map((group, idx) => (
            <div key={idx} className="p-3 border rounded-lg bg-white">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={group.name}
                  onChange={(e) => {
                    const newGroups = [...state.stratification.groups];
                    newGroups[idx].name = e.target.value;
                    setState(prev => ({
                      ...prev,
                      stratification: { ...prev.stratification, groups: newGroups }
                    }));
                  }}
                  placeholder="Gruppnamn"
                  className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 font-medium"
                />
                <button
                  onClick={() => {
                    const newGroups = state.stratification.groups.filter((_, i) => i !== idx);
                    setState(prev => ({
                      ...prev,
                      stratification: { ...prev.stratification, groups: newGroups }
                    }));
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={rawStratValues[idx] ?? group.values.join(", ")}
                onChange={(e) => {
                  setRawStratValues(prev => ({ ...prev, [idx]: e.target.value }));
                  const values = e.target.value.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
                  const newGroups = [...state.stratification.groups];
                  newGroups[idx].values = values;
                  setState(prev => ({
                    ...prev,
                    stratification: { ...prev.stratification, groups: newGroups }
                  }));
                }}
                onBlur={() => {
                  setRawStratValues(prev => ({
                    ...prev,
                    [idx]: state.stratification.groups[idx].values.join(", ")
                  }));
                }}
                placeholder="Värden (kommaseparerade, t.ex. 10, 15, 22, 18)"
                className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              {group.values.length > 0 && (
                <>
                  <div className="mt-2 text-xs text-gray-500">
                    N={group.values.length},
                    Medel={(group.values.reduce((a, b) => a + b, 0) / group.values.length).toFixed(2)},
                    Min={Math.min(...group.values).toFixed(1)},
                    Max={Math.max(...group.values).toFixed(1)}
                    {group.values.length > 1 && `, Std=${(Math.sqrt(group.values.reduce((sum, v) => sum + Math.pow(v - group.values.reduce((a, b) => a + b, 0) / group.values.length, 2), 0) / group.values.length)).toFixed(2)}`}
                  </div>
                  <div className="mt-2 flex items-end gap-0.5 bg-white rounded p-1" style={{ height: '48px' }}>
                    {group.values.map((val, vIdx) => {
                      const maxVal = Math.max(...group.values, 1);
                      const height = (val / maxVal) * 100;
                      return (
                        <div
                          key={vIdx}
                          className="flex-1 bg-blue-400 rounded-t"
                          style={{ height: `${height}%`, minHeight: '2px' }}
                          title={`${val}`}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setState(prev => ({
                ...prev,
                stratification: {
                  ...prev.stratification,
                  groups: [...prev.stratification.groups, { name: "", values: [] }]
                }
              }));
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till grupp
          </Button>
        </div>

        <Button size="sm" onClick={() => markToolComplete("stratification")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
  };

  const renderToolContent = (toolKey: string) => {
    switch (toolKey) {
      case "checksheet": return renderChecksheet();
      case "histogram": return renderHistogram();
      case "pareto": return renderPareto();
      case "causeEffect": return renderCauseEffect();
      case "scatter": return renderScatter();
      case "controlChart": return renderControlChart();
      case "stratification": return renderStratification();
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">7 Kvalitetsverktyg (7QC)</h3>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            {saved ? "Sparat!" : "Spara"}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Använd minst {requiredCount} av de 7 kvalitetsverktygen för att analysera kvalitetsdata.
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
