"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save, Download, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { exportAsExcel, downloadBlob } from "@/lib/export-utils";

interface Risk {
  id: string;
  description: string;
  probability: number;
  consequence: number;
  mitigation: string;
}

interface RiskAnalysisProps {
  groupCode: string;
}

const defaultRisks: Risk[] = [];

export function RiskAnalysis({ groupCode }: RiskAnalysisProps) {
  const [risks, setRisks] = useState<Risk[]>(defaultRisks);
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newRisk, setNewRisk] = useState({
    description: "",
    probability: 3,
    consequence: 3,
    mitigation: ""
  });

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`risks-${groupCode}`);
    if (savedData) {
      setRisks(JSON.parse(savedData));
    }
  }, [groupCode]);

  const handleSave = () => {
    localStorage.setItem(`risks-${groupCode}`, JSON.stringify(risks));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getRiskValue = (probability: number, consequence: number) => probability * consequence;

  const getRiskColor = (value: number): string => {
    if (value > 12) return "bg-red-100 border-red-300 text-red-800";
    if (value >= 8) return "bg-yellow-100 border-yellow-300 text-yellow-800";
    return "bg-green-100 border-green-300 text-green-800";
  };

  const getRiskLevel = (value: number): string => {
    if (value > 12) return "Hög";
    if (value >= 8) return "Medel";
    return "Låg";
  };

  const updateRisk = (id: string, field: keyof Risk, value: number | string) => {
    setRisks(prev =>
      prev.map(r => r.id === id ? { ...r, [field]: value } : r)
    );
    setSaved(false);
  };

  const addRisk = () => {
    if (!newRisk.description.trim()) return;

    const risk: Risk = {
      id: Date.now().toString(),
      ...newRisk
    };
    setRisks(prev => [...prev, risk]);
    setNewRisk({ description: "", probability: 3, consequence: 3, mitigation: "" });
    setShowForm(false);
    setSaved(false);
  };

  const deleteRisk = (id: string) => {
    setRisks(prev => prev.filter(r => r.id !== id));
    setSaved(false);
  };

  const handleExportExcel = () => {
    const data = risks.map(r => {
      const value = getRiskValue(r.probability, r.consequence);
      return {
        Risk: r.description,
        Sannolikhet: r.probability,
        Konsekvens: r.consequence,
        Riskvärde: value,
        Nivå: getRiskLevel(value),
        Åtgärd: r.mitigation || ""
      };
    });

    const blob = exportAsExcel(data, `riskanalys-${groupCode}.xlsx`, "Riskanalys");
    downloadBlob(blob, `riskanalys-${groupCode}.xlsx`);
  };

  // Sort risks by risk value (highest first)
  const sortedRisks = [...risks].sort((a, b) =>
    getRiskValue(b.probability, b.consequence) - getRiskValue(a.probability, a.consequence)
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Riskanalys</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="w-4 h-4 mr-1" />
              Exportera Excel
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-1" />
              Lägg till
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              {saved ? "Sparat!" : "Spara"}
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Identifiera risker och bedöm sannolikhet (1-5) och konsekvens (1-5). Riskvärde = S × K.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Risk legend */}
        <div className="mb-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
            <span>Hög (&gt;12)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></div>
            <span>Medel (8-12)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
            <span>Låg (&lt;8)</span>
          </div>
        </div>

        {/* Add risk form */}
        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium mb-3">Ny risk</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Riskbeskrivning
                </label>
                <input
                  type="text"
                  value={newRisk.description}
                  onChange={(e) => setNewRisk(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beskriv risken..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sannolikhet: {newRisk.probability}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newRisk.probability}
                    onChange={(e) => setNewRisk(prev => ({ ...prev, probability: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konsekvens: {newRisk.consequence}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newRisk.consequence}
                    onChange={(e) => setNewRisk(prev => ({ ...prev, consequence: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={addRisk} disabled={!newRisk.description.trim()}>
                  Lägg till risk
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Avbryt
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Risks table */}
        <div className="space-y-3">
          {sortedRisks.map(risk => {
            const riskValue = getRiskValue(risk.probability, risk.consequence);

            return (
              <div
                key={risk.id}
                className={`p-4 rounded-lg border ${getRiskColor(riskValue)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">{risk.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{riskValue}</span>
                    <span className="text-sm">({getRiskLevel(riskValue)})</span>
                    <button
                      onClick={() => deleteRisk(risk.id)}
                      className="p-1 hover:bg-white/50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm mb-1">
                      Sannolikhet: {risk.probability}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={risk.probability}
                      onChange={(e) => updateRisk(risk.id, "probability", parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">
                      Konsekvens: {risk.consequence}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={risk.consequence}
                      onChange={(e) => updateRisk(risk.id, "consequence", parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1">Riskreducerande åtgärd</label>
                  <input
                    type="text"
                    value={risk.mitigation}
                    onChange={(e) => updateRisk(risk.id, "mitigation", e.target.value)}
                    placeholder="Hur kan risken minskas?"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-sm bg-white/50"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
