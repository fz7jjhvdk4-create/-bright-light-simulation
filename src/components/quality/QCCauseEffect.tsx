"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, Trash2 } from "lucide-react";
import { QCToolProps, CauseEffectData, CauseEffectDiagram } from "./qc-types";

interface QCCauseEffectProps extends QCToolProps {
  activeCEDiagram: number;
  setActiveCEDiagram: Dispatch<SetStateAction<number>>;
}

export function QCCauseEffect({ state, setState, markToolComplete, activeCEDiagram, setActiveCEDiagram }: QCCauseEffectProps) {
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
}
