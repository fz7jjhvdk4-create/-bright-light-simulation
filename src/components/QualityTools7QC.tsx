"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { ToolsState, defaultState, toolDescriptions } from "./quality/qc-types";
import { QCChecksheet } from "./quality/QCChecksheet";
import { QCPareto } from "./quality/QCPareto";
import { QCCauseEffect } from "./quality/QCCauseEffect";
import { QCHistogram } from "./quality/QCHistogram";
import { QCControlChart } from "./quality/QCControlChart";
import { QCScatter } from "./quality/QCScatter";
import { QCStratification } from "./quality/QCStratification";

interface QualityTools7QCProps {
  groupCode: string;
}

export function QualityTools7QC({ groupCode }: QualityTools7QCProps) {
  const [state, setState] = useState<ToolsState>(defaultState);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [rawStratValues, setRawStratValues] = useState<Record<number, string>>({});
  const [activeCEDiagram, setActiveCEDiagram] = useState(0);

  useEffect(() => {
    const savedData = localStorage.getItem(`7qc-${groupCode}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Migrate old causeEffect format (single object) to new format (array)
      if (parsed.causeEffect && !Array.isArray(parsed.causeEffect)) {
        parsed.causeEffect = [{
          id: "ce-1",
          problem: parsed.causeEffect.problem,
          categories: parsed.causeEffect.categories
        }];
      }
      setState(parsed);
    }
  }, [groupCode]);

  const handleSave = () => {
    localStorage.setItem(`7qc-${groupCode}`, JSON.stringify(state));
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
  const requiredCount = 4;

  // Checksheet component

  const toolProps = { state, setState, markToolComplete };

  const renderToolContent = (toolKey: string) => {
    switch (toolKey) {
      case "checksheet": return <QCChecksheet {...toolProps} />;
      case "histogram": return <QCHistogram {...toolProps} />;
      case "pareto": return <QCPareto {...toolProps} />;
      case "causeEffect": return <QCCauseEffect {...toolProps} activeCEDiagram={activeCEDiagram} setActiveCEDiagram={setActiveCEDiagram} />;
      case "scatter": return <QCScatter {...toolProps} />;
      case "controlChart": return <QCControlChart {...toolProps} />;
      case "stratification": return <QCStratification {...toolProps} rawStratValues={rawStratValues} setRawStratValues={setRawStratValues} />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">7 Kvalitetsverktyg (7QC)</h3>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            {saved ? "Sparat!" : "Spara"}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Använd minst {requiredCount} av de 7 kvalitetsverktygen för att analysera kvalitetsdata.
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
