"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, Trash2 } from "lucide-react";
import { QMToolProps } from "./qm-types";

interface QMRelationsProps extends QMToolProps {
  relFrom: number | "";
  setRelFrom: Dispatch<SetStateAction<number | "">>;
  relTo: number | "";
  setRelTo: Dispatch<SetStateAction<number | "">>;
}

export function QMRelations({ state, setState, markToolComplete, relFrom, setRelFrom, relTo, setRelTo }: QMRelationsProps) {
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
}
