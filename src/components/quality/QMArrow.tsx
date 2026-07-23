"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, Trash2 } from "lucide-react";
import { QMToolProps } from "./qm-types";

export function QMArrow({ state, setState, markToolComplete }: QMToolProps) {
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
}
