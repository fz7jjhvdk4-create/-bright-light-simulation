"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { QCToolProps } from "./qc-types";

export function QCChecksheet({ state, setState, markToolComplete }: QCToolProps) {
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
}
