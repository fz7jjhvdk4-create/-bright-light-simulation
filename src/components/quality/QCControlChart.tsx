"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { QCToolProps } from "./qc-types";

export function QCControlChart({ state, setState, markToolComplete }: QCToolProps) {
    const measurements = state.controlChart.measurements;
    const mean = measurements.length > 0 ? measurements.reduce((a, b) => a + b, 0) / measurements.length : 0;
    const stdDev = measurements.length > 0
      ? Math.sqrt(measurements.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / measurements.length)
      : 0;

    const autoUCL = mean + 3 * stdDev;
    const autoLCL = mean - 3 * stdDev;

    const maxVal = Math.max(...measurements, state.controlChart.ucl || autoUCL, 1);
    const minVal = Math.min(...measurements, state.controlChart.lcl || autoLCL, 0);
    const range = maxVal - minVal || 1;

    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.controlChart.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            controlChart: { ...prev.controlChart, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">UCL (Övre gräns)</label>
            <input
              type="number"
              value={state.controlChart.ucl || ""}
              placeholder={autoUCL.toFixed(2)}
              onChange={(e) => setState(prev => ({
                ...prev,
                controlChart: { ...prev.controlChart, ucl: parseFloat(e.target.value) || 0 }
              }))}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">CL (Mittlinje)</label>
            <input
              type="number"
              value={state.controlChart.cl || ""}
              placeholder={mean.toFixed(2)}
              onChange={(e) => setState(prev => ({
                ...prev,
                controlChart: { ...prev.controlChart, cl: parseFloat(e.target.value) || 0 }
              }))}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">LCL (Undre gräns)</label>
            <input
              type="number"
              value={state.controlChart.lcl || ""}
              placeholder={autoLCL.toFixed(2)}
              onChange={(e) => setState(prev => ({
                ...prev,
                controlChart: { ...prev.controlChart, lcl: parseFloat(e.target.value) || 0 }
              }))}
              className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Mätvärden (kommaseparerade)</label>
          <input
            type="text"
            value={measurements.join(", ")}
            onChange={(e) => {
              const values = e.target.value.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
              setState(prev => ({
                ...prev,
                controlChart: { ...prev.controlChart, measurements: values }
              }));
            }}
            placeholder="10, 12, 11, 13, 10, 14..."
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Visual control chart */}
        {measurements.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="relative h-40">
              {/* UCL line */}
              <div
                className="absolute w-full border-t-2 border-dashed border-red-400"
                style={{ top: `${((maxVal - (state.controlChart.ucl || autoUCL)) / range) * 100}%` }}
              >
                <span className="absolute right-0 text-xs text-red-500 -top-3">UCL</span>
              </div>
              {/* CL line */}
              <div
                className="absolute w-full border-t-2 border-green-500"
                style={{ top: `${((maxVal - (state.controlChart.cl || mean)) / range) * 100}%` }}
              >
                <span className="absolute right-0 text-xs text-green-600 -top-3">CL</span>
              </div>
              {/* LCL line */}
              <div
                className="absolute w-full border-t-2 border-dashed border-red-400"
                style={{ top: `${((maxVal - (state.controlChart.lcl || autoLCL)) / range) * 100}%` }}
              >
                <span className="absolute right-0 text-xs text-red-500 -top-3">LCL</span>
              </div>
              {/* Data points */}
              <svg className="w-full h-full">
                <polyline
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="2"
                  points={measurements.map((val, idx) =>
                    `${(idx / (measurements.length - 1 || 1)) * 100}%,${((maxVal - val) / range) * 100}%`
                  ).join(" ")}
                />
                {measurements.map((val, idx) => (
                  <circle
                    key={idx}
                    cx={`${(idx / (measurements.length - 1 || 1)) * 100}%`}
                    cy={`${((maxVal - val) / range) * 100}%`}
                    r="4"
                    fill="#eab308"
                  />
                ))}
              </svg>
            </div>
          </div>
        )}

        <Button size="sm" onClick={() => markToolComplete("controlChart")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
}
