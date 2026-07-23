"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { ToolsState, defaultState, toolDescriptions } from "./quality/qm-types";
import { QMAffinity } from "./quality/QMAffinity";
import { QMTree } from "./quality/QMTree";
import { QMMatrix } from "./quality/QMMatrix";
import { QMPDPC } from "./quality/QMPDPC";
import { QMPrioritization } from "./quality/QMPrioritization";
import { QMRelations } from "./quality/QMRelations";
import { QMArrow } from "./quality/QMArrow";

interface QualityTools7QMProps {
  groupCode: string;
}

export function QualityTools7QM({ groupCode }: QualityTools7QMProps) {
  const [state, setState] = useState<ToolsState>(defaultState);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [relFrom, setRelFrom] = useState<number | "">("");
  const [relTo, setRelTo] = useState<number | "">("");

  useEffect(() => {
    const savedData = localStorage.getItem(`7qm-${groupCode}`);
    if (savedData) {
      setState(JSON.parse(savedData));
    }
  }, [groupCode]);

  const handleSave = () => {
    localStorage.setItem(`7qm-${groupCode}`, JSON.stringify(state));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const markToolComplete = (toolKey: string) => {
    if (!state.completedTools.includes(toolKey)) {
      setState(prev => ({
        ...prev,
        completedTools: [...prev.completedTools, toolKey]
      }));
    }
  };

  const completedCount = state.completedTools.length;
  const requiredCount = 2;

  // Affinity Diagram

  const toolProps = { state, setState, markToolComplete };

  const renderToolContent = (toolKey: string) => {
    switch (toolKey) {
      case "affinity": return <QMAffinity {...toolProps} />;
      case "relations": return <QMRelations {...toolProps} relFrom={relFrom} setRelFrom={setRelFrom} relTo={relTo} setRelTo={setRelTo} />;
      case "tree": return <QMTree {...toolProps} />;
      case "matrix": return <QMMatrix {...toolProps} />;
      case "arrow": return <QMArrow {...toolProps} />;
      case "pdpc": return <QMPDPC {...toolProps} />;
      case "prioritization": return <QMPrioritization {...toolProps} />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">7 Ledningsverktyg (7QM)</h3>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            {saved ? "Sparat!" : "Spara"}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Använd minst {requiredCount} av de 7 ledningsverktygen för planering och beslutsfattande.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${completedCount >= requiredCount ? 'bg-green-500' : 'bg-yellow-500'}`}
              style={{ width: `${(completedCount / 7) * 100}%` }}
            />
          </div>
          <span className={`text-sm font-medium ${completedCount >= requiredCount ? 'text-green-600' : 'text-gray-600'}`}>
            {completedCount}/{requiredCount} klara
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {Object.entries(toolDescriptions).map(([key, tool]) => {
            const isCompleted = state.completedTools.includes(key);
            const isActive = activeTool === key;

            return (
              <div key={key} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveTool(isActive ? null : key)}
                  className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
                    isCompleted ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tool.icon}</span>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {tool.name}
                        {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="text-sm text-gray-500">{tool.description}</div>
                    </div>
                  </div>
                  {isActive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {isActive && (
                  <div className="p-4 border-t bg-gray-50">
                    {renderToolContent(key)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
