"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, ArrowRight } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface IntroMeetingProps {
  groupName: string;
  onComplete: () => void;
}

const MARIA_INTRO_PROMPT = `Du är Maria Ek, VD för Bright Light Solutions AB. Du har ett inledande möte med projektteamet som ska utreda era kvalitetsproblem.

VIKTIGT:
- Beskriv PROBLEMET (ökade reklamationer) men INTE orsakerna - det ska de utreda
- Var tydlig med att detta är ett UTREDNINGSPROJEKT först, sedan implementering
- Ge dem budget (800 000 SEK) och tidsram (6 månader för utredning, sedan 6 månader implementering)
- Introducera styrgruppen (du, Anna Berg ekonomichef, Henrik Wallin från styrelsen)
- Betona att de måste börja med att PLANERA projektet innan de börjar intervjua folk
- Du vet INTE vad som orsakar problemen - det är deras jobb att ta reda på

BAKGRUND du kan dela:
- Reklamationerna har ökat från 412 till 847 på två år
- Kostnaderna har gått från 2,1 till 4,8 MSEK
- Styrelsen är orolig och kräver resultat
- Det finns olika teorier internt men ingen vet säkert vad som är fel

PERSONLIGHET: Resultatinriktad, rak, lite stressad. Styrelsen andas dig i nacken.

Svara ALLTID på svenska och håll svaren korta och koncisa (max 3-4 meningar per svar).`;

export function IntroMeeting({ groupName, onComplete }: IntroMeetingProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Välkomna till Bright Light Solutions! Jag är Maria Ek, VD. Ni är här för att vi har ett allvarligt problem - våra reklamationer har fördubblats på två år. Kostnaderna äter upp vår vinst och styrelsen kräver åtgärder. Jag behöver er hjälp att först UTREDA vad som är fel, och sedan fixa det. Har ni några frågor innan vi sätter igång?`
    }
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    setQuestionCount(prev => prev + 1);

    try {
      const response = await fetch("/api/intro-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: MARIA_INTRO_PROMPT,
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();
      if (data.response) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Ursäkta, jag tappade tråden. Kan du upprepa?" },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b px-6 py-4 bg-yellow-50">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👩‍💼</span>
          <div>
            <h2 className="font-bold text-lg">Uppdragsmöte med Maria Ek</h2>
            <p className="text-sm text-gray-600">VD, Bright Light Solutions AB</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
        <p className="text-sm text-blue-800">
          <strong>Fas 1: Uppdragsmöte</strong> - Lyssna på Maria och ställ frågor för att förstå uppdraget.
          När ni känner er redo, klicka på &quot;Gå vidare till projektplanering&quot;.
        </p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === "user"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.role === "assistant" && (
                <p className="text-xs text-gray-500 mb-1 font-medium">Maria Ek</p>
              )}
              {message.content}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3 text-gray-500">
              <span className="animate-pulse">Maria skriver...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ställ en fråga till Maria..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
            disabled={isSending}
          />
          <Button onClick={handleSend} disabled={isSending || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Continue button - show after at least 1 question or initial message read */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {questionCount} frågor ställda
          </span>
          <Button
            onClick={onComplete}
            className="bg-green-600 hover:bg-green-700"
          >
            Gå vidare till projektplanering
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
