"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, Trash2 } from "lucide-react";
import { QCToolProps } from "./qc-types";

export function QCHistogram({ state, setState, markToolComplete }: QCToolProps) {
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
}
