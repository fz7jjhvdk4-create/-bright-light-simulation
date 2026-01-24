"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle, Lightbulb } from "lucide-react";

interface ProjectDefinitionProps {
  groupCode: string;
  onSave?: () => void;
}

interface Definition {
  purpose: string;
  goals: string;
  scope: string;
  exclusions: string;
  success_criteria: string;
}

export function ProjectDefinition({ groupCode, onSave }: ProjectDefinitionProps) {
  const [definition, setDefinition] = useState<Definition>({
    purpose: "",
    goals: "",
    scope: "",
    exclusions: "",
    success_criteria: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTips, setShowTips] = useState<string | null>(null);

  useEffect(() => {
    // Load existing definition
    fetch(`/api/groups/${groupCode}/project-definition`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.definition) {
          setDefinition(data.definition);
        }
      })
      .catch(console.error);
  }, [groupCode]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/groups/${groupCode}/project-definition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(definition),
      });
      const data = await response.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        onSave?.();
      }
    } catch (error) {
      console.error("Error saving definition:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const tips = {
    purpose: "Syftet beskriver VARFÖR projektet behövs. T.ex. 'Utreda orsakerna till de ökade reklamationerna för att möjliggöra riktade åtgärder'",
    goals: "Mål ska vara SMART: Specifika, Mätbara, Accepterade, Realistiska, Tidsbundna. T.ex. 'Identifiera minst 3 rotorsaker till reklamationsökningen inom 3 månader'",
    scope: "Omfattningen definierar vad som INGÅR. T.ex. 'Analys av reklamationer 2023-2024, intervjuer med nyckelroller, granskning av produktionsdata'",
    exclusions: "Avgränsningar definierar vad som INTE ingår. T.ex. 'Implementation av åtgärder (fas 2), extern kundundersökning, analys av konkurrenter'",
    success_criteria: "Framgångskriterier beskriver vad som krävs för att projektet ska anses lyckat. T.ex. 'Dokumenterad rapport med prioriterade rotorsaker och kostnadsberäknade åtgärdsförslag'",
  };

  const fields = [
    { key: "purpose", label: "Syfte", placeholder: "Varför genomförs denna utredning?", rows: 3 },
    { key: "goals", label: "Mål (SMART)", placeholder: "Vad ska uppnås? (Specifikt, Mätbart, Accepterat, Realistiskt, Tidsbundet)", rows: 4 },
    { key: "scope", label: "Omfattning", placeholder: "Vad ingår i utredningen?", rows: 3 },
    { key: "exclusions", label: "Avgränsningar", placeholder: "Vad ingår INTE i utredningen?", rows: 3 },
    { key: "success_criteria", label: "Framgångskriterier", placeholder: "Vad räknas som en lyckad utredning?", rows: 3 },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Projektdefinition</h2>
        <p className="text-gray-600">
          Definiera utredningsprojektets syfte, mål och omfattning. Detta är grunden för ert arbete.
        </p>
      </div>

      <div className="space-y-6">
        {fields.map(({ key, label, placeholder, rows }) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <button
                type="button"
                onClick={() => setShowTips(showTips === key ? null : key)}
                className="text-yellow-600 hover:text-yellow-700 text-sm flex items-center gap-1"
              >
                <Lightbulb className="w-4 h-4" />
                Tips
              </button>
            </div>
            {showTips === key && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                {tips[key as keyof typeof tips]}
              </div>
            )}
            <textarea
              value={definition[key as keyof Definition]}
              onChange={(e) =>
                setDefinition((prev) => ({ ...prev, [key]: e.target.value }))
              }
              placeholder={placeholder}
              rows={rows}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-none"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {saved && (
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Sparat!
            </span>
          )}
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Sparar..." : "Spara projektdefinition"}
        </Button>
      </div>

      {/* Progress indicator */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Ifyllnadsgrad</h3>
        <div className="space-y-2">
          {fields.map(({ key, label }) => {
            const filled = definition[key as keyof Definition]?.trim().length > 0;
            return (
              <div key={key} className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${filled ? "bg-green-500" : "bg-gray-300"}`} />
                <span className={filled ? "text-green-700" : "text-gray-500"}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
