"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, Trash2 } from "lucide-react";
import { QMToolProps } from "./qm-types";

export function QMPrioritization({ state, setState, markToolComplete }: QMToolProps) {
    const calculateScore = (optionIdx: number): number => {
      if (!state.prioritization.scores[optionIdx]) return 0;
      return state.prioritization.scores[optionIdx].reduce((sum, score) => sum + (score || 0), 0);
    };

    const sortedOptions = state.prioritization.options
      .map((opt, idx) => ({ name: opt, score: calculateScore(idx), idx }))
      .sort((a, b) => b.score - a.score);

    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.prioritization.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            prioritization: { ...prev.prioritization, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Kriterier (kommaseparerade)</label>
            <input
              type="text"
              value={state.prioritization.criteria.join(", ")}
              onChange={(e) => {
                const criteria = e.target.value.split(",").map(c => c.trim()).filter(c => c);
                const newScores = state.prioritization.scores.map(row => {
                  const newRow = [...row];
                  while (newRow.length < criteria.length) newRow.push(0);
                  return newRow.slice(0, criteria.length);
                });
                setState(prev => ({
                  ...prev,
                  prioritization: { ...prev.prioritization, criteria, scores: newScores }
                }));
              }}
              placeholder="Effekt, Kostnad, Tid..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <p className="font-medium text-gray-600">Poängskala (0-10):</p>
              <p><span className="font-medium">Effekt:</span> 10 = stor positiv effekt på kvalitet, 1 = liten effekt</p>
              <p><span className="font-medium">Kostnad:</span> 10 = låg kostnad (billig), 1 = hög kostnad (dyr)</p>
              <p><span className="font-medium">Tid:</span> 10 = snabb att genomföra, 1 = lång tid</p>
              <p className="text-gray-400 italic">Högre poäng = bättre. Anpassa kriterierna efter ert projekt.</p>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Alternativ</label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setState(prev => ({
                  ...prev,
                  prioritization: {
                    ...prev.prioritization,
                    options: [...prev.prioritization.options, `Alternativ ${prev.prioritization.options.length + 1}`],
                    scores: [...prev.prioritization.scores, Array(prev.prioritization.criteria.length).fill(0)]
                  }
                }));
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Lägg till alternativ
            </Button>
          </div>
        </div>

        {state.prioritization.options.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-50">Alternativ</th>
                  {state.prioritization.criteria.map((crit, idx) => {
                    const explanations: Record<string, string> = {
                      "Effekt": "10 = stor positiv effekt, 1 = liten effekt",
                      "Kostnad": "10 = låg kostnad (billig), 1 = hög kostnad (dyr)",
                      "Tid": "10 = snabb att genomföra, 1 = lång tid"
                    };
                    return (
                      <th key={idx} className="border p-2 bg-gray-50 min-w-[80px] cursor-help" title={explanations[crit] || `Poäng 0-10 för ${crit}`}>
                        {crit}
                        {explanations[crit] && <span className="text-gray-400 ml-1">ⓘ</span>}
                      </th>
                    );
                  })}
                  <th className="border p-2 bg-yellow-50 font-bold">Summa</th>
                  <th className="border p-2 bg-gray-50 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {state.prioritization.options.map((opt, optIdx) => (
                  <tr key={optIdx}>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...state.prioritization.options];
                          newOptions[optIdx] = e.target.value;
                          setState(prev => ({
                            ...prev,
                            prioritization: { ...prev.prioritization, options: newOptions }
                          }));
                        }}
                        className="w-full focus:outline-none"
                      />
                    </td>
                    {state.prioritization.criteria.map((_, critIdx) => (
                      <td key={critIdx} className="border p-2">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={state.prioritization.scores[optIdx]?.[critIdx] || 0}
                          onChange={(e) => {
                            const newScores = [...state.prioritization.scores];
                            if (!newScores[optIdx]) newScores[optIdx] = [];
                            newScores[optIdx][critIdx] = parseInt(e.target.value) || 0;
                            setState(prev => ({
                              ...prev,
                              prioritization: { ...prev.prioritization, scores: newScores }
                            }));
                          }}
                          className="w-full text-center focus:outline-none focus:ring-1 focus:ring-yellow-500 rounded"
                        />
                      </td>
                    ))}
                    <td className="border p-2 text-center font-bold bg-yellow-50">
                      {calculateScore(optIdx)}
                    </td>
                    <td className="border p-2">
                      <button
                        onClick={() => {
                          const newOptions = state.prioritization.options.filter((_, i) => i !== optIdx);
                          const newScores = state.prioritization.scores.filter((_, i) => i !== optIdx);
                          setState(prev => ({
                            ...prev,
                            prioritization: { ...prev.prioritization, options: newOptions, scores: newScores }
                          }));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {sortedOptions.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h5 className="font-medium text-green-800 mb-2">Prioritering:</h5>
            <ol className="list-decimal list-inside space-y-1">
              {sortedOptions.map((opt, idx) => (
                <li key={opt.idx} className={`text-sm ${idx === 0 ? 'font-bold text-green-700' : 'text-gray-600'}`}>
                  {opt.name} ({opt.score} poäng)
                </li>
              ))}
            </ol>
          </div>
        )}

        <Button size="sm" onClick={() => markToolComplete("prioritization")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
}
