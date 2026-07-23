"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, Trash2 } from "lucide-react";
import { QMToolProps } from "./qm-types";

export function QMTree({ state, setState, markToolComplete }: QMToolProps) {
    return (
      <div className="space-y-4">
        <input
          type="text"
          value={state.tree.title}
          onChange={(e) => setState(prev => ({
            ...prev,
            tree: { ...prev.tree, title: e.target.value }
          }))}
          className="text-lg font-medium w-full border-b border-transparent hover:border-gray-300 focus:border-yellow-500 focus:outline-none pb-1"
        />

        <div>
          <label className="block text-sm text-gray-600 mb-1">Övergripande mål</label>
          <input
            type="text"
            value={state.tree.goal}
            onChange={(e) => setState(prev => ({
              ...prev,
              tree: { ...prev.tree, goal: e.target.value }
            }))}
            placeholder="Vad vill ni uppnå?"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {state.tree.goal && (
          <div className="p-4 bg-gray-50 rounded-lg overflow-x-auto">
            {/* Root node */}
            <div className="flex flex-col items-center">
              <div className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium text-center shadow">
                {state.tree.goal}
              </div>
              {state.tree.branches.length > 0 && (
                <div className="w-0.5 h-6 bg-yellow-400" />
              )}
            </div>

            {/* Branches */}
            {state.tree.branches.length > 0 && (
              <div className="relative">
                {/* Horizontal connector line between branches */}
                {state.tree.branches.length > 1 && (
                  <div className="absolute top-0 h-0.5 bg-yellow-300" style={{
                    left: `${100 / (state.tree.branches.length * 2)}%`,
                    right: `${100 / (state.tree.branches.length * 2)}%`
                  }} />
                )}

                <div className="flex justify-center gap-6">
                  {state.tree.branches.map((branch, branchIdx) => (
                    <div key={branchIdx} className="flex flex-col items-center flex-1" style={{ minWidth: '180px', maxWidth: '280px' }}>
                      {/* Vertical connector from horizontal line to branch */}
                      <div className="w-0.5 h-4 bg-yellow-300" />

                      {/* Branch node */}
                      <div className="w-full border-2 border-yellow-400 rounded-lg p-2 bg-white shadow-sm">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={branch.name}
                            onChange={(e) => {
                              const newBranches = [...state.tree.branches];
                              newBranches[branchIdx].name = e.target.value;
                              setState(prev => ({
                                ...prev,
                                tree: { ...prev.tree, branches: newBranches }
                              }));
                            }}
                            placeholder="Delmål/strategi"
                            className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 font-medium"
                          />
                          <button
                            onClick={() => {
                              const newBranches = state.tree.branches.filter((_, i) => i !== branchIdx);
                              setState(prev => ({
                                ...prev,
                                tree: { ...prev.tree, branches: newBranches }
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 flex-shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Sub-branches */}
                      {branch.subBranches.length > 0 && (
                        <div className="w-0.5 h-3 bg-gray-300" />
                      )}
                      <div className="w-full space-y-1">
                        {branch.subBranches.map((sub, subIdx) => (
                          <div key={subIdx} className="flex items-center gap-1 w-full">
                            <div className="w-4 h-0.5 bg-gray-300 flex-shrink-0" />
                            <div className="flex-1 flex items-center gap-1 border rounded px-2 py-1 bg-white text-sm">
                              <input
                                type="text"
                                value={sub}
                                onChange={(e) => {
                                  const newBranches = [...state.tree.branches];
                                  newBranches[branchIdx].subBranches[subIdx] = e.target.value;
                                  setState(prev => ({
                                    ...prev,
                                    tree: { ...prev.tree, branches: newBranches }
                                  }));
                                }}
                                placeholder="Åtgärd"
                                className="flex-1 focus:outline-none text-sm"
                              />
                              <button
                                onClick={() => {
                                  const newBranches = [...state.tree.branches];
                                  newBranches[branchIdx].subBranches = newBranches[branchIdx].subBranches.filter((_, i) => i !== subIdx);
                                  setState(prev => ({
                                    ...prev,
                                    tree: { ...prev.tree, branches: newBranches }
                                  }));
                                }}
                                className="text-gray-400 hover:text-red-500 flex-shrink-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          const newBranches = [...state.tree.branches];
                          newBranches[branchIdx].subBranches.push("");
                          setState(prev => ({
                            ...prev,
                            tree: { ...prev.tree, branches: newBranches }
                          }));
                        }}
                        className="text-xs text-gray-500 hover:text-yellow-600 mt-1"
                      >
                        + Lägg till åtgärd
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setState(prev => ({
                    ...prev,
                    tree: {
                      ...prev.tree,
                      branches: [...prev.tree.branches, { name: "", subBranches: [] }]
                    }
                  }));
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Lägg till delmål
              </Button>
            </div>
          </div>
        )}

        <Button size="sm" onClick={() => markToolComplete("tree")} className="mt-2">
          <CheckCircle className="w-4 h-4 mr-1" />
          Markera som klar
        </Button>
      </div>
    );
}
