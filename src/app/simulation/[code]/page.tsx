"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { roleCategories, getRoleById, getRolesForPhase, Role } from "@/lib/roles";
import { Send, Users, FileText, ClipboardList, Download, X, BookOpen } from "lucide-react";
import { dataFiles } from "@/lib/data-generator";
import { documents, getDocumentsForRole, Document } from "@/lib/documents";
import { ActionProposals } from "@/components/ActionProposals";
import { StakeholderAnalysis } from "@/components/StakeholderAnalysis";
import { RiskAnalysis } from "@/components/RiskAnalysis";
import { WBS } from "@/components/WBS";

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

interface DownloadData {
  fileId: string;
}

interface ActivityLogItem {
  id: number;
  timestamp: string;
  action: string;
  detail: string;
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
  const [downloads, setDownloads] = useState<DownloadData[]>([]);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [viewedDocuments, setViewedDocuments] = useState<string[]>([]);

  // Document modal
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Active tab and tool tab
  const [activeTab, setActiveTab] = useState<"interview" | "tools" | "log">("interview");
  const [activeTool, setActiveTool] = useState<"overview" | "proposals" | "stakeholders" | "risks" | "wbs" | null>(null);

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
        setDownloads(data.downloads || []);
        setActivityLog(data.activityLog || []);
        setViewedDocuments(data.viewedDocuments || []);
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

  const isFileDownloaded = (fileId: string) => {
    return downloads.some(d => d.fileId === fileId);
  };

