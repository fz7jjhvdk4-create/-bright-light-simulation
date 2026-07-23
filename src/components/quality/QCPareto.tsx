"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, Trash2 } from "lucide-react";
import { QCToolProps } from "./qc-types";

export function QCPareto({ state, setState, markToolComplete }: QCToolProps) {
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
}
