"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { roleCategories, getRoleById, getRolesForPhase, Role } from "@/lib/roles";
import { Send, Users, FileText, ClipboardList, LogOut } from "lucide-react";

interface GroupData {
  id: number;
  code: string;
  name: string;
  studentNames: string;
  phase: number;
  status: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface InterviewData {
  roleId: string;
  questionsAsked: number;
}

export default function SimulationPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Chat state
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Stats
  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [downloadsCount, setDownloadsCount] = useState(0);

  // Active tab
  const [activeTab, setActiveTab] = useState<"interview" | "tools" | "log">("interview");

  useEffect(() => {
    fetchGroupData();
  }, [resolvedParams.code]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchGroupData = async () => {
    try {
      const response = await fetch(`/api/groups/${resolvedParams.code}`);
      const data = await response.json();

      if (data.success) {
        setGroup(data.group);
        setInterviews(data.interviews || []);
        setDownloadsCount(data.downloads?.length || 0);
      } else {
        setError("Gruppen hittades inte");
      }
    } catch {
      setError("Kunde inte ladda gruppdata");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setMessages([]);
    // Load chat history for this role if exists
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedRole || isSending) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group?.id,
          roleId: selectedRole.id,
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
        { role: "assistant", content: "Ett fel uppstod. Försök igen." },
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

  const isRoleInterviewed = (roleId: string) => {
    return interviews.some(i => i.roleId === roleId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Laddar...</div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Fel</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>Tillbaka till start</Button>
        </div>
      </div>
    );
  }

  const availableRoles = getRolesForPhase(group.phase);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Status bar */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-gray-500">Grupp:</span>{" "}
            <span className="font-semibold">{group.name}</span>
            <span className="text-gray-400 ml-2">({group.code})</span>
          </div>
          <div className="h-4 border-l border-gray-300" />
          <div className="text-sm">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              group.phase === 1
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}>
              Fas {group.phase}: {group.phase === 1 ? "Utredning" : "Implementering"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{interviews.length} intervjuade</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>{downloadsCount} filer</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Role list */}
        <div className="w-72 bg-gray-50 border-r overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Tillgängliga roller
            </h3>
            {roleCategories.map(category => (
              <div key={category.id} className="mb-4">
                <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">
                  {category.name}
                </h4>
                <div className="space-y-1">
                  {category.roles.map(role => {
                    const isAvailable = availableRoles.some(r => r.id === role.id);
                    const isInterviewed = isRoleInterviewed(role.id);
                    const isSelected = selectedRole?.id === role.id;

                    return (
                      <button
                        key={role.id}
                        onClick={() => isAvailable && handleSelectRole(role)}
                        disabled={!isAvailable}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          isSelected
                            ? "bg-yellow-100 border border-yellow-300"
                            : isAvailable
                            ? "hover:bg-gray-100"
                            : "opacity-50 cursor-not-allowed"
                        }`}
                        title={!isAvailable ? "Låst till Fas 2" : role.title}
                      >
                        <span className="text-xl">{role.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {role.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {role.title}
                          </div>
                        </div>
                        {isInterviewed && (
                          <span className="w-2 h-2 bg-green-500 rounded-full" title="Intervjuad" />
                        )}
                        {!isAvailable && (
                          <span className="text-xs text-gray-400">🔒</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main area - Chat */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Tabs */}
          <div className="border-b px-4">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("interview")}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "interview"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Intervju
              </button>
              <button
                onClick={() => setActiveTab("tools")}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "tools"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <ClipboardList className="w-4 h-4 inline mr-1" />
                Verktyg
              </button>
              <button
                onClick={() => setActiveTab("log")}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "log"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Aktivitetslogg
              </button>
            </div>
          </div>

          {activeTab === "interview" && (
            <>
              {/* Chat header */}
              {selectedRole && (
                <div className="border-b px-4 py-3 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedRole.avatar}</span>
                    <div>
                      <h3 className="font-semibold">{selectedRole.name}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedRole.title} • {selectedRole.projectRole}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!selectedRole ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Välj en person att intervjua från listan till vänster</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p className="mb-2">
                      Du pratar nu med <strong>{selectedRole.name}</strong>
                    </p>
                    <p className="text-sm">Ställ en fråga för att börja intervjun.</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === "user"
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2 text-gray-500">
                      <span className="animate-pulse">Skriver...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat input */}
              {selectedRole && (
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Skriv din fråga..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                      disabled={isSending}
                    />
                    <Button onClick={handleSendMessage} disabled={isSending || !input.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "tools" && (
            <div className="flex-1 p-6">
              <h3 className="text-lg font-semibold mb-4">Projektverktyg</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 hover:border-yellow-300 transition-colors cursor-pointer">
                  <h4 className="font-medium mb-2">Intressentanalys</h4>
                  <p className="text-sm text-gray-500">
                    Kartlägg intressenter med Power/Interest-matris
                  </p>
                </div>
                <div className="border rounded-lg p-4 hover:border-yellow-300 transition-colors cursor-pointer">
                  <h4 className="font-medium mb-2">Riskanalys</h4>
                  <p className="text-sm text-gray-500">
                    Identifiera och bedöm projektrisker
                  </p>
                </div>
                <div className="border rounded-lg p-4 hover:border-yellow-300 transition-colors cursor-pointer">
                  <h4 className="font-medium mb-2">WBS</h4>
                  <p className="text-sm text-gray-500">
                    Skapa Work Breakdown Structure
                  </p>
                </div>
                <div className="border rounded-lg p-4 hover:border-yellow-300 transition-colors cursor-pointer">
                  <h4 className="font-medium mb-2">Åtgärdsförslag</h4>
                  <p className="text-sm text-gray-500">
                    Formulera och lämna in åtgärdsförslag
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "log" && (
            <div className="flex-1 p-6">
              <h3 className="text-lg font-semibold mb-4">Aktivitetslogg</h3>
              <p className="text-gray-500">Aktivitetsloggen visas här...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