  const handleDownload = async (fileId: string) => {
    if (isDownloading || !group) return;

    setIsDownloading(fileId);
    try {
      // Record the download
      await fetch(`/api/groups/${group.code}/downloads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      // Trigger the actual download
      const response = await fetch(`/api/download/${fileId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = dataFiles[fileId as keyof typeof dataFiles]?.filename || `${fileId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Update downloads list
        if (!isFileDownloaded(fileId)) {
          setDownloads(prev => [...prev, { fileId }]);
        }
      }
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleViewDocument = async (doc: Document) => {
    setSelectedDocument(doc);

    // Log the document view
    if (group && !viewedDocuments.includes(doc.id)) {
      try {
        await fetch(`/api/groups/${group.code}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: doc.id }),
        });
        setViewedDocuments(prev => [...prev, doc.id]);
      } catch (error) {
        console.error("Error logging document view:", error);
      }
    }
  };

  const isDocumentViewed = (docId: string) => {
    return viewedDocuments.includes(docId);
  };

  const getRoleDocuments = (roleId: string): Document[] => {
    return getDocumentsForRole(roleId);
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
            <span>{downloads.length} filer</span>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{selectedRole.avatar}</span>
                      <div>
                        <h3 className="font-semibold">{selectedRole.name}</h3>
                        <p className="text-sm text-gray-500">
                          {selectedRole.title} • {selectedRole.projectRole}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Data files available from this role */}
                      {selectedRole.hasData && selectedRole.dataFiles && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Data:</span>
                          {selectedRole.dataFiles.map((fileId) => {
                            const file = dataFiles[fileId as keyof typeof dataFiles];
                            if (!file) return null;
                            const downloaded = isFileDownloaded(fileId);
                            return (
                              <button
                                key={fileId}
                                onClick={() => handleDownload(fileId)}
                                disabled={isDownloading === fileId}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                                  downloaded
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200"
                                }`}
                                title={file.description}
                              >
                                <Download className="w-3 h-3" />
                                {file.name}
                                {isDownloading === fileId && " ..."}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {/* Documents available from this role */}
                      {selectedRole.documents && selectedRole.documents.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Dokument:</span>
                          {selectedRole.documents.map((docId) => {
                            const doc = documents[docId];
                            if (!doc) return null;
                            const viewed = isDocumentViewed(docId);
                            return (
                              <button
                                key={docId}
                                onClick={() => handleViewDocument(doc)}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                                  viewed
                                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                                    : "bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200"
                                }`}
                                title={doc.description}
                              >
                                <BookOpen className="w-3 h-3" />
                                {doc.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
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
            <div className="flex-1 flex flex-col">
              {!activeTool ? (
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Projektverktyg</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTool("stakeholders")}
                      className="text-left border rounded-lg p-4 hover:border-yellow-300 transition-colors"
                    >
                      <h4 className="font-medium mb-2">Intressentanalys</h4>
                      <p className="text-sm text-gray-500">
                        Kartlägg intressenter med Power/Interest-matris
                      </p>
                    </button>
                    <button
                      onClick={() => setActiveTool("risks")}
                      className="text-left border rounded-lg p-4 hover:border-yellow-300 transition-colors"
                    >
                      <h4 className="font-medium mb-2">Riskanalys</h4>
                      <p className="text-sm text-gray-500">
                        Identifiera och bedöm projektrisker
                      </p>
                    </button>
                    <button
                      onClick={() => setActiveTool("wbs")}
                      className="text-left border rounded-lg p-4 hover:border-yellow-300 transition-colors"
                    >
                      <h4 className="font-medium mb-2">WBS</h4>
                      <p className="text-sm text-gray-500">
                        Skapa Work Breakdown Structure
                      </p>
                    </button>
                    <button
                      onClick={() => setActiveTool("proposals")}
                      className="text-left border rounded-lg p-4 hover:border-yellow-300 transition-colors"
                    >
                      <h4 className="font-medium mb-2">Åtgärdsförslag</h4>
                      <p className="text-sm text-gray-500">
                        Formulera och lämna in åtgärdsförslag
                      </p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="px-4 py-2 border-b bg-gray-50 flex items-center gap-2">
                    <button
                      onClick={() => setActiveTool(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      ← Tillbaka till verktyg
                    </button>
                  </div>
                  {activeTool === "proposals" && (
                    <ActionProposals
                      groupCode={group.code}
                      onSubmit={async () => {
                        try {
                          const response = await fetch(`/api/groups/${group.code}/submit`, {
                            method: "POST",
                          });
                          const data = await response.json();
                          if (data.success) {
                            alert("Åtgärdsförslag inskickade för godkännande! Invänta lärarens beslut.");
                            fetchGroupData();
                          } else {
                            alert(`Kunde inte skicka in: ${data.error}`);
                          }
                        } catch (error) {
                          alert("Ett fel uppstod vid inlämning.");
                        }
                      }}
                    />
                  )}
                  {activeTool === "stakeholders" && (
                    <StakeholderAnalysis groupCode={group.code} />
                  )}
                  {activeTool === "risks" && (
                    <RiskAnalysis groupCode={group.code} />
                  )}
                  {activeTool === "wbs" && (
                    <WBS groupCode={group.code} />
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "log" && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Aktivitetslogg</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const json = JSON.stringify(activityLog, null, 2);
                    const blob = new Blob([json], { type: "application/json" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `aktivitetslogg-${group?.code}.json`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  Exportera JSON
                </Button>
              </div>
              {activityLog.length === 0 ? (
                <p className="text-gray-500">Ingen aktivitet loggad än.</p>
              ) : (
                <div className="space-y-2">
                  {activityLog.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="text-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("sv-SE")}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-gray-700">
                          {log.action === "group_created" && "Grupp skapad"}
                          {log.action === "interview_started" && "Intervju startad"}
                          {log.action === "question_asked" && "Fråga ställd"}
                          {log.action === "file_downloaded" && "Fil nedladdad"}
                          {log.action === "document_viewed" && "Dokument visat"}
                          {log.action === "phase_changed" && "Fas ändrad"}
                          {log.action === "status_changed" && "Status ändrad"}
                        </span>
                        <span className="text-gray-500 ml-2">{log.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Document Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold text-lg">{selectedDocument.name}</h3>
                <p className="text-sm text-gray-500">{selectedDocument.description}</p>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
                {selectedDocument.content}
              </pre>
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button onClick={() => setSelectedDocument(null)}>Stäng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
