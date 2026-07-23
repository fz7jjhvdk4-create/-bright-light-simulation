"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, Trash2 } from "lucide-react";
import { QCToolProps } from "./qc-types";

export function QCScatter({ state, setState, markToolComplete }: QCToolProps) {
    const points = state.scatter.points;
    const maxX = Math.max(...points.map(p => p.x), 10);
    const maxY = Math.max(...points.map(p => p.y), 10);

    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.scatter.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            scatter: { ...prev.scatter, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">X-axel</label>
            <input
              type="text"
              value={state.scatter.xLabel}
              onChange={(e) => setState(prev => ({
                ...prev,
                scatter: { ...prev.scatter, xLabel: e.target.value }
              }))}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Y-axel</label>
            <input
              type="text"
              value={state.scatter.yLabel}
              onChange={(e) => setState(prev => ({
                ...prev,
                scatter: { ...prev.scatter, yLabel: e.target.value }
              }))}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-600">Datapunkter:</div>
          {points.map((point, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-gray-500">X:</span>
              <input
                type="number"
                value={point.x}
                onChange={(e) => {
                  const newPoints = [...points];
                  newPoints[idx].x = parseFloat(e.target.value) || 0;
                  setState(prev => ({
                    ...prev,
                    scatter: { ...prev.scatter, points: newPoints }
                  }));
                }}
                className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <span className="text-xs text-gray-500">Y:</span>
              <input
                type="number"
                value={point.y}
                onChange={(e) => {
                  const newPoints = [...points];
                  newPoints[idx].y = parseFloat(e.target.value) || 0;
                  setState(prev => ({
                    ...prev,
                    scatter: { ...prev.scatter, points: newPoints }
                  }));
                }}
                className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <button
                onClick={() => {
                  const newPoints = points.filter((_, i) => i !== idx);
                  setState(prev => ({
                    ...prev,
                    scatter: { ...prev.scatter, points: newPoints }
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
                scatter: {
                  ...prev.scatter,
                  points: [...prev.scatter.points, { x: 0, y: 0 }]
                }
              }));
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till punkt
          </Button>
        </div>

        {/* Visual scatter plot */}
        {points.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="relative h-48 border-l-2 border-b-2 border-gray-400 ml-8 mb-6">
              <span className="absolute -left-8 top-1/2 -rotate-90 text-xs text-gray-600">{state.scatter.yLabel}</span>
              <span className="absolute bottom-[-24px] left-1/2 text-xs text-gray-600">{state.scatter.xLabel}</span>
              {points.map((point, idx) => (
                <div
                  key={idx}
                  className="absolute w-3 h-3 bg-yellow-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${(point.x / maxX) * 100}%`,
                    bottom: `${(point.y / maxY) * 100}%`
                  }}
                  title={`(${point.x}, ${point.y})`}
                />
              ))}
            </div>
          </div>
        )}

        <Button size="sm" onClick={() => markToolComplete("scatter")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
}
