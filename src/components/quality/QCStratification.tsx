"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, Trash2 } from "lucide-react";
import { QCToolProps } from "./qc-types";

interface QCStratificationProps extends QCToolProps {
  rawStratValues: Record<number, string>;
  setRawStratValues: Dispatch<SetStateAction<Record<number, string>>>;
}

export function QCStratification({ state, setState, markToolComplete, rawStratValues, setRawStratValues }: QCStratificationProps) {
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
}
