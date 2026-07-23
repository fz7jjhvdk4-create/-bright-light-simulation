"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, Trash2 } from "lucide-react";
import { QMToolProps } from "./qm-types";

export function QMAffinity({ state, setState, markToolComplete }: QMToolProps) {
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
}
