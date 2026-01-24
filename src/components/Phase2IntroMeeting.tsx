"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, ArrowRight, CheckCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Proposal {
  id: number;
  rootCauseId: string;
  description: string;
  responsible: string | null;
  cost: number | null;
}

interface Phase2IntroMeetingProps {
  groupName: string;
  proposals: Proposal[];
  onComplete: () => void;
}

export function Phase2IntroMeeting({ groupName, proposals, onComplete }: Phase2IntroMeetingProps) {
  const proposalSummary = proposals.map(p => `- ${p.description} (${p.cost?.toLocaleString() || 'okänd'} SEK)`).join('\n');

  const MARIA_PHASE2_PROMPT = `Du är Maria Ek, VD för Bright Light Solutions AB. Du har ett uppföljningsmöte med projektteamet som nu ska implementera sina åtgärdsförslag.

KONTEXT:
Teamet har genomfört en utredning i Fas 1 och identifierat följande åtgärdsförslag:
${proposalSummary}

DITT UPPDRAG I DETTA MÖTE:
- Gratulera dem till en bra utredning
- Bekräfta att styrgruppen (du, Anna Berg, Henrik Wallin) har godkänt åtgärdsförslagen
- Förklara att de nu har 9 månader och resterande budget att genomföra implementeringen
- Betona vikten av:
  * Detaljerad planering (WBS, tidplan, resurser)
  * Regelbunden rapportering till styrgruppen
  * Riskhantering och förändringsledning
  * Att involvera Kenneth Johansson som förändringsledare på golvet

PERSONLIGHET: Resultatinriktad men nu mer positiv och hoppfull. Du ser framåt.

Svara ALLTID på svenska och håll svaren korta och koncisa (max 3-4 meningar per svar).`;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Fantastiskt jobbat med utredningen! Styrgruppen har granskat era fynd och vi är imponerade. Era ${proposals.length} åtgärdsförslag är godkända och vi ger er grönt ljus att gå vidare med implementeringen. Ni har 9 månader på er och resterande budget. Hur tänker ni lägga upp arbetet?`
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
          systemPrompt: MARIA_PHASE2_PROMPT,
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
      <div className="border-b px-6 py-4 bg-green-50">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👩‍💼</span>
          <div>
            <h2 className="font-bold text-lg">Uppstartsmöte Fas 2 med Maria Ek</h2>
            <p className="text-sm text-gray-600">VD, Bright Light Solutions AB</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            Utredning godkänd
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
        <p className="text-sm text-blue-800">
          <strong>Fas 2: Implementering</strong> - Era åtgärdsförslag är godkända!
          Diskutera implementeringsstrategin med Maria innan ni börjar planera.
        </p>
      </div>

      {/* Approved proposals summary */}
      <div className="bg-gray-50 border-b px-6 py-3">
        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Godkända åtgärder</p>
        <div className="flex flex-wrap gap-2">
          {proposals.map((p, idx) => (
            <span key={p.id} className="px-2 py-1 bg-white border rounded text-xs">
              {idx + 1}. {p.description.substring(0, 40)}...
            </span>
          ))}
        </div>
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
                  ? "bg-green-500 text-white"
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
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            disabled={isSending}
          />
          <Button onClick={handleSend} disabled={isSending || !input.trim()} className="bg-green-600 hover:bg-green-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {questionCount} frågor ställda
          </span>
          <Button
            onClick={onComplete}
            className="bg-green-600 hover:bg-green-700"
          >
            Gå vidare till implementeringsplanering
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
