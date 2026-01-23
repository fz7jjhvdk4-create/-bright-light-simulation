"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { roles } from "@/lib/roles";
import { Save, Download, Image as ImageIcon, FileText } from "lucide-react";
import { exportAsImage, exportAsPDF, downloadBlob } from "@/lib/export-utils";

interface StakeholderData {
  roleId: string;
  power: number;
  interest: number;
  strategy: string;
}

interface StakeholderAnalysisProps {
  groupCode: string;
}

export function StakeholderAnalysis({ groupCode }: StakeholderAnalysisProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [stakeholders, setStakeholders] = useState<StakeholderData[]>(
    roles.map(role => ({
      roleId: role.id,
      power: 3,
      interest: 3,
      strategy: ""
    }))
  );
  const [saved, setSaved] = useState(false);

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`stakeholders-${groupCode}`);
    if (savedData) {
      setStakeholders(JSON.parse(savedData));
    }
  }, [groupCode]);

  const handleSave = () => {
    localStorage.setItem(`stakeholders-${groupCode}`, JSON.stringify(stakeholders));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateStakeholder = (roleId: string, field: keyof StakeholderData, value: number | string) => {
    setStakeholders(prev =>
      prev.map(s => s.roleId === roleId ? { ...s, [field]: value } : s)
    );
    setSaved(false);
  };

  const getQuadrant = (power: number, interest: number): string => {
    if (power >= 3 && interest >= 3) return "Manage Closely";
    if (power >= 3 && interest < 3) return "Keep Satisfied";
    if (power < 3 && interest >= 3) return "Keep Informed";
    return "Monitor";
  };

  const getQuadrantColor = (quadrant: string): string => {
    switch (quadrant) {
      case "Manage Closely": return "bg-red-100 border-red-300";
      case "Keep Satisfied": return "bg-yellow-100 border-yellow-300";
      case "Keep Informed": return "bg-blue-100 border-blue-300";
      default: return "bg-gray-100 border-gray-300";
    }
  };

  const handleExportImage = async () => {
    try {
      const blob = await exportAsImage("stakeholder-content", `intressentanalys-${groupCode}.png`);
      downloadBlob(blob, `intressentanalys-${groupCode}.png`);
    } catch (error) {
      console.error("Export error:", error);
      // Fallback to text export
      const content = stakeholders.map(s => {
        const role = roles.find(r => r.id === s.roleId);
        return `${role?.name} (${role?.title}): Power=${s.power}, Interest=${s.interest}, Quadrant=${getQuadrant(s.power, s.interest)}, Strategy: ${s.strategy || "Ej angiven"}`;
      }).join("\n");
      const blob = new Blob([content], { type: "text/plain" });
      downloadBlob(blob, `intressentanalys-${groupCode}.txt`);
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await exportAsPDF("stakeholder-content", `intressentanalys-${groupCode}.pdf`, "Intressentanalys");
      downloadBlob(blob, `intressentanalys-${groupCode}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Kunde inte exportera som PDF");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Intressentanalys</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExportImage}>
              <ImageIcon className="w-4 h-4 mr-1" />
              PNG
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportPDF}>
              <FileText className="w-4 h-4 mr-1" />
              PDF
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              {saved ? "Sparat!" : "Spara"}
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Bedöm varje intressents makt (Power) och intresse (Interest) för att avgöra hur de ska hanteras.
        </p>
      </div>

      <div id="stakeholder-content" className="flex-1 overflow-y-auto p-4" ref={contentRef}>
        {/* Power/Interest Matrix visualization */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3 text-center">Power/Interest-matris</h4>
          <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded text-center">
              <div className="font-medium text-sm">Keep Satisfied</div>
              <div className="text-xs text-gray-600">Hög makt, lågt intresse</div>
              <div className="mt-2 text-xs">
                {stakeholders.filter(s => getQuadrant(s.power, s.interest) === "Keep Satisfied").map(s => {
                  const role = roles.find(r => r.id === s.roleId);
                  return <div key={s.roleId}>{role?.name}</div>;
                })}
              </div>
            </div>
            <div className="p-3 bg-red-100 border border-red-300 rounded text-center">
              <div className="font-medium text-sm">Manage Closely</div>
              <div className="text-xs text-gray-600">Hög makt, högt intresse</div>
              <div className="mt-2 text-xs">
                {stakeholders.filter(s => getQuadrant(s.power, s.interest) === "Manage Closely").map(s => {
                  const role = roles.find(r => r.id === s.roleId);
                  return <div key={s.roleId}>{role?.name}</div>;
                })}
              </div>
            </div>
            <div className="p-3 bg-gray-100 border border-gray-300 rounded text-center">
              <div className="font-medium text-sm">Monitor</div>
              <div className="text-xs text-gray-600">Låg makt, lågt intresse</div>
              <div className="mt-2 text-xs">
                {stakeholders.filter(s => getQuadrant(s.power, s.interest) === "Monitor").map(s => {
                  const role = roles.find(r => r.id === s.roleId);
                  return <div key={s.roleId}>{role?.name}</div>;
                })}
              </div>
            </div>
            <div className="p-3 bg-blue-100 border border-blue-300 rounded text-center">
              <div className="font-medium text-sm">Keep Informed</div>
              <div className="text-xs text-gray-600">Låg makt, högt intresse</div>
              <div className="mt-2 text-xs">
                {stakeholders.filter(s => getQuadrant(s.power, s.interest) === "Keep Informed").map(s => {
                  const role = roles.find(r => r.id === s.roleId);
                  return <div key={s.roleId}>{role?.name}</div>;
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Stakeholder list */}
        <div className="space-y-4">
          {roles.map(role => {
            const stakeholder = stakeholders.find(s => s.roleId === role.id)!;
            const quadrant = getQuadrant(stakeholder.power, stakeholder.interest);

            return (
              <div
                key={role.id}
                className={`p-4 rounded-lg border ${getQuadrantColor(quadrant)}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{role.avatar}</span>
                  <div>
                    <div className="font-medium">{role.name}</div>
                    <div className="text-sm text-gray-600">{role.title}</div>
                  </div>
                  <div className="ml-auto text-sm font-medium px-2 py-1 bg-white rounded">
                    {quadrant}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Power (Makt): {stakeholder.power}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={stakeholder.power}
                      onChange={(e) => updateStakeholder(role.id, "power", parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Låg</span>
                      <span>Hög</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Interest (Intresse): {stakeholder.interest}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={stakeholder.interest}
                      onChange={(e) => updateStakeholder(role.id, "interest", parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Låg</span>
                      <span>Hög</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Hanteringsstrategi
                  </label>
                  <input
                    type="text"
                    value={stakeholder.strategy}
                    onChange={(e) => updateStakeholder(role.id, "strategy", e.target.value)}
                    placeholder="Hur ska denna intressent hanteras?"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-sm"
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
