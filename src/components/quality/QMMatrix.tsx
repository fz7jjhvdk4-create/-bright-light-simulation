"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, Trash2 } from "lucide-react";
import { QMToolProps } from "./qm-types";

export function QMMatrix({ state, setState, markToolComplete }: QMToolProps) {
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
}
