"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "52px";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Ett fel uppstod. Försök igen." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split("\n")
      .map((line, i) => {
        // Handle blockquotes
        if (line.startsWith(">")) {
          return `<blockquote key="${i}">${line.slice(1).trim()}</blockquote>`;
        }
        // Handle bold
        line = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        // Handle italic
        line = line.replace(/\*(.+?)\*/g, "<em>$1</em>");
        return line ? `<p key="${i}">${line}</p>` : "<br/>";
      })
      .join("");
  };

  return (
    <div className="container">
      <header>
        <h1>Bright Light Solutions AB</h1>
        <p>Kvalitetssimulering - Konsultuppdrag</p>
      </header>

      <div className="chat-container" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="welcome">
            <h2>Välkommen till simuleringen!</h2>
            <p>
              Ni har blivit anlitade som konsulter för att utreda ett kvalitetsproblem
              hos Bright Light Solutions AB, ett svenskt LED-belysningsföretag.
            </p>
            <p>
              Er uppgift är att intervjua medarbetare, samla information och
              identifiera grundorsakerna till de ökade reklamationerna.
            </p>

            <div className="hint">
              Skriv <strong>"starta"</strong> för att påbörja simuleringen och möta VD Maria Ek.
            </div>

            <div className="role-list">
              <div className="role-item"><strong>Maria Ek</strong> - VD</div>
              <div className="role-item"><strong>Karin Lindström</strong> - Kvalitetschef</div>
              <div className="role-item"><strong>Thomas Gren</strong> - Inköpschef</div>
              <div className="role-item"><strong>Mikael Dahl</strong> - Produktionschef</div>
              <div className="role-item"><strong>Anna Berg</strong> - Ekonomichef</div>
              <div className="role-item"><strong>Peter Ström</strong> - HR-chef</div>
              <div className="role-item"><strong>Lisa Nordin</strong> - Key Account Manager</div>
              <div className="role-item"><strong>Jonas Holm</strong> - Produktutvecklingschef</div>
              <div className="role-item"><strong>Oscar Falk</strong> - Marknadschef</div>
              <div className="role-item"><strong>Sara Engström</strong> - Kundtjänstchef</div>
              <div className="role-item"><strong>Kenneth Johansson</strong> - Lödoperatör (dag)</div>
              <div className="role-item"><strong>Emma Lindqvist</strong> - Testoperatör (kväll)</div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div
                className="message-content"
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              />
            </div>
          ))
        )}

        {isLoading && (
          <div className="message assistant">
            <div className="loading">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        )}
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv ditt meddelande..."
            disabled={isLoading}
            rows={1}
          />
          <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            Skicka
          </button>
        </div>
      </div>
    </div>
  );
}
