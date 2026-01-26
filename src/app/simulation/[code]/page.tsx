"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { roleCategories, getRoleById, getRolesForPhase, Role } from "@/lib/roles";
import { Send, Users, FileText, ClipboardList, Download, X, BookOpen, Menu, Lock, CheckCircle, ChevronRight } from "lucide-react";
import { dataFiles } from "@/lib/data-generator";
import { documents, getDocumentsForRole, Document } from "@/lib/documents";
import { ActionProposals } from "@/components/ActionProposals";
import { StakeholderAnalysis } from "@/components/StakeholderAnalysis";
import { RiskAnalysis } from "@/components/RiskAnalysis";
import { WBS } from "@/components/WBS";
import { GanttChart } from "@/components/GanttChart";
import { ImplementationPlan } from "@/components/ImplementationPlan";
import { Phase2Events } from "@/components/Phase2Events";
import { ResultsCalculation } from "@/components/ResultsCalculation";
import { ExportPanel } from "@/components/ExportPanel";
import { IntroMeeting } from "@/components/IntroMeeting";
import { ProjectDefinition } from "@/components/ProjectDefinition";
import { InvestigationReport } from "@/components/InvestigationReport";
import { Phase2IntroMeeting } from "@/components/Phase2IntroMeeting";
import { BudgetAllocation } from "@/components/BudgetAllocation";
import { ConflictResolution } from "@/components/ConflictResolution";
import { FinalReport } from "@/components/FinalReport";
import { FiveWhyAnalysis } from "@/components/FiveWhyAnalysis";
import { QualityTools7QC } from "@/components/QualityTools7QC";
import { QualityTools7QM } from "@/components/QualityTools7QM";

type SubPhase = 'intro' | 'prestudy' | 'planning' | 'execution' | 'closing';

type GateStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

