"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, RefreshCw, Trash2 } from "lucide-react";
import { FELTYPER } from "@/lib/data-generator";
import { QCToolProps } from "./qc-types";

// Chart geometry (SVG user units)
const SLOT = 104;        // horizontal space per category
const CHART_H = 220;     // plot height
const PAD_LEFT = 52;
const PAD_RIGHT = 56;
const PAD_TOP = 30;      // room for value labels above bars
const PAD_BOTTOM = 48;   // room for category + count labels
const BAR_W = 64;

// Round the count axis up to a "nice" maximum so gridline labels stay clean
function niceAxisMax(maxCount: number): number {
  if (maxCount <= 10) return 10;
  const power = 10 ** Math.floor(Math.log10(maxCount));
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (maxCount <= step * power) return step * power;
  }
  return 10 * power;
}

export function QCPareto({ state, setState, markToolComplete }: QCToolProps) {
  const sortedItems = [...state.pareto.items].sort((a, b) => b.count - a.count);
  const total = sortedItems.reduce((sum, item) => sum + item.count, 0);

  const axisMax = niceAxisMax(Math.max(...sortedItems.map(i => i.count), 1));
  const width = PAD_LEFT + sortedItems.length * SLOT + PAD_RIGHT;
  const height = PAD_TOP + CHART_H + PAD_BOTTOM;
  const yCount = (count: number) => PAD_TOP + CHART_H - (count / axisMax) * CHART_H;
  const yPercent = (pct: number) => PAD_TOP + CHART_H - (pct / 100) * CHART_H;
  const slotCenter = (idx: number) => PAD_LEFT + idx * SLOT + SLOT / 2;

  // Cumulative share per (descending) category
  let running = 0;
  const cumulative = sortedItems.map(item => {
    running += item.count;
    return total > 0 ? (running / total) * 100 : 0;
  });

  const resetToFaultTypes = () => {
    setState(prev => ({
      ...prev,
      pareto: {
        title: "Feltyper i reklamationsdatan",
        items: FELTYPER.map(name => ({ name, count: 0 })),
      },
    }));
  };

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

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Antalen per feltyp hittar ni i <strong>Reklamationer.xlsx</strong> (kolumnen Feltyp).
        Staplarna sorteras automatiskt i fallande ordning och den röda kurvan visar kumulativ
        andel — där den korsar 80&nbsp;%-linjen ser ni vilka feltyper som står för merparten av problemen.
      </p>

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
              className="w-40 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
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
              aria-label={`Antal för ${item.name}`}
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
              title="Ta bort"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
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
          <Button
            size="sm"
            variant="outline"
            onClick={resetToFaultTypes}
            title="Ersätt kategorierna med feltyperna från Reklamationer.xlsx"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Hämta feltyper från reklamationsdatan
          </Button>
        </div>
      </div>

      {/* Pareto chart: descending bars + cumulative curve + 80% line */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        {total === 0 ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg py-10 text-center text-sm text-gray-400 dark:text-gray-500">
            Fyll i antal per feltyp så ritas paretodiagrammet här.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              width={width}
              height={height}
              className="max-w-full h-auto"
              role="img"
              aria-label={`Paretodiagram: ${state.pareto.title}`}
              style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
            >
              {/* Gridlines + left axis labels (antal) */}
              {[0.25, 0.5, 0.75, 1].map(frac => (
                <g key={frac}>
                  <line
                    x1={PAD_LEFT} y1={yCount(axisMax * frac)}
                    x2={width - PAD_RIGHT} y2={yCount(axisMax * frac)}
                    className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1"
                  />
                  <text
                    x={PAD_LEFT - 6} y={yCount(axisMax * frac) + 3.5}
                    fontSize="10" className="fill-gray-400 dark:fill-gray-500" textAnchor="end"
                  >
                    {Math.round(axisMax * frac)}
                  </text>
                </g>
              ))}
              <text x={PAD_LEFT - 6} y={yCount(0) + 3.5} fontSize="10" className="fill-gray-400 dark:fill-gray-500" textAnchor="end">0</text>

              {/* 80% reference line */}
              <line
                x1={PAD_LEFT} y1={yPercent(80)}
                x2={width - PAD_RIGHT} y2={yPercent(80)}
                stroke="#DC2626" strokeWidth="1" strokeDasharray="5 4" opacity="0.5"
              />
              <text x={width - PAD_RIGHT - 4} y={yPercent(80) - 4} fontSize="9" fill="#DC2626" textAnchor="end" opacity="0.8">
                80 %
              </text>

              {/* Bars + labels */}
              {sortedItems.map((item, idx) => {
                const barH = (item.count / axisMax) * CHART_H;
                const cx = slotCenter(idx);
                const label = item.name.length > 15 ? `${item.name.slice(0, 14)}…` : item.name;
                return (
                  <g key={idx}>
                    <rect
                      x={cx - BAR_W / 2}
                      y={yCount(item.count)}
                      width={BAR_W}
                      height={Math.max(barH, item.count > 0 ? 2 : 0)}
                      rx="3"
                      fill="#EAB308"
                      opacity="0.9"
                    >
                      <title>{`${item.name}: ${item.count} st`}</title>
                    </rect>
                    {item.count > 0 && (
                      <text x={cx} y={yCount(item.count) - 5} fontSize="10.5" className="fill-gray-500 dark:fill-gray-400" textAnchor="middle">
                        {item.count}
                      </text>
                    )}
                    <text x={cx} y={PAD_TOP + CHART_H + 16} fontSize="10" className="fill-gray-700 dark:fill-gray-300" textAnchor="middle">
                      {label}
                      <title>{item.name}</title>
                    </text>
                  </g>
                );
              })}

              {/* Cumulative curve + points + % labels */}
              <polyline
                points={sortedItems.map((_, idx) => `${slotCenter(idx)},${yPercent(cumulative[idx])}`).join(" ")}
                fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinejoin="round"
              />
              {sortedItems.map((_, idx) => (
                <g key={idx}>
                  <circle cx={slotCenter(idx)} cy={yPercent(cumulative[idx])} r="3.5" fill="#DC2626" />
                  <text
                    x={slotCenter(idx) + (idx === sortedItems.length - 1 ? -6 : 8)}
                    y={yPercent(cumulative[idx]) + (idx === sortedItems.length - 1 ? 14 : -7)}
                    fontSize="10" fill="#DC2626" fontWeight="600"
                    textAnchor={idx === sortedItems.length - 1 ? "end" : "start"}
                  >
                    {cumulative[idx].toFixed(0)} %
                  </text>
                </g>
              ))}

              {/* Axes */}
              <line x1={PAD_LEFT} y1={PAD_TOP} x2={PAD_LEFT} y2={PAD_TOP + CHART_H} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.2" />
              <line x1={PAD_LEFT} y1={PAD_TOP + CHART_H} x2={width - PAD_RIGHT} y2={PAD_TOP + CHART_H} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.2" />
              <line x1={width - PAD_RIGHT} y1={PAD_TOP} x2={width - PAD_RIGHT} y2={PAD_TOP + CHART_H} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.2" />

              {/* Right axis labels (%) */}
              {[0, 50, 100].map(pct => (
                <text key={pct} x={width - PAD_RIGHT + 6} y={yPercent(pct) + 3.5} fontSize="10" className="fill-gray-400 dark:fill-gray-500">
                  {pct}
                </text>
              ))}

              {/* Axis titles */}
              <text
                x={14} y={PAD_TOP + CHART_H / 2} fontSize="10" className="fill-gray-500 dark:fill-gray-400" textAnchor="middle"
                transform={`rotate(-90 14 ${PAD_TOP + CHART_H / 2})`}
              >
                Antal
              </text>
              <text
                x={width - 12} y={PAD_TOP + CHART_H / 2} fontSize="10" className="fill-gray-500 dark:fill-gray-400" textAnchor="middle"
                transform={`rotate(90 ${width - 12} ${PAD_TOP + CHART_H / 2})`}
              >
                Kumulativ andel
              </text>
            </svg>
          </div>
        )}
      </div>

      <Button size="sm" onClick={() => markToolComplete("pareto")} className="mt-2">
        <CheckCircle className="w-4 h-4 mr-1" />
        Markera som klar
      </Button>
    </div>
  );
}
