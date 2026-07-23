"use client";

import { useEffect, useRef, useState } from "react";
import { Role } from "@/lib/roles";
import { GroupData } from "./useGroupData";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isError?: boolean; // technical error, rendered distinctly from role replies
}

// Interview chat against /api/chat: role selection, history loading,
// sending messages and collecting offered data/documents.
export function useInterviewChat(
  group: GroupData | null,
  onQuestionCounted: (roleId: string, questionsAsked: number | null) => void
) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Data/document offers from chat
  const [offeredData, setOfferedData] = useState<string[]>([]);
  const [offeredDocuments, setOfferedDocuments] = useState<string[]>([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectRole = async (role: Role) => {
    setSelectedRole(role);
    setMessages([]);
    setOfferedData([]);
    setOfferedDocuments([]);

    // Load chat history for this role
    if (group) {
      try {
        const response = await fetch(`/api/groups/${group.code}/chat-history?roleId=${role.id}`);
        const data = await response.json();
        if (data.success && data.messages.length > 0) {
          setMessages(data.messages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content
          })));
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedRole || isSending) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: group?.code,
          roleId: selectedRole.id,
          message: userMessage.content,
        }),
      });

      const data = await response.json();

      if (response.ok && data.response) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);

        // The server owns the question count — mirror it instead of counting locally
        onQuestionCounted(selectedRole.id, data.questionsAsked ?? null);

        // Handle offered data/documents
        if (data.offeredData) {
          setOfferedData(prev => {
            const combined = [...prev, ...data.offeredData];
            return combined.filter((item, index) => combined.indexOf(item) === index);
          });
        }
        if (data.offeredDocuments) {
          setOfferedDocuments(prev => {
            const combined = [...prev, ...data.offeredDocuments];
            return combined.filter((item, index) => combined.indexOf(item) === index);
          });
        }
      } else {
        setMessages(prev => [
          ...prev,
          { role: "assistant", isError: true, content: data.error || "Ett tekniskt fel uppstod. Försök igen." },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", isError: true, content: "Kunde inte nå servern. Kontrollera anslutningen och försök igen." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return {
    selectedRole,
    messages,
    input,
    setInput,
    isSending,
    chatEndRef,
    offeredData,
    offeredDocuments,
    handleSelectRole,
    handleSendMessage,
    handleKeyDown,
  };
}