interface GroupData {
  id: number;
  code: string;
  name: string;
  studentNames: string;
  phase: number; // 1 = Projektdefinition, 2 = Projektplan, 3 = Utredning, 4 = Redovisning
  subPhase: SubPhase;
  projectPlanApproved: boolean;
  investigationApproved: boolean;
  // Four-gate system
  gate1Status: GateStatus;
  gate2Status: GateStatus;
  gate3Status: GateStatus;
  gate4Status: GateStatus;
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

export default function SimulationPage() {
  const params = useParams();
  const code = params.code as string;
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

  // Data/document offers from chat
  const [offeredData, setOfferedData] = useState<string[]>([]);
  const [offeredDocuments, setOfferedDocuments] = useState<string[]>([]);

  // Active tab and tool tab
  const [activeTab, setActiveTab] = useState<"interview" | "tools" | "log">("interview");
  const [activeTool, setActiveTool] = useState<"overview" | "proposals" | "stakeholders" | "risks" | "wbs" | "gantt" | "fivewhy" | "7qc" | "7qm" | "implementation" | "events" | "results" | "export" | "budget" | "conflicts" | "final" | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Phase 2 state
  const [currentWeek, setCurrentWeek] = useState(1);
  const [proposals, setProposals] = useState<Array<{
    id: number;
    rootCauseId: string;
    description: string;
    responsible: string | null;
    cost: number | null;
  }>>([]);

  useEffect(() => {
    if (code) {
      fetchGroupData();
    }
  }, [code]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchGroupData = async () => {
    try {
      const response = await fetch(`/api/groups/${code}`);
      const data = await response.json();

      if (data.success) {
        setGroup(data.group);
        setInterviews(data.interviews || []);
        setDownloads(data.downloads || []);
        setActivityLog(data.activityLog || []);
        setViewedDocuments(data.viewedDocuments || []);

        // Fetch proposals if in phase 3 or 4
        if (data.group.phase >= 3) {
          const proposalsRes = await fetch(`/api/groups/${code}/proposals`);
          const proposalsData = await proposalsRes.json();
          if (proposalsData.success) {
            setProposals(proposalsData.proposals);
          }
        }
      } else {
        setError("Gruppen hittades inte");
      }
    } catch {
      setError("Kunde inte ladda gruppdata");
    } finally {
      setLoading(false);
    }
  };

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

        // Update interview stats - add role if not already interviewed
        if (selectedRole && !isRoleInterviewed(selectedRole.id)) {
          setInterviews(prev => [...prev, { roleId: selectedRole.id, questionsAsked: 1 }]);
        } else if (selectedRole) {
          // Increment question count for existing interview
          setInterviews(prev => prev.map(i =>
            i.roleId === selectedRole.id
              ? { ...i, questionsAsked: i.questionsAsked + 1 }
              : i
          ));
        }

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

  const updateSubPhase = async (newSubPhase: SubPhase) => {
    if (!group) return;
    try {
      const response = await fetch(`/api/groups/${group.code}/sub-phase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subPhase: newSubPhase }),
      });
      const data = await response.json();
      if (data.success) {
        setGroup(prev => prev ? { ...prev, subPhase: newSubPhase } : null);
      }
    } catch (error) {
      console.error("Error updating sub-phase:", error);
    }
  };

  const subPhaseLabels: Record<SubPhase, string> = {
    intro: "Uppdragsmöte",
    prestudy: "Förstudie",
    planning: "Planering",
    execution: "Genomförande",
    closing: "Avslut"
  };

  const subPhaseOrder: SubPhase[] = ['intro', 'prestudy', 'planning', 'execution', 'closing'];

  const canAccessSubPhase = (phase: SubPhase): boolean => {
    if (!group) return false;
    const currentIndex = subPhaseOrder.indexOf(group.subPhase);
    const targetIndex = subPhaseOrder.indexOf(phase);
    return targetIndex <= currentIndex;
  };

  // Check if interviews are locked
  // Interviews are available in Phase 3 (Utredning) and Phase 4 (Redovisning)
  const interviewsLocked = !group || group.phase < 3;

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
      <div className="bg-white border-b px-2 sm:px-4 py-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="text-xs sm:text-sm">
              <span className="text-gray-500">Grupp:</span>{" "}
              <span className="font-semibold">{group.name}</span>
              <span className="text-gray-400 ml-1 sm:ml-2">({group.code})</span>
            </div>
            <div className="hidden sm:block h-4 border-l border-gray-300" />
            {/* Four-phase indicator */}
            <div className="flex items-center gap-1">
              {[
                { num: 1, name: "Projektdefinition", color: "blue" },
                { num: 2, name: "Projektplan", color: "purple" },
                { num: 3, name: "Utredning", color: "orange" },
                { num: 4, name: "Redovisning", color: "green" }
              ].map((phase, index) => {
                const isActive = group.phase === phase.num;
                const isCompleted = group.phase > phase.num ||
                  (phase.num === 1 && (group.gate1Status === 'approved' || group.projectPlanApproved)) ||
                  (phase.num === 2 && group.gate2Status === 'approved') ||
                  (phase.num === 3 && group.gate3Status === 'approved') ||
                  (phase.num === 4 && group.gate4Status === 'approved');
                const isPending =
                  (phase.num === 1 && group.gate1Status === 'pending') ||
                  (phase.num === 2 && group.gate2Status === 'pending') ||
                  (phase.num === 3 && group.gate3Status === 'pending') ||
                  (phase.num === 4 && group.gate4Status === 'pending');

                const bgColor = isCompleted
                  ? "bg-green-100 text-green-700"
                  : isPending
                  ? "bg-yellow-100 text-yellow-700"
                  : isActive
                  ? phase.color === "blue" ? "bg-blue-100 text-blue-700"
                    : phase.color === "purple" ? "bg-purple-100 text-purple-700"
                    : phase.color === "orange" ? "bg-orange-100 text-orange-700"
                    : "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-400";

                return (
                  <div key={phase.num} className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${bgColor}`}>
                      {isCompleted && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {isPending && <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1 animate-pulse" />}
                      <span className="hidden sm:inline">{phase.num}. {phase.name}</span>
                      <span className="sm:hidden">{phase.num}</span>
                    </span>
                    {index < 3 && <ChevronRight className="w-3 h-3 text-gray-300 mx-0.5" />}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1" aria-label={`${interviews.length} intervjuer genomförda`}>
              <Users className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
              <span className="hidden xs:inline">{interviews.length} intervjuade</span>
              <span className="xs:hidden">{interviews.length}</span>
            </div>
            <div className="flex items-center gap-1" aria-label={`${downloads.length} filer nedladdade`}>
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
              <span className="hidden xs:inline">{downloads.length} filer</span>
              <span className="xs:hidden">{downloads.length}</span>
            </div>
          </div>
        </div>

        {/* Phase-specific status */}
        <div className="mt-2 pt-2 border-t">
          <div className="text-xs text-gray-600">
            {group.phase === 1 && (
              <>
                <span className="font-medium">Fas 1 - Projektdefinition:</span> Definiera syfte, mål och avgränsningar.
                {group.gate1Status === 'pending' && (
                  <span className="ml-2 text-yellow-600">⏳ Väntar på lärarens godkännande</span>
                )}
                {group.gate1Status === 'rejected' && (
                  <span className="ml-2 text-red-600">❌ Begär komplettering - se feedback i aktivitetsloggen</span>
                )}
              </>
            )}
            {group.phase === 2 && (
              <>
                <span className="font-medium">Fas 2 - Projektplan:</span> Skapa WBS, Gantt, intressentanalys och riskanalys.
                {group.gate2Status === 'pending' && (
                  <span className="ml-2 text-yellow-600">⏳ Väntar på lärarens godkännande</span>
                )}
                {group.gate2Status === 'rejected' && (
                  <span className="ml-2 text-red-600">❌ Begär komplettering - se feedback i aktivitetsloggen</span>
                )}
              </>
            )}
            {group.phase === 3 && (
              <>
                <span className="font-medium">Fas 3 - Utredning:</span> Intervjua, samla data, analysera med 5 Varför, 7QC och 7QM. Hitta rotorsaker.
                {group.gate3Status === 'pending' && (
                  <span className="ml-2 text-yellow-600">⏳ Väntar på lärarens godkännande</span>
                )}
                {group.gate3Status === 'rejected' && (
                  <span className="ml-2 text-red-600">❌ Begär komplettering - se feedback i aktivitetsloggen</span>
                )}
                {(!group.gate3Status || group.gate3Status === 'not_submitted') && (
                  <span className="ml-2 text-gray-500">Intervjuer upplåsta</span>
                )}
              </>
            )}
            {group.phase === 4 && (
              <>
                <span className="font-medium">Fas 4 - Redovisning:</span> Skapa handlingsplan och presentera kvalitetsverktyg och resultat.
                {group.gate4Status === 'pending' && (
                  <span className="ml-2 text-yellow-600">⏳ Väntar på lärarens godkännande</span>
                )}
                {group.gate4Status === 'rejected' && (
                  <span className="ml-2 text-red-600">❌ Begär komplettering - se feedback i aktivitetsloggen</span>
                )}
              </>
            )}
          </div>
        </div>

      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Fas 1: Projektdefinition - Intro meeting och projektdefinition */}
        {group.phase === 1 && group.subPhase === 'intro' ? (
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="max-w-3xl mx-auto h-full">
              <IntroMeeting
                groupName={group.name}
                onComplete={() => updateSubPhase('prestudy')}
              />
            </div>
          </div>
        ) : group.phase === 1 ? (
          <div className="flex-1 overflow-y-auto">
            <ProjectDefinition
              groupCode={group.code}
              onSave={() => {}}
            />
            {/* Gate 1 submission */}
            {group.gate1Status === 'not_submitted' && (
              <div className="p-6 max-w-3xl mx-auto">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-800 mb-2">📝 Gate 1: Styrgruppsmöte - Projektdirektiv</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    När ni har definierat syfte, mål och avgränsningar, skicka in för lärarens godkännande.
                    Efter godkännande får ni tillgång till Fas 2 (Projektplan).
                  </p>
                  <Button
                    onClick={async () => {
                      if (confirm("Är ni säkra på att ni vill skicka in projektdirektivet för godkännande?")) {
                        try {
                          const response = await fetch(`/api/groups/${group.code}/submit-gate`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ gateNumber: 1 }),
                          });
                          const data = await response.json();
                          if (data.success) {
                            alert("Projektdirektivet har skickats in! Invänta lärarens beslut.");
                            fetchGroupData();
                          } else {
                            alert(`Kunde inte skicka in: ${data.error}`);
                          }
                        } catch {
                          alert("Ett fel uppstod vid inlämning.");
                        }
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Boka styrgruppsmöte (Gate 1)
                  </Button>
                </div>
              </div>
            )}
            {group.gate1Status === 'pending' && (
              <div className="p-6 max-w-3xl mx-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">⏳ Väntar på styrgruppens beslut</h4>
                  <p className="text-sm text-yellow-700">
                    Ert projektdirektiv har skickats till Maria och styrgruppen. Ni får återkoppling inom kort.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Fas 2 och 3: Projektplan/Utredning med verktyg och intervjuer */
          <>
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-30 md:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
            )}

            {/* Sidebar - Role list */}
            <aside
              className={`fixed md:relative inset-y-0 left-0 z-40 w-72 bg-gray-50 border-r overflow-y-auto transform transition-transform duration-200 ease-in-out ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
              }`}
              aria-label="Rollista"
            >
              <div className="p-4">
                {/* Close button for mobile */}
                <div className="flex items-center justify-between mb-3 md:mb-0">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {interviewsLocked ? "Roller (låsta)" : "Tillgängliga roller"}
                  </h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden p-2 -mr-2 hover:bg-gray-200 rounded-lg"
                    aria-label="Stäng meny"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {interviewsLocked && (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs text-orange-700">
                      <Lock className="w-3 h-3 inline mr-1" />
                      Intervjuer låses upp när läraren godkänner er projektplan.
                    </p>
                  </div>
                )}
                {roleCategories.map(category => (
                  <div key={category.id} className="mb-4">
                    <h4 className="text-xs font-medium text-gray-400 uppercase mb-2">
                      {category.name}
                    </h4>
                    <div className="space-y-1" role="list">
                      {category.roles.map(role => {
                        const isPhaseAvailable = availableRoles.some(r => r.id === role.id);
                        const isAvailable = isPhaseAvailable && !interviewsLocked;
                        const isInterviewed = isRoleInterviewed(role.id);
                        const isSelected = selectedRole?.id === role.id;

                        return (
                          <button
                            key={role.id}
                            onClick={() => {
                              if (isAvailable) {
                                handleSelectRole(role);
                                setSidebarOpen(false);
                              }
                            }}
                            disabled={!isAvailable}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                              isSelected
                                ? "bg-yellow-100 border border-yellow-300"
                                : isAvailable
                                ? "hover:bg-gray-100"
                                : "opacity-50 cursor-not-allowed"
                            }`}
                            title={!isAvailable ? (interviewsLocked ? "Väntar på godkännande" : "Låst till Fas 2") : role.title}
                            aria-selected={isSelected}
                            aria-disabled={!isAvailable}
                            role="listitem"
                          >
                            <span className="text-xl" aria-hidden="true">{role.avatar}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900 truncate">
                                {role.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {role.title}
                              </div>
                            </div>
                            {isInterviewed && (
                              <span className="w-2 h-2 bg-green-500 rounded-full" title="Intervjuad" aria-label="Intervjuad" />
                            )}
                            {!isAvailable && (
                              <span className="text-xs text-gray-400" aria-hidden="true">🔒</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Main area - Chat */}
            <main className="flex-1 flex flex-col bg-white min-w-0">
          {/* Tabs with mobile menu button */}
          <div className="border-b px-2 sm:px-4">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg"
                aria-label="Öppna rollmeny"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveTab("interview")}
                className={`py-3 px-1 text-xs sm:text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                  activeTab === "interview"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                role="tab"
                aria-selected={activeTab === "interview"}
                aria-controls="tab-interview"
              >
                <Users className="w-4 h-4 inline mr-1" aria-hidden="true" />
                <span className="hidden sm:inline">Intervju</span>
                <span className="sm:hidden">Intervju</span>
              </button>
              <button
                onClick={() => setActiveTab("tools")}
                className={`py-3 px-1 text-xs sm:text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                  activeTab === "tools"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                role="tab"
                aria-selected={activeTab === "tools"}
                aria-controls="tab-tools"
              >
                <ClipboardList className="w-4 h-4 inline mr-1" aria-hidden="true" />
                Verktyg
              </button>
              <button
                onClick={() => setActiveTab("log")}
                className={`py-3 px-1 text-xs sm:text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                  activeTab === "log"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                role="tab"
                aria-selected={activeTab === "log"}
                aria-controls="tab-log"
              >
                <FileText className="w-4 h-4 inline mr-1" aria-hidden="true" />
                <span className="hidden sm:inline">Aktivitetslogg</span>
                <span className="sm:hidden">Logg</span>
              </button>
            </div>
          </div>

          {activeTab === "interview" && (
            <>
              {/* Chat header - enkel utan synliga data/dokument */}
              {selectedRole && (
                <div className="border-b px-4 py-3 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedRole.avatar}</span>
                    <div>
                      <h3 className="font-semibold">{selectedRole.name}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedRole.title}
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

              {/* Offered data/documents */}
              {selectedRole && (offeredData.length > 0 || offeredDocuments.length > 0) && (
                <div className="border-t bg-green-50 px-4 py-3">
                  <p className="text-sm text-green-800 font-medium mb-2">
                    📎 {selectedRole.name} har delat material med dig:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {offeredData.map((fileId) => {
                      const file = dataFiles[fileId as keyof typeof dataFiles];
                      if (!file) return null;
                      const downloaded = isFileDownloaded(fileId);
                      return (
                        <button
                          key={fileId}
                          onClick={() => handleDownload(fileId)}
                          disabled={isDownloading === fileId}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                            downloaded
                              ? "bg-green-200 text-green-800 border border-green-300"
                              : "bg-white text-green-700 border border-green-300 hover:bg-green-100"
                          }`}
                        >
                          <Download className="w-4 h-4" />
                          {file.name}
                          {downloaded && " ✓"}
                          {isDownloading === fileId && " ..."}
                        </button>
                      );
                    })}
                    {offeredDocuments.map((docId) => {
                      const doc = documents[docId];
                      if (!doc) return null;
                      const viewed = isDocumentViewed(docId);
                      return (
                        <button
                          key={docId}
                          onClick={() => handleViewDocument(doc)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
                            viewed
                              ? "bg-purple-200 text-purple-800 border border-purple-300"
                              : "bg-white text-purple-700 border border-purple-300 hover:bg-purple-100"
                          }`}
                        >
                          <BookOpen className="w-4 h-4" />
                          {doc.name}
                          {viewed && " ✓"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

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
                  {/* Fas 2: Projektplan */}
                  {group.phase === 2 ? (
                    <>
                      <h3 className="text-lg font-semibold mb-2">Fas 2 - Projektplan</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Skapa WBS, tidplan, intressentanalys och riskanalys för projektet.
                      </p>

                      {/* Planning tools */}
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Planeringsverktyg</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <button
                          onClick={() => setActiveTool("wbs")}
                          className="text-left border rounded-lg p-4 hover:border-blue-300 transition-colors border-blue-200 bg-blue-50"
                        >
                          <h4 className="font-medium mb-2">📊 WBS</h4>
                          <p className="text-sm text-gray-600">
                            Work Breakdown Structure - strukturera arbetet
                          </p>
                        </button>
                        <button
                          onClick={() => setActiveTool("gantt")}
                          className="text-left border rounded-lg p-4 hover:border-teal-300 transition-colors border-teal-200 bg-teal-50"
                        >
                          <h4 className="font-medium mb-2">📅 Gantt-schema</h4>
                          <p className="text-sm text-gray-600">
                            Visualisera projekttidslinjen
                          </p>
                        </button>
                        <button
                          onClick={() => setActiveTool("stakeholders")}
                          className="text-left border rounded-lg p-4 hover:border-purple-300 transition-colors border-purple-200 bg-purple-50"
                        >
                          <h4 className="font-medium mb-2">👥 Intressentanalys</h4>
                          <p className="text-sm text-gray-600">
                            Identifiera och analysera intressenter
                          </p>
                        </button>
                        <button
                          onClick={() => setActiveTool("risks")}
                          className="text-left border rounded-lg p-4 hover:border-orange-300 transition-colors border-orange-200 bg-orange-50"
                        >
                          <h4 className="font-medium mb-2">⚠️ Riskanalys</h4>
                          <p className="text-sm text-gray-600">
                            Identifiera och hantera projektrisker
                          </p>
                        </button>
                      </div>

                      {/* Gate 2 submission */}
                      {group.gate2Status === 'not_submitted' && (
                        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <h4 className="font-medium text-purple-800 mb-2">📝 Gate 2: Styrgruppsmöte - Projektplan</h4>
                          <p className="text-sm text-purple-700 mb-3">
                            När ni har skapat WBS, tidplan, intressentanalys och riskanalys, skicka in för lärarens godkännande.
                            Efter godkännande får ni tillgång till Fas 3 (Utredning) med intervjuer och dataanalys.
                          </p>
                          <Button
                            onClick={async () => {
                              if (confirm("Är ni säkra på att ni vill skicka in projektplanen för godkännande?")) {
                                try {
                                  const response = await fetch(`/api/groups/${group.code}/submit-gate`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ gateNumber: 2 }),
                                  });
                                  const data = await response.json();
                                  if (data.success) {
                                    alert("Projektplanen har skickats in! Invänta lärarens beslut.");
                                    fetchGroupData();
                                  } else {
                                    alert(`Kunde inte skicka in: ${data.error}`);
                                  }
                                } catch {
                                  alert("Ett fel uppstod vid inlämning.");
                                }
                              }
                            }}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Boka styrgruppsmöte (Gate 2)
                          </Button>
                        </div>
                      )}

                      {group.gate2Status === 'pending' && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="font-medium text-yellow-800 mb-2">⏳ Väntar på styrgruppens beslut</h4>
                          <p className="text-sm text-yellow-700">
                            Er projektplan har skickats till Maria och styrgruppen. Ni får återkoppling inom kort.
                          </p>
                        </div>
                      )}
                    </>
                  ) : group.phase === 3 ? (
                    /* Fas 3: Utredning - intervjuer, data, analysverktyg */
                    <>
                      <h3 className="text-lg font-semibold mb-2">Fas 3 - Utredning</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Intervjua medarbetare, samla data, analysera med 5 Varför, 7QC och 7QM. Identifiera rotorsaker.
                      </p>

                      {/* Analysis tools */}
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Analysverktyg</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <button
                          onClick={() => setActiveTool("fivewhy")}
                          className="text-left border rounded-lg p-4 hover:border-red-300 transition-colors border-red-200 bg-red-50"
                        >
                          <h4 className="font-medium mb-2">🔍 5 Varför</h4>
                          <p className="text-sm text-gray-600">
                            Rotorsaksanalys med 5 Varför-metoden
                          </p>
                        </button>
                        <button
                          onClick={() => setActiveTool("7qc")}
                          className="text-left border rounded-lg p-4 hover:border-cyan-300 transition-colors border-cyan-200 bg-cyan-50"
                        >
                          <h4 className="font-medium mb-2">📊 7 Kvalitetsverktyg (7QC)</h4>
                          <p className="text-sm text-gray-600">
                            Datainsamling, histogram, Pareto m.m. (minst 4 krävs)
                          </p>
                        </button>
                        <button
                          onClick={() => setActiveTool("7qm")}
                          className="text-left border rounded-lg p-4 hover:border-indigo-300 transition-colors border-indigo-200 bg-indigo-50"
                        >
                          <h4 className="font-medium mb-2">🗂️ 7 Ledningsverktyg (7QM)</h4>
                          <p className="text-sm text-gray-600">
                            Affinitet, träddiagram, matris m.m. (minst 2 krävs)
                          </p>
                        </button>
                      </div>

                      {/* Documentation tools */}
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Dokumentation</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <button
                          onClick={() => setActiveTool("overview")}
                          className="text-left border rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                          <h4 className="font-medium mb-2">📁 Nedladdade filer</h4>
                          <p className="text-sm text-gray-500">
                            Se vilka datafiler ni har fått ({downloads.length} st)
                          </p>
                        </button>
                        <button
                          onClick={() => setActiveTool("export")}
                          className="text-left border rounded-lg p-4 hover:border-gray-400 transition-colors bg-gray-50"
                        >
                          <h4 className="font-medium mb-2">📦 Exportera</h4>
                          <p className="text-sm text-gray-500">
                            Ladda ner rapporter och dokumentation
                          </p>
                        </button>
                      </div>

                      {/* Gate 3 submission */}
                      {group.gate3Status === 'not_submitted' && (
                        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <h4 className="font-medium text-orange-800 mb-2">📝 Gate 3: Styrgruppsmöte - Utredningsrapport</h4>
                          <p className="text-sm text-orange-700 mb-3">
                            När ni har genomfört intervjuer, använt analysverktyg och hittat rotorsaker,
                            skicka in för lärarens godkännande. Efter godkännande får ni tillgång till Fas 4 (Redovisning).
                          </p>
                          <div className="text-xs text-orange-600 mb-3 space-y-1">
                            <p>Krav för godkännande:</p>
                            <ul className="list-disc list-inside pl-2">
                              <li>Minst 6 roller intervjuade ({interviews.length}/6)</li>
                              <li>Minst 4 st 7QC-verktyg använda</li>
                              <li>Minst 2 st 7QM-verktyg använda</li>
                              <li>5 Varför-analys genomförd</li>
                            </ul>
                          </div>
                          <Button
                            onClick={async () => {
                              if (confirm("Är ni säkra på att ni vill skicka in utredningen för godkännande?")) {
                                try {
                                  const response = await fetch(`/api/groups/${group.code}/submit-gate`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ gateNumber: 3 }),
                                  });
                                  const data = await response.json();
                                  if (data.success) {
                                    alert("Utredningen har skickats in! Invänta lärarens beslut.");
                                    fetchGroupData();
                                  } else {
                                    alert(`Kunde inte skicka in: ${data.error}`);
                                  }
                                } catch {
                                  alert("Ett fel uppstod vid inlämning.");
                                }
                              }
                            }}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Boka styrgruppsmöte (Gate 3)
                          </Button>
                        </div>
                      )}

                      {group.gate3Status === 'pending' && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="font-medium text-yellow-800 mb-2">⏳ Väntar på styrgruppens beslut</h4>
                          <p className="text-sm text-yellow-700">
                            Er utredningsrapport har skickats till Maria och styrgruppen. Ni får återkoppling inom kort.
                          </p>
                        </div>
                      )}
                    </>
                  ) : group.phase === 4 ? (
                    /* Fas 4: Redovisning - handlingsplan och presentation */
                    <>
                      <h3 className="text-lg font-semibold mb-2">Fas 4 - Redovisning</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Skapa handlingsplan med aktiviteter, ansvarig och tidplan. Presentera vilka kvalitetsverktyg ni använt och vilka resultat ni nått.
                      </p>

                      {/* Action plan tools */}
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Handlingsplan</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <button
                          onClick={() => setActiveTool("proposals")}
                          className="text-left border-2 border-yellow-300 rounded-lg p-4 hover:bg-yellow-50 transition-colors bg-yellow-50"
                        >
                          <h4 className="font-medium mb-2">📋 Handlingsplan</h4>
                          <p className="text-sm text-gray-600">
                            Dokumentera åtgärder med aktivitet, ansvarig, tidplan och minskning (minst 3 krävs)
                          </p>
                        </button>
                        <button
                          onClick={() => setActiveTool("export")}
                          className="text-left border rounded-lg p-4 hover:border-gray-400 transition-colors bg-gray-50"
                        >
                          <h4 className="font-medium mb-2">📦 Exportera</h4>
                          <p className="text-sm text-gray-500">
                            Ladda ner rapporter och dokumentation
                          </p>
                        </button>
                      </div>

                      {/* Review previous analysis */}
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Granska era analysresultat</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <button
                          onClick={() => setActiveTool("fivewhy")}
                          className="text-left border rounded-lg p-4 hover:border-red-300 transition-colors border-red-200 bg-red-50"
                        >
                          <h4 className="font-medium mb-2">🔍 5 Varför</h4>
                          <p className="text-sm text-gray-600">Se era 5 Varför-analyser</p>
                        </button>
                        <button
                          onClick={() => setActiveTool("7qc")}
                          className="text-left border rounded-lg p-4 hover:border-cyan-300 transition-colors border-cyan-200 bg-cyan-50"
                        >
                          <h4 className="font-medium mb-2">📊 7QC</h4>
                          <p className="text-sm text-gray-600">Se era 7QC-analyser</p>
                        </button>
                        <button
                          onClick={() => setActiveTool("7qm")}
                          className="text-left border rounded-lg p-4 hover:border-indigo-300 transition-colors border-indigo-200 bg-indigo-50"
                        >
                          <h4 className="font-medium mb-2">🗂️ 7QM</h4>
                          <p className="text-sm text-gray-600">Se era 7QM-analyser</p>
                        </button>
                        <button
                          onClick={() => setActiveTool("overview")}
                          className="text-left border rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                          <h4 className="font-medium mb-2">📁 Nedladdade filer</h4>
                          <p className="text-sm text-gray-500">
                            Se vilka datafiler ni har fått ({downloads.length} st)
                          </p>
                        </button>
                      </div>

                      {/* Gate 4 submission */}
                      {group.gate4Status === 'not_submitted' && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-2">📝 Gate 4: Slutredovisning till styrgruppen</h4>
                          <p className="text-sm text-green-700 mb-3">
                            Presentera er handlingsplan med aktiviteter, ansvarig, tidplan och förväntad minskning
                            av reklamationskostnaderna. Redovisa vilka kvalitetsverktyg ni använt och era resultat.
                          </p>
                          <div className="text-xs text-green-600 mb-3 space-y-1">
                            <p>Krav för godkännande:</p>
                            <ul className="list-disc list-inside pl-2">
                              <li>Minst 3 åtgärder med ansvarig, tidplan och förväntad effekt</li>
                              <li>Total minskning av reklamationskostnaderna &gt;50%</li>
                              <li>Presentation av använda kvalitetsverktyg och resultat</li>
                            </ul>
                          </div>
                          <Button
                            onClick={async () => {
                              if (confirm("Är ni säkra på att ni vill skicka in slutredovisningen för godkännande?")) {
                                try {
                                  const response = await fetch(`/api/groups/${group.code}/submit-gate`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ gateNumber: 4 }),
                                  });
                                  const data = await response.json();
                                  if (data.success) {
                                    alert("Slutredovisningen har skickats in! Henrik från styrelsen kommer också granska den.");
                                    fetchGroupData();
                                  } else {
                                    alert(`Kunde inte skicka in: ${data.error}`);
                                  }
                                } catch {
                                  alert("Ett fel uppstod vid inlämning.");
                                }
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Boka slutredovisning (Gate 4)
                          </Button>
                        </div>
                      )}

                      {group.gate4Status === 'pending' && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="font-medium text-yellow-800 mb-2">⏳ Väntar på styrgruppens beslut</h4>
                          <p className="text-sm text-yellow-700">
                            Er slutredovisning har skickats till Maria och Henrik från styrelsen. Ni får återkoppling inom kort.
                          </p>
                        </div>
                      )}

                      {group.gate4Status === 'approved' && (
                        <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-2">✅ Projektet godkänt!</h4>
                          <p className="text-sm text-green-700">
                            Grattis! Styrgruppen har godkänt er slutredovisning. Projektet är nu avslutat.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Fallback */
                    <>
                      <h3 className="text-lg font-semibold mb-4">Verktyg</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={() => setActiveTool("proposals")}
                          className="text-left border rounded-lg p-4 hover:border-yellow-300 transition-colors"
                        >
                          <h4 className="font-medium mb-2">📋 Åtgärdsförslag</h4>
                          <p className="text-sm text-gray-500">
                            Se era godkända åtgärdsförslag
                          </p>
                        </button>
                        <button
                          onClick={() => setActiveTool("export")}
                          className="text-left border rounded-lg p-4 hover:border-gray-400 transition-colors bg-gray-50"
                        >
                          <h4 className="font-medium mb-2">📦 Exportera</h4>
                          <p className="text-sm text-gray-500">
                            Ladda ner rapporter och dokumentation
                          </p>
                        </button>
                      </div>
                    </>
                  )}
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
                  {activeTool === "gantt" && (
                    <GanttChart groupCode={group.code} />
                  )}
                  {activeTool === "fivewhy" && (
                    <FiveWhyAnalysis groupCode={group.code} />
                  )}
                  {activeTool === "7qc" && (
                    <QualityTools7QC groupCode={group.code} />
                  )}
                  {activeTool === "7qm" && (
                    <QualityTools7QM groupCode={group.code} />
                  )}
                  {activeTool === "implementation" && (
                    <ImplementationPlan
                      groupCode={group.code}
                      approvedProposals={proposals}
                    />
                  )}
                  {activeTool === "events" && (
                    <Phase2Events
                      groupCode={group.code}
                      currentWeek={currentWeek}
                      onWeekChange={setCurrentWeek}
                    />
                  )}
                  {activeTool === "results" && (
                    <ResultsCalculation
                      groupCode={group.code}
                      proposals={proposals}
                    />
                  )}
                  {activeTool === "budget" && (
                    <BudgetAllocation
                      groupCode={group.code}
                      proposals={proposals}
                    />
                  )}
                  {activeTool === "conflicts" && (
                    <ConflictResolution
                      groupCode={group.code}
                    />
                  )}
                  {activeTool === "final" && (
                    <FinalReport
                      groupCode={group.code}
                      groupName={group.name}
                      proposals={proposals}
                      onSubmit={() => fetchGroupData()}
                    />
                  )}
                  {activeTool === "export" && (
                    <ExportPanel
                      groupCode={group.code}
                      groupData={{
                        name: group.name,
                        code: group.code,
                        studentNames: group.studentNames,
                        phase: group.phase
                      }}
                      activityLog={activityLog}
                      interviews={interviews}
                      downloads={downloads}
                      proposals={proposals}
                    />
                  )}
                  {activeTool === "overview" && (
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Nedladdade filer</h3>
                      {downloads.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="mb-2">Ni har inte fått några datafiler än.</p>
                          <p className="text-sm">Intervjua medarbetare och fråga om data för att få tillgång till filer.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {downloads.map((download) => {
                            const file = dataFiles[download.fileId as keyof typeof dataFiles];
                            if (!file) return null;
                            return (
                              <div
                                key={download.fileId}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="w-8 h-8 text-green-600" />
                                  <div>
                                    <p className="font-medium">{file.name}</p>
                                    <p className="text-sm text-gray-500">{file.filename}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(download.fileId)}
                                  disabled={isDownloading === download.fileId}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  {isDownloading === download.fileId ? "Laddar..." : "Ladda ner igen"}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
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
        </main>
          </>
        )}
      </div>

      {/* Document Modal */}
      {selectedDocument && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="document-title"
          onClick={() => setSelectedDocument(null)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
              <div className="min-w-0 flex-1">
                <h3 id="document-title" className="font-semibold text-base sm:text-lg truncate">{selectedDocument.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{selectedDocument.description}</p>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2 flex-shrink-0"
                aria-label="Stäng dokument"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm bg-gray-50 p-3 sm:p-4 rounded-lg">
                {selectedDocument.content}
              </pre>
            </div>
            <div className="p-3 sm:p-4 border-t flex justify-end">
              <Button onClick={() => setSelectedDocument(null)}>Stäng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
