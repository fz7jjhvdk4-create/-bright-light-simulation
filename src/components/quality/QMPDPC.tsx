"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, Trash2 } from "lucide-react";
import { QMToolProps } from "./qm-types";

export function QMPDPC({ state, setState, markToolComplete }: QMToolProps) {
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
}
