"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, Download, Plus, Trash2, Calendar } from "lucide-react";

interface Action {
  id: string;
  name: string;
  responsible: string;
  startWeek: number;
  endWeek: number;
  status: "pending" | "in_progress" | "completed";
  isMilestone: boolean;
}

interface ImplementationPlanProps {
  groupCode: string;
  approvedProposals: Array<{
    id: number;
    rootCauseId: string;
    description: string;
    responsible: string | null;
    cost: number | null;
  }>;
}

const defaultActions: Action[] = [
  {
    id: "1",
    name: "Upphandla ny leverantör (ElektroTech)",
    responsible: "Thomas Gren",
    startWeek: 1,
    endWeek: 8,
    status: "pending",
    isMilestone: false,
  },
  {
    id: "2",
    name: "JUKI-tilläggsutbildning",
    responsible: "Mikael Ström",
    startWeek: 2,
    endWeek: 4,
    status: "pending",
    isMilestone: false,
  },
  {
    id: "3",
    name: "Förbättrad överlämning mellan skift",
    responsible: "Mikael Ström",
    startWeek: 1,
    endWeek: 3,
    status: "pending",
    isMilestone: false,
  },
  {
    id: "4",
    name: "Mentorprogram för kvällsskift",
    responsible: "Peter Holm",
    startWeek: 3,
    endWeek: 12,
    status: "pending",
    isMilestone: false,
  },
  {
    id: "5",
    name: "Milstolpe: Första mätning",
    responsible: "Karin Lindström",
    startWeek: 8,
    endWeek: 8,
    status: "pending",
    isMilestone: true,
  },
  {
    id: "6",
    name: "Utökad inkommande kontroll",
    responsible: "Karin Lindström",
    startWeek: 4,
    endWeek: 6,
    status: "pending",
    isMilestone: false,
  },
];

export function ImplementationPlan({ groupCode, approvedProposals }: ImplementationPlanProps) {
  const [actions, setActions] = useState<Action[]>(defaultActions);
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newAction, setNewAction] = useState({
    name: "",
    responsible: "",
    startWeek: 1,
    endWeek: 4,
    isMilestone: false,
  });

  const totalWeeks = 24; // 6 månader

  useEffect(() => {
    const savedData = localStorage.getItem(`implementation-${groupCode}`);
    if (savedData) {
      setActions(JSON.parse(savedData));
    }
  }, [groupCode]);

  const handleSave = () => {
    localStorage.setItem(`implementation-${groupCode}`, JSON.stringify(actions));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addAction = () => {
    if (!newAction.name.trim()) return;

    const action: Action = {
      id: Date.now().toString(),
      name: newAction.name,
      responsible: newAction.responsible,
      startWeek: newAction.startWeek,
      endWeek: newAction.endWeek,
      status: "pending",
      isMilestone: newAction.isMilestone,
    };
    setActions(prev => [...prev, action]);
    setNewAction({ name: "", responsible: "", startWeek: 1, endWeek: 4, isMilestone: false });
    setShowForm(false);
    setSaved(false);
  };

  const deleteAction = (id: string) => {
    setActions(prev => prev.filter(a => a.id !== id));
    setSaved(false);
  };

  const updateActionStatus = (id: string, status: Action["status"]) => {
    setActions(prev =>
      prev.map(a => (a.id === id ? { ...a, status } : a))
    );
    setSaved(false);
  };

  const exportAsText = () => {
    let content = "IMPLEMENTERINGSPLAN\n" + "=".repeat(50) + "\n\n";
    content += `Projekt: Kvalitetsförbättring Bright Light Solutions\n`;
    content += `Tidsram: 24 veckor (6 månader)\n\n`;
    content += "AKTIVITETER:\n" + "-".repeat(30) + "\n";

    actions.forEach(action => {
      content += `\n${action.isMilestone ? "★ " : ""}${action.name}\n`;
      content += `  Ansvarig: ${action.responsible || "Ej angiven"}\n`;
      content += `  Tid: Vecka ${action.startWeek} - ${action.endWeek}\n`;
      content += `  Status: ${action.status === "completed" ? "Klar" : action.status === "in_progress" ? "Pågående" : "Ej påbörjad"}\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `implementeringsplan-${groupCode}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: Action["status"]) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-yellow-500";
      default: return "bg-blue-500";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Implementeringsplan</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={exportAsText}>
              <Download className="w-4 h-4 mr-1" />
              Exportera
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
          Planera implementeringen av era åtgärder. Dra i staplarna för att justera tid.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Add form */}
        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium mb-3">Ny aktivitet</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aktivitet
                </label>
                <input
                  type="text"
                  value={newAction.name}
                  onChange={(e) => setNewAction(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Beskriv aktiviteten..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ansvarig
                  </label>
                  <input
                    type="text"
                    value={newAction.responsible}
                    onChange={(e) => setNewAction(prev => ({ ...prev, responsible: e.target.value }))}
                    placeholder="Namn"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start (vecka)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={newAction.startWeek}
                    onChange={(e) => setNewAction(prev => ({ ...prev, startWeek: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slut (vecka)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={newAction.endWeek}
                    onChange={(e) => setNewAction(prev => ({ ...prev, endWeek: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isMilestone"
                  checked={newAction.isMilestone}
                  onChange={(e) => setNewAction(prev => ({ ...prev, isMilestone: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isMilestone" className="text-sm">Milstolpe</label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={addAction} disabled={!newAction.name.trim()}>
                  Lägg till
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Avbryt
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline header */}
        <div className="mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <Calendar className="w-4 h-4" />
            <span>Tidslinje: 24 veckor (6 månader)</span>
          </div>
          <div className="flex">
            <div className="w-48 shrink-0" />
            <div className="flex-1 flex">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex-1 text-center text-xs text-gray-500 border-l border-gray-200">
                  Månad {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gantt chart */}
        <div className="space-y-2">
          {actions.map((action) => {
            const startPercent = ((action.startWeek - 1) / totalWeeks) * 100;
            const widthPercent = ((action.endWeek - action.startWeek + 1) / totalWeeks) * 100;

            return (
              <div key={action.id} className="flex items-center group">
                <div className="w-48 shrink-0 pr-4">
                  <div className="flex items-center gap-2">
                    {action.isMilestone && <span className="text-yellow-500">★</span>}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" title={action.name}>
                        {action.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {action.responsible || "Ej angiven"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 h-8 bg-gray-100 rounded relative">
                  <div
                    className={`absolute h-full rounded ${getStatusColor(action.status)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                    style={{
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                    onClick={() => {
                      const nextStatus =
                        action.status === "pending"
                          ? "in_progress"
                          : action.status === "in_progress"
                          ? "completed"
                          : "pending";
                      updateActionStatus(action.id, nextStatus);
                    }}
                    title={`Vecka ${action.startWeek}-${action.endWeek}. Klicka för att ändra status.`}
                  >
                    {action.isMilestone && (
                      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rotate-45 border-2 border-white" />
                    )}
                  </div>
                  {/* Week markers */}
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-l border-gray-200"
                      style={{ left: `${(i * 4 / totalWeeks) * 100}%` }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => deleteAction(action.id)}
                  className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded transition-all"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span>Ej påbörjad</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span>Pågående</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span>Klar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rotate-45" />
            <span>Milstolpe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
