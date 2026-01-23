"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, X, MessageCircle } from "lucide-react";

interface Event {
  id: string;
  week: number;
  title: string;
  description: string;
  type: "conflict" | "crisis" | "milestone";
  choices: {
    id: string;
    label: string;
    consequence: string;
    impact: number; // -1 to 1, negative is bad
  }[];
  resolved: boolean;
  chosenOption?: string;
}

interface Phase2EventsProps {
  groupCode: string;
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

const defaultEvents: Event[] = [
  {
    id: "thomas_conflict",
    week: 2,
    title: "Thomas blockerar leverantörsbyte",
    description: "Thomas Gren har motsatt sig leverantörsbytet och argumenterar för att det kommer skada relationen med AsiaCore. Han har eskalerat frågan till styrelsen.",
    type: "conflict",
    choices: [
      {
        id: "confront",
        label: "Konfrontera med data",
        consequence: "Du presenterar hårda fakta om AsiaCore:s kvalitetsproblem. Thomas backar motvilligt men relationen blir ansträngd.",
        impact: 0.5,
      },
      {
        id: "compromise",
        label: "Kompromissa",
        consequence: "Ni enas om att behålla AsiaCore för mindre kritiska produkter. Besparingen blir mindre men Thomas är med på banan.",
        impact: 0.3,
      },
      {
        id: "escalate",
        label: "Eskalera till VD",
        consequence: "Maria tar ert parti men Thomas känner sig överkört. Han samarbetar men saboterar subtilt implementeringen.",
        impact: 0.2,
      },
    ],
    resolved: false,
  },
  {
    id: "evening_crisis",
    week: 4,
    title: "Kvällsskiftet hotar med sjukskrivning",
    description: "Flera anställda på kvällsskiftet har samlat sig och hotar med massjukskrivning om inte arbetsmiljön förbättras omedelbart. Linda Bergqvist (facket) kräver ett möte.",
    type: "crisis",
    choices: [
      {
        id: "immediate",
        label: "Omedelbar åtgärd",
        consequence: "Ni pausar produktionen och genomför ett krismöte. Kostnaden blir hög men förtroendet återställs.",
        impact: 0.6,
      },
      {
        id: "negotiate",
        label: "Förhandla med facket",
        consequence: "Ni tar fram en snabb förbättringsplan tillsammans med facket. Det tar tid men ger långsiktigt stöd.",
        impact: 0.4,
      },
      {
        id: "dismiss",
        label: "Avfärda som överdrivet",
        consequence: "Sjukskrivningarna genomförs. Produktionen stannar i en vecka och ryktet sprids.",
        impact: -0.5,
      },
    ],
    resolved: false,
  },
  {
    id: "first_results",
    week: 8,
    title: "Första positiva resultat syns",
    description: "Efter 8 veckor visar mätningarna att reklamationerna har minskat med 15%. Styrelsen vill ha en statusrapport.",
    type: "milestone",
    choices: [
      {
        id: "cautious",
        label: "Försiktig rapportering",
        consequence: "Ni presenterar resultaten med reservation för att det är tidigt. Styrelsen är nöjd men vill se mer.",
        impact: 0.3,
      },
      {
        id: "optimistic",
        label: "Optimistisk framställning",
        consequence: "Ni framhäver framgångarna och får beröm. Men förväntningarna höjs för nästa rapport.",
        impact: 0.4,
      },
      {
        id: "detailed",
        label: "Detaljerad analys",
        consequence: "Ni presenterar en djupgående analys som imponerar. Det tar tid men bygger förtroende.",
        impact: 0.5,
      },
    ],
    resolved: false,
  },
];

export function Phase2Events({ groupCode, currentWeek, onWeekChange }: Phase2EventsProps) {
  const [events, setEvents] = useState<Event[]>(defaultEvents);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem(`events-${groupCode}`);
    if (savedData) {
      setEvents(JSON.parse(savedData));
    }
  }, [groupCode]);

  useEffect(() => {
    // Check for new events when week changes
    const unresolvedEvent = events.find(
      e => e.week <= currentWeek && !e.resolved
    );
    if (unresolvedEvent && !showModal) {
      setActiveEvent(unresolvedEvent);
      setShowModal(true);
    }
  }, [currentWeek, events, showModal]);

  const handleChoice = (eventId: string, choiceId: string) => {
    setEvents(prev => {
      const updated = prev.map(e =>
        e.id === eventId ? { ...e, resolved: true, chosenOption: choiceId } : e
      );
      localStorage.setItem(`events-${groupCode}`, JSON.stringify(updated));
      return updated;
    });
    setShowModal(false);
    setActiveEvent(null);
  };

  const getEventTypeIcon = (type: Event["type"]) => {
    switch (type) {
      case "conflict": return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case "crisis": return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case "milestone": return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
  };

  const getEventTypeColor = (type: Event["type"]) => {
    switch (type) {
      case "conflict": return "border-orange-300 bg-orange-50";
      case "crisis": return "border-red-300 bg-red-50";
      case "milestone": return "border-green-300 bg-green-50";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Händelser & Konflikter</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Aktuell vecka:</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onWeekChange(Math.max(1, currentWeek - 1))}
                disabled={currentWeek <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center font-medium">{currentWeek}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onWeekChange(Math.min(24, currentWeek + 1))}
                disabled={currentWeek >= 24}
              >
                +
              </Button>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Hantera händelser som uppstår under implementeringen. Ändra vecka för att trigga nya händelser.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          {events.map((event) => {
            const isPast = event.week <= currentWeek;
            const choice = event.choices.find(c => c.id === event.chosenOption);

            return (
              <div
                key={event.id}
                className={`relative pl-12 pb-8 ${!isPast ? "opacity-50" : ""}`}
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-2 w-5 h-5 rounded-full border-2 ${
                    event.resolved
                      ? "bg-green-500 border-green-500"
                      : isPast
                      ? "bg-yellow-500 border-yellow-500 animate-pulse"
                      : "bg-white border-gray-300"
                  }`}
                />

                {/* Event card */}
                <div className={`border rounded-lg p-4 ${getEventTypeColor(event.type)}`}>
                  <div className="flex items-start gap-3">
                    {getEventTypeIcon(event.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">Vecka {event.week}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          event.type === "conflict"
                            ? "bg-orange-200 text-orange-800"
                            : event.type === "crisis"
                            ? "bg-red-200 text-red-800"
                            : "bg-green-200 text-green-800"
                        }`}>
                          {event.type === "conflict" ? "Konflikt" : event.type === "crisis" ? "Kris" : "Milstolpe"}
                        </span>
                      </div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>

                      {event.resolved && choice && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <div className="text-sm font-medium text-gray-700">
                            Valt: {choice.label}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {choice.consequence}
                          </div>
                        </div>
                      )}

                      {isPast && !event.resolved && (
                        <Button
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            setActiveEvent(event);
                            setShowModal(true);
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Hantera
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event modal */}
      {showModal && activeEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className={`p-4 border-b ${getEventTypeColor(activeEvent.type)} rounded-t-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getEventTypeIcon(activeEvent.type)}
                  <div>
                    <div className="text-xs text-gray-500">Vecka {activeEvent.week}</div>
                    <h3 className="font-semibold">{activeEvent.title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/50 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <p className="text-gray-700 mb-4">{activeEvent.description}</p>

              <div className="space-y-3">
                <h4 className="font-medium">Hur vill ni hantera situationen?</h4>
                {activeEvent.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(activeEvent.id, choice.id)}
                    className="w-full text-left p-4 border rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
                  >
                    <div className="font-medium">{choice.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
