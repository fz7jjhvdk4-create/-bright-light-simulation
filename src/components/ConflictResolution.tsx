"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, AlertTriangle, CheckCircle, MessageCircle } from "lucide-react";

interface Conflict {
  id: string;
  title: string;
  description: string;
  parties: string[];
  type: "interpersonal" | "resource" | "priority" | "change";
  status: "active" | "resolved";
  resolution?: string;
}

interface ConflictResolutionProps {
  groupCode: string;
  onResolved?: (conflictId: string, style: string) => void;
}

const CONFLICT_STYLES = [
  {
    id: "competing",
    name: "Tävlande",
    description: "Fokusera på att vinna. Använd din position för att driva igenom ditt mål.",
    pros: "Snabbt beslut, tydlig riktning",
    cons: "Skadar relationer, motparten kan sabotera"
  },
  {
    id: "collaborating",
    name: "Samarbetande",
    description: "Arbeta tillsammans för att hitta en lösning som tillfredsställer alla.",
    pros: "Bästa lösningen, stärker relationer",
    cons: "Tidskrävande, kräver engagemang från alla"
  },
  {
    id: "compromising",
    name: "Kompromissande",
    description: "Hitta en medelväg där alla får ge och ta.",
    pros: "Snabb lösning, alla får något",
    cons: "Ingen blir helt nöjd, kan bli suboptimal lösning"
  },
  {
    id: "avoiding",
    name: "Undvikande",
    description: "Skjut upp konflikten eller håll dig undan.",
    pros: "Ger tid att tänka, fungerar om frågan är trivial",
    cons: "Problemet försvinner inte, kan eskalera"
  },
  {
    id: "accommodating",
    name: "Tillmötesgående",
    description: "Ge efter för den andra partens önskemål.",
    pros: "Bevarar relationen, visar flexibilitet",
    cons: "Kan uppfattas som svag, dina mål uppnås inte"
  }
];

const DEFAULT_CONFLICTS: Conflict[] = [
  {
    id: "thomas_vendor",
    title: "Leverantörsbyte med Thomas",
    description: "Thomas Gren motsätter sig leverantörsbytet från AsiaCore. Han har personliga relationer med deras säljare och oroar sig för produktionsstörningar.",
    parties: ["Du (Projektledare)", "Thomas Gren (Inköpschef)"],
    type: "change",
    status: "active"
  },
  {
    id: "resource_production",
    title: "Resurskonflikt med produktion",
    description: "Mikael Ström vägrar släppa Kenneth Johansson för utbildning eftersom produktionen redan är pressad. Utbildningen är kritisk för implementeringen.",
    parties: ["Du (Projektledare)", "Mikael Ström (Produktionschef)"],
    type: "resource",
    status: "active"
  },
  {
    id: "evening_shift",
    title: "Kvällsskiftets motstånd",
    description: "Emma Lindqvist och kvällsskiftet känner sig överkörda av förändringar som införts utan deras input. De hotar med att kontakta facket.",
    parties: ["Du (Projektledare)", "Emma Lindqvist (Kvällsskiftet)", "Linda Bergqvist (Facket)"],
    type: "change",
    status: "active"
  }
];

export function ConflictResolution({ groupCode, onResolved }: ConflictResolutionProps) {
  const [conflicts, setConflicts] = useState<Conflict[]>(DEFAULT_CONFLICTS);
  const [activeConflict, setActiveConflict] = useState<Conflict | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");

  const handleResolve = () => {
    if (!activeConflict || !selectedStyle || !resolution) return;

    setConflicts(prev => prev.map(c =>
      c.id === activeConflict.id
        ? { ...c, status: "resolved" as const, resolution }
        : c
    ));

    onResolved?.(activeConflict.id, selectedStyle);

    setActiveConflict(null);
    setSelectedStyle(null);
    setResolution("");
  };

  const getTypeLabel = (type: Conflict["type"]) => {
    switch (type) {
      case "interpersonal": return "Personlig konflikt";
      case "resource": return "Resurskonflikt";
      case "priority": return "Prioritetskonflikt";
      case "change": return "Förändringsmotstånd";
    }
  };

  const getTypeColor = (type: Conflict["type"]) => {
    switch (type) {
      case "interpersonal": return "bg-purple-100 text-purple-800";
      case "resource": return "bg-blue-100 text-blue-800";
      case "priority": return "bg-orange-100 text-orange-800";
      case "change": return "bg-red-100 text-red-800";
    }
  };

  const activeConflicts = conflicts.filter(c => c.status === "active");
  const resolvedConflicts = conflicts.filter(c => c.status === "resolved");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Konflikthantering</h2>
        <p className="text-gray-600">
          Under implementeringen uppstår konflikter. Välj rätt hanteringsstil för att lösa dem.
        </p>
      </div>

      {/* Conflict styles overview */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Thomas-Kilmanns konflikthanteringsstilar</h3>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {CONFLICT_STYLES.map(style => (
            <div key={style.id} className="p-2 bg-white rounded">
              <div className="font-medium">{style.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active conflicts */}
      <div className="mb-8">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Aktiva konflikter ({activeConflicts.length})
        </h3>
        {activeConflicts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Inga aktiva konflikter just nu.</p>
        ) : (
          <div className="space-y-3">
            {activeConflicts.map(conflict => (
              <div key={conflict.id} className="border rounded-lg p-4 bg-white hover:border-orange-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(conflict.type)}`}>
                        {getTypeLabel(conflict.type)}
                      </span>
                    </div>
                    <h4 className="font-medium">{conflict.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{conflict.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      {conflict.parties.join(" vs ")}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setActiveConflict(conflict)}
                    className="ml-4"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Hantera
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved conflicts */}
      {resolvedConflicts.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Lösta konflikter ({resolvedConflicts.length})
          </h3>
          <div className="space-y-3">
            {resolvedConflicts.map(conflict => (
              <div key={conflict.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(conflict.type)}`}>
                    {getTypeLabel(conflict.type)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">
                    Löst
                  </span>
                </div>
                <h4 className="font-medium">{conflict.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{conflict.resolution}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolution modal */}
      {activeConflict && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b bg-orange-50">
              <h3 className="font-semibold text-lg">{activeConflict.title}</h3>
              <p className="text-sm text-gray-600">{activeConflict.description}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                {activeConflict.parties.join(" vs ")}
              </div>
            </div>

            <div className="p-4">
              <h4 className="font-medium mb-3">Välj hanteringsstil:</h4>
              <div className="space-y-2 mb-4">
                {CONFLICT_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`w-full text-left p-3 border rounded-lg transition-colors ${
                      selectedStyle === style.id
                        ? "border-orange-500 bg-orange-50"
                        : "hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{style.name}</div>
                    <div className="text-sm text-gray-600">{style.description}</div>
                    <div className="flex gap-4 mt-1 text-xs">
                      <span className="text-green-600">+ {style.pros}</span>
                      <span className="text-red-600">- {style.cons}</span>
                    </div>
                  </button>
                ))}
              </div>

              {selectedStyle && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beskriv hur du löser konflikten:
                  </label>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Beskriv din approach och vad du säger till parterna..."
                    className="w-full h-24 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setActiveConflict(null);
                setSelectedStyle(null);
                setResolution("");
              }}>
                Avbryt
              </Button>
              <Button
                onClick={handleResolve}
                disabled={!selectedStyle || !resolution}
                className="bg-green-600 hover:bg-green-700"
              >
                Lös konflikten
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
