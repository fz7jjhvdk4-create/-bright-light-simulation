"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { rootCauses } from "@/lib/root-causes";
import { TrendingDown, Target, DollarSign, Award, AlertCircle, Download } from "lucide-react";

interface ResultsCalculationProps {
  groupCode: string;
  proposals: Array<{
    id: number;
    rootCauseId: string;
    description: string;
    responsible: string | null;
    cost: number | null;
  }>;
}

export function ResultsCalculation({ groupCode, proposals }: ResultsCalculationProps) {
  const [eventImpact, setEventImpact] = useState(0);

  useEffect(() => {
    // Load event choices and calculate impact
    const savedEvents = localStorage.getItem(`events-${groupCode}`);
    if (savedEvents) {
      const events = JSON.parse(savedEvents);
      let totalImpact = 0;
      events.forEach((event: { resolved: boolean; chosenOption?: string; choices: { id: string; impact: number }[] }) => {
        if (event.resolved && event.chosenOption) {
          const choice = event.choices.find((c: { id: string }) => c.id === event.chosenOption);
          if (choice) {
            totalImpact += choice.impact;
          }
        }
      });
      setEventImpact(totalImpact);
    }
  }, [groupCode]);

  // Calculate which root causes are addressed by proposals
  const addressedRootCauses = new Set(proposals.map(p => p.rootCauseId));

  // Calculate total reduction
  let baseReduction = 0;
  rootCauses.forEach(rc => {
    if (addressedRootCauses.has(rc.id)) {
      baseReduction += rc.impact;
    }
  });

  // Apply event impact modifier (-0.1 to +0.1 based on choices)
  const eventModifier = eventImpact * 0.05; // Scale down event impact
  const totalReduction = Math.min(1, Math.max(0, baseReduction + eventModifier));
  const reductionPercent = Math.round(totalReduction * 100);

  // Calculate savings
  const currentCost = 4.8; // MSEK
  const savings = currentCost * totalReduction;
  const totalProposalCost = proposals.reduce((sum, p) => sum + (p.cost || 0), 0);
  const roi = totalProposalCost > 0 ? (savings * 1000000) / totalProposalCost : 0;

  // Check goal achievement
  const goalMet = reductionPercent >= 50;

  // Find missed root causes
  const missedRootCauses = rootCauses.filter(rc => !addressedRootCauses.has(rc.id));

  const exportResults = () => {
    let content = "RESULTATRAPPORT\n" + "=".repeat(50) + "\n\n";
    content += `Projekt: Kvalitetsförbättring Bright Light Solutions\n`;
    content += `Grupp: ${groupCode}\n\n`;

    content += "RESULTAT:\n" + "-".repeat(30) + "\n";
    content += `Förväntad reduktion: ${reductionPercent}%\n`;
    content += `Mål (50%): ${goalMet ? "UPPNÅTT" : "EJ UPPNÅTT"}\n`;
    content += `Besparing: ${savings.toFixed(1)} MSEK/år\n`;
    content += `ROI: ${roi.toFixed(1)}x\n\n`;

    content += "ADRESSERADE ROTORSAKER:\n" + "-".repeat(30) + "\n";
    rootCauses.filter(rc => addressedRootCauses.has(rc.id)).forEach(rc => {
      content += `✓ ${rc.name} (${Math.round(rc.impact * 100)}%)\n`;
    });

    if (missedRootCauses.length > 0) {
      content += "\nMISSADE ROTORSAKER:\n" + "-".repeat(30) + "\n";
      missedRootCauses.forEach(rc => {
        content += `✗ ${rc.name} (${Math.round(rc.impact * 100)}%)\n`;
      });
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resultatrapport-${groupCode}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Resultatberäkning</h3>
          <Button size="sm" variant="outline" onClick={exportResults}>
            <Download className="w-4 h-4 mr-1" />
            Exportera rapport
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Se förväntade resultat baserat på era åtgärdsförslag och hur ni hanterat händelser.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Main result */}
        <div className={`p-6 rounded-lg border-2 mb-6 ${goalMet ? "border-green-300 bg-green-50" : "border-yellow-300 bg-yellow-50"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {goalMet ? (
                <Award className="w-10 h-10 text-green-500" />
              ) : (
                <Target className="w-10 h-10 text-yellow-500" />
              )}
              <div>
                <h4 className="text-2xl font-bold">
                  {reductionPercent}% reduktion
                </h4>
                <p className={`text-sm ${goalMet ? "text-green-600" : "text-yellow-600"}`}>
                  {goalMet ? "Målet på 50% är uppnått!" : "Målet på 50% är inte uppnått"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {savings.toFixed(1)} MSEK
              </div>
              <div className="text-sm text-gray-500">Besparing per år</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress mot mål</span>
              <span>{reductionPercent}% / 50%</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${goalMet ? "bg-green-500" : "bg-yellow-500"}`}
                style={{ width: `${Math.min(100, (reductionPercent / 50) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white border rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm">Reduktion</span>
            </div>
            <div className="text-2xl font-bold">{reductionPercent}%</div>
          </div>
          <div className="p-4 bg-white border rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">ROI</span>
            </div>
            <div className="text-2xl font-bold">{roi.toFixed(1)}x</div>
          </div>
          <div className="p-4 bg-white border rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-sm">Åtgärdskostnad</span>
            </div>
            <div className="text-2xl font-bold">
              {(totalProposalCost / 1000).toFixed(0)}k
            </div>
          </div>
        </div>

        {/* Root causes breakdown */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">Adresserade rotorsaker</h4>
          <div className="space-y-2">
            {rootCauses.map((rc) => {
              const addressed = addressedRootCauses.has(rc.id);
              return (
                <div
                  key={rc.id}
                  className={`p-3 rounded-lg border ${
                    addressed ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {addressed ? (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-300" />
                      )}
                      <span className={addressed ? "font-medium" : "text-gray-500"}>
                        {rc.name}
                      </span>
                    </div>
                    <span className={`font-medium ${addressed ? "text-green-600" : "text-gray-400"}`}>
                      {Math.round(rc.impact * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips for missed root causes */}
        {!goalMet && missedRootCauses.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Tips för att nå målet</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Ni har inte adresserat följande rotorsaker:
                </p>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  {missedRootCauses.map((rc) => (
                    <li key={rc.id}>
                      {rc.name} ({Math.round(rc.impact * 100)}% potential)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
