"use client";

import { useState, useEffect, useRef, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { roles } from "@/lib/roles";
import { Save, Image as ImageIcon, FileText } from "lucide-react";
import { exportAsImage, exportAsPDF, downloadBlob } from "@/lib/export-utils";

type Quadrant = "manage_closely" | "keep_satisfied" | "keep_informed" | "monitor" | "unassigned";

interface StakeholderData {
  roleId: string;
  quadrant: Quadrant;
  strategy: string;
}

interface StakeholderAnalysisProps {
  groupCode: string;
}

const quadrantInfo: Record<Quadrant, { name: string; description: string; color: string; borderColor: string }> = {
  manage_closely: { name: "Manage Closely", description: "Hög makt, högt intresse", color: "bg-red-100", borderColor: "border-red-300" },
  keep_satisfied: { name: "Keep Satisfied", description: "Hög makt, lågt intresse", color: "bg-yellow-100", borderColor: "border-yellow-300" },
  keep_informed: { name: "Keep Informed", description: "Låg makt, högt intresse", color: "bg-blue-100", borderColor: "border-blue-300" },
  monitor: { name: "Monitor", description: "Låg makt, lågt intresse", color: "bg-gray-100", borderColor: "border-gray-300" },
  unassigned: { name: "Ej placerade", description: "Dra till en ruta", color: "bg-white", borderColor: "border-gray-200" }
};

export function StakeholderAnalysis({ groupCode }: StakeholderAnalysisProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [stakeholders, setStakeholders] = useState<StakeholderData[]>(
    roles.map(role => ({
      roleId: role.id,
      quadrant: "unassigned" as Quadrant,
      strategy: ""
    }))
  );
  const [saved, setSaved] = useState(false);
  const [draggedRole, setDraggedRole] = useState<string | null>(null);
  const [dragOverQuadrant, setDragOverQuadrant] = useState<Quadrant | null>(null);

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`stakeholders-v2-${groupCode}`);
    if (savedData) {
      setStakeholders(JSON.parse(savedData));
    }
  }, [groupCode]);

  const handleSave = () => {
    localStorage.setItem(`stakeholders-v2-${groupCode}`, JSON.stringify(stakeholders));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDragStart = (e: DragEvent, roleId: string) => {
    setDraggedRole(roleId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent, quadrant: Quadrant) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverQuadrant(quadrant);
  };

  const handleDragLeave = () => {
    setDragOverQuadrant(null);
  };

  const handleDrop = (e: DragEvent, quadrant: Quadrant) => {
    e.preventDefault();
    if (draggedRole) {
      setStakeholders(prev =>
        prev.map(s => s.roleId === draggedRole ? { ...s, quadrant } : s)
      );
      setSaved(false);
    }
    setDraggedRole(null);
    setDragOverQuadrant(null);
  };

  const handleDragEnd = () => {
    setDraggedRole(null);
    setDragOverQuadrant(null);
  };

  const updateStrategy = (roleId: string, strategy: string) => {
    setStakeholders(prev =>
      prev.map(s => s.roleId === roleId ? { ...s, strategy } : s)
    );
    setSaved(false);
  };

  const handleExportImage = async () => {
    try {
      const blob = await exportAsImage("stakeholder-content", `intressentanalys-${groupCode}.png`);
      downloadBlob(blob, `intressentanalys-${groupCode}.png`);
    } catch (error) {
      console.error("Export error:", error);
      const content = stakeholders.map(s => {
        const role = roles.find(r => r.id === s.roleId);
        return `${role?.name} (${role?.title}): ${quadrantInfo[s.quadrant].name}, Strategy: ${s.strategy || "Ej angiven"}`;
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

  const getStakeholdersInQuadrant = (quadrant: Quadrant) => {
    return stakeholders.filter(s => s.quadrant === quadrant);
  };

  const renderStakeholderChip = (stakeholder: StakeholderData, showStrategy = false) => {
    const role = roles.find(r => r.id === stakeholder.roleId);
    if (!role) return null;

    return (
      <div
        key={stakeholder.roleId}
        draggable
        onDragStart={(e) => handleDragStart(e, stakeholder.roleId)}
        onDragEnd={handleDragEnd}
        className={`flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border cursor-move hover:shadow-md transition-shadow ${
          draggedRole === stakeholder.roleId ? "opacity-50" : ""
        }`}
      >
        <span className="text-lg">{role.avatar}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{role.name}</div>
          <div className="text-xs text-gray-500 truncate">{role.title}</div>
          {showStrategy && stakeholder.strategy && (
            <div className="text-xs text-gray-600 mt-1 italic truncate">{stakeholder.strategy}</div>
          )}
        </div>
      </div>
    );
  };

  const renderQuadrant = (quadrant: Quadrant) => {
    const info = quadrantInfo[quadrant];
    const stakeholdersInQuadrant = getStakeholdersInQuadrant(quadrant);
    const isOver = dragOverQuadrant === quadrant;

    return (
      <div
        onDragOver={(e) => handleDragOver(e, quadrant)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, quadrant)}
        className={`p-3 rounded-lg border-2 min-h-[140px] transition-all ${info.color} ${info.borderColor} ${
          isOver ? "ring-2 ring-yellow-500 border-yellow-500" : ""
        }`}
      >
        <div className="font-medium text-sm mb-1">{info.name}</div>
        <div className="text-xs text-gray-600 mb-3">{info.description}</div>
        <div className="space-y-2">
          {stakeholdersInQuadrant.map(s => renderStakeholderChip(s, true))}
          {stakeholdersInQuadrant.length === 0 && (
            <div className="text-xs text-gray-400 italic text-center py-4">
              Dra intressenter hit
            </div>
          )}
        </div>
      </div>
    );
  };

  const unassignedStakeholders = getStakeholdersInQuadrant("unassigned");

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
          Dra intressenterna till rätt ruta baserat på deras makt och intresse.
        </p>
      </div>

      <div id="stakeholder-content" className="flex-1 overflow-y-auto p-4" ref={contentRef}>
        {/* Unassigned stakeholders */}
        {unassignedStakeholders.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-gray-700">Intressenter att placera:</h4>
            <div
              onDragOver={(e) => handleDragOver(e, "unassigned")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "unassigned")}
              className={`p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${
                dragOverQuadrant === "unassigned" ? "ring-2 ring-yellow-500 border-yellow-500" : ""
              }`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {unassignedStakeholders.map(s => renderStakeholderChip(s))}
              </div>
            </div>
          </div>
        )}

        {/* Power/Interest Matrix */}
        <div className="mb-6">
          <h4 className="font-medium mb-3 text-center">Power/Interest-matris</h4>
          <div className="grid grid-cols-2 gap-3">
            {/* Row labels */}
            <div className="col-span-2 flex justify-center gap-4 text-xs text-gray-500 mb-1">
              <span>← Lågt intresse</span>
              <span>Högt intresse →</span>
            </div>

            {/* High power row */}
            <div className="text-xs text-gray-500 text-right pr-2 self-center -mr-2 writing-mode-vertical hidden sm:block">
              Hög makt ↑
            </div>
            {renderQuadrant("keep_satisfied")}
            {renderQuadrant("manage_closely")}

            {/* Low power row */}
            <div className="text-xs text-gray-500 text-right pr-2 self-center -mr-2 writing-mode-vertical hidden sm:block">
              Låg makt ↓
            </div>
            {renderQuadrant("monitor")}
            {renderQuadrant("keep_informed")}
          </div>
        </div>

        {/* Strategy input for placed stakeholders */}
        {stakeholders.filter(s => s.quadrant !== "unassigned").length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Hanteringsstrategier</h4>
            <div className="space-y-3">
              {stakeholders
                .filter(s => s.quadrant !== "unassigned")
                .map(stakeholder => {
                  const role = roles.find(r => r.id === stakeholder.roleId);
                  if (!role) return null;
                  return (
                    <div key={stakeholder.roleId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg">{role.avatar}</span>
                      <div className="flex-shrink-0 w-32">
                        <div className="font-medium text-sm">{role.name}</div>
                        <div className="text-xs text-gray-500">{quadrantInfo[stakeholder.quadrant].name}</div>
                      </div>
                      <input
                        type="text"
                        value={stakeholder.strategy}
                        onChange={(e) => updateStrategy(stakeholder.roleId, e.target.value)}
                        placeholder="Hur ska denna intressent hanteras?"
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none text-sm"
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
