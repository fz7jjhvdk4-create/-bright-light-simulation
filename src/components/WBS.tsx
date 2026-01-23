"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save, Download, ChevronDown, ChevronRight, Image as ImageIcon } from "lucide-react";
import { exportAsImage, downloadBlob } from "@/lib/export-utils";

interface WBSItem {
  id: string;
  name: string;
  duration: string;
  children: WBSItem[];
  expanded: boolean;
}

interface WBSProps {
  groupCode: string;
}

const defaultWBS: WBSItem[] = [
  {
    id: "1",
    name: "Kvalitetsförbättringsprojekt",
    duration: "6 månader",
    expanded: true,
    children: [
      {
        id: "1.1",
        name: "Fas 1: Utredning",
        duration: "2 månader",
        expanded: true,
        children: [
          { id: "1.1.1", name: "Projektplanering", duration: "1 vecka", expanded: false, children: [] },
          { id: "1.1.2", name: "Datainsamling", duration: "2 veckor", expanded: false, children: [] },
          { id: "1.1.3", name: "Intervjuer", duration: "3 veckor", expanded: false, children: [] },
          { id: "1.1.4", name: "Rotorsaksanalys", duration: "2 veckor", expanded: false, children: [] },
          { id: "1.1.5", name: "Åtgärdsförslag", duration: "1 vecka", expanded: false, children: [] }
        ]
      },
      {
        id: "1.2",
        name: "Fas 2: Implementering",
        duration: "4 månader",
        expanded: true,
        children: [
          { id: "1.2.1", name: "Leverantörsåtgärder", duration: "2 månader", expanded: false, children: [] },
          { id: "1.2.2", name: "Utbildningsinsatser", duration: "1 månad", expanded: false, children: [] },
          { id: "1.2.3", name: "Processförbättringar", duration: "2 månader", expanded: false, children: [] },
          { id: "1.2.4", name: "Uppföljning och mätning", duration: "Löpande", expanded: false, children: [] }
        ]
      }
    ]
  }
];

export function WBS({ groupCode }: WBSProps) {
  const [wbs, setWbs] = useState<WBSItem[]>(defaultWBS);
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDuration, setEditDuration] = useState("");

  useEffect(() => {
    const savedData = localStorage.getItem(`wbs-${groupCode}`);
    if (savedData) {
      setWbs(JSON.parse(savedData));
    }
  }, [groupCode]);

  const handleSave = () => {
    localStorage.setItem(`wbs-${groupCode}`, JSON.stringify(wbs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleExpand = (id: string) => {
    const updateExpand = (items: WBSItem[]): WBSItem[] => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, expanded: !item.expanded };
        }
        return { ...item, children: updateExpand(item.children) };
      });
    };
    setWbs(updateExpand(wbs));
  };

  const startEdit = (item: WBSItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDuration(item.duration);
  };

  const saveEdit = () => {
    const updateItem = (items: WBSItem[]): WBSItem[] => {
      return items.map(item => {
        if (item.id === editingId) {
          return { ...item, name: editName, duration: editDuration };
        }
        return { ...item, children: updateItem(item.children) };
      });
    };
    setWbs(updateItem(wbs));
    setEditingId(null);
    setSaved(false);
  };

  const addChild = (parentId: string) => {
    const addChildToParent = (items: WBSItem[]): WBSItem[] => {
      return items.map(item => {
        if (item.id === parentId) {
          const newId = `${item.id}.${item.children.length + 1}`;
          return {
            ...item,
            expanded: true,
            children: [
              ...item.children,
              { id: newId, name: "Ny aktivitet", duration: "1 vecka", expanded: false, children: [] }
            ]
          };
        }
        return { ...item, children: addChildToParent(item.children) };
      });
    };
    setWbs(addChildToParent(wbs));
    setSaved(false);
  };

  const deleteItem = (id: string) => {
    const removeItem = (items: WBSItem[]): WBSItem[] => {
      return items
        .filter(item => item.id !== id)
        .map(item => ({ ...item, children: removeItem(item.children) }));
    };
    setWbs(removeItem(wbs));
    setSaved(false);
  };

  const exportAsText = () => {
    const generateText = (items: WBSItem[], level: number = 0): string => {
      return items.map(item => {
        const indent = "  ".repeat(level);
        let text = `${indent}${item.id} ${item.name} (${item.duration})\n`;
        if (item.children.length > 0) {
          text += generateText(item.children, level + 1);
        }
        return text;
      }).join("");
    };

    const content = "WORK BREAKDOWN STRUCTURE\n" + "=".repeat(50) + "\n\n" + generateText(wbs);
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wbs-${groupCode}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportImage = async () => {
    try {
      const blob = await exportAsImage("wbs-content", `wbs-${groupCode}.png`);
      downloadBlob(blob, `wbs-${groupCode}.png`);
    } catch (error) {
      console.error("Export error:", error);
      // Fallback to text export
      exportAsText();
    }
  };

  const renderItem = (item: WBSItem, level: number = 0) => {
    const hasChildren = item.children.length > 0;
    const paddingLeft = level * 24;

    return (
      <div key={item.id}>
        <div
          className={`flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg group ${
            level === 0 ? "bg-yellow-50 border border-yellow-200" : ""
          }`}
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(item.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {item.expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {editingId === item.id ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 px-2 py-1 border rounded text-sm"
                autoFocus
              />
              <input
                type="text"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                placeholder="Duration"
                className="w-24 px-2 py-1 border rounded text-sm"
              />
              <Button size="sm" onClick={saveEdit}>OK</Button>
              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Avbryt</Button>
            </div>
          ) : (
            <>
              <span className="text-sm text-gray-500 font-mono">{item.id}</span>
              <span
                className="flex-1 cursor-pointer hover:text-yellow-600"
                onClick={() => startEdit(item)}
              >
                {item.name}
              </span>
              <span className="text-sm text-gray-500">{item.duration}</span>
              <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                <button
                  onClick={() => addChild(item.id)}
                  className="p-1 hover:bg-gray-200 rounded text-gray-500"
                  title="Lägg till underaktivitet"
                >
                  <Plus className="w-4 h-4" />
                </button>
                {level > 0 && (
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-1 hover:bg-red-100 rounded text-gray-500 hover:text-red-500"
                    title="Ta bort"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        {item.expanded && item.children.length > 0 && (
          <div>
            {item.children.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Work Breakdown Structure</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExportImage}>
              <ImageIcon className="w-4 h-4 mr-1" />
              PNG
            </Button>
            <Button size="sm" variant="outline" onClick={exportAsText}>
              <Download className="w-4 h-4 mr-1" />
              Text
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              {saved ? "Sparat!" : "Spara"}
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Strukturera projektet i faser och aktiviteter. Klicka på text för att redigera.
        </p>
      </div>

      <div id="wbs-content" className="flex-1 overflow-y-auto p-4 bg-white">
        <div className="space-y-1">
          {wbs.map(item => renderItem(item))}
        </div>
      </div>
    </div>
  );
}
