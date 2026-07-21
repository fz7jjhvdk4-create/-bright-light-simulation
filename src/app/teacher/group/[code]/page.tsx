"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { rootCauses } from "@/lib/root-causes";
import { roles } from "@/lib/roles";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Users,
  FileText,
  MessageSquare,
  ClipboardList,
  Eye,
} from "lucide-react";

type GateStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

interface GroupDetail {
  id: number;
  code: string;
  name: string;
  studentNames: string;
  phase: number;
  subPhase: string;
  projectPlanApproved: boolean;
  investigationApproved: boolean;
  gate1Status: GateStatus;
  gate2Status: GateStatus;
  gate3Status: GateStatus;
  gate4Status: GateStatus;
  status: string;
  createdAt: string;
}

interface InvestigationReport {
  summary: string;
  methodology: string;
  root_causes: Array<{ id: string; title: string; description: string; evidence: string }>;
  conclusions: string;
  recommendations: string;
}

interface ProjectDefinition {
  purpose: string;
  goals: string;
  scope: string;
  exclusions: string;
  success_criteria: string;
}

interface ActivityLog {
  id: number;
  timestamp: string;
  action: string;
  detail: string;
}

interface Interview {
  roleId: string;
  questionsAsked: number;
  startedAt: string;
}

interface Download {
  fileId: string;
  timestamp: string;
}

interface Proposal {
  id: number;
  rootCauseId: string;
  description: string;
  responsible: string | null;
  cost: number | null;
  timeline: string | null;
  costReduction: number | null;
  createdAt: string;
}

interface InvestigationToolsData {
  tools7qc: { completedTools: string[] } | null;
  tools7qm: { completedTools: string[] } | null;
  fiveWhy: { problem: string; responses: string[]; rootCause: string; analysis?: string } | null;
  problems: string[] | null;
}

export default function TeacherGroupDetailPage() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "activity" | "interviews" | "data" | "proposals" | "projectplan" | "gate2" | "investigation" | "gate4"
  >("projectplan");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectDefinition, setProjectDefinition] = useState<ProjectDefinition | null>(null);
  const [investigationReport, setInvestigationReport] = useState<InvestigationReport | null>(null);
  const [investigationTools, setInvestigationTools] = useState<InvestigationToolsData | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("teacher_session");
    if (session !== "authenticated") {
      router.push("/teacher");
      return;
    }

    if (code) {
      fetchGroupData();
    }
  }, [code, router]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, proposalsRes, definitionRes, investigationRes, toolsRes] = await Promise.all([
        fetch(`/api/groups/${code}`),
        fetch(`/api/groups/${code}/proposals`),
        fetch(`/api/groups/${code}/project-definition`),
        fetch(`/api/groups/${code}/investigation-report`),
        fetch(`/api/groups/${code}/investigation-tools`),
      ]);

      const groupData = await groupRes.json();
      const proposalsData = await proposalsRes.json();
      const definitionData = await definitionRes.json();
      const investigationData = await investigationRes.json();
      const toolsData = await toolsRes.json();

      if (groupData.success) {
        setGroup(groupData.group);
        setActivityLog(groupData.activityLog || []);
        setInterviews(groupData.interviews || []);
        setDownloads(groupData.downloads || []);
      }

      if (proposalsData.success) {
        setProposals(proposalsData.proposals);
      }

      if (definitionData.success && definitionData.definition) {
        setProjectDefinition(definitionData.definition);
      }

      if (investigationData.success && investigationData.report) {
        setInvestigationReport(investigationData.report);
      }

      if (toolsData.success && toolsData.data) {
        setInvestigationTools(toolsData.data);
      }
    } catch (error) {
      console.error("Error fetching group data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Session cookie expired or missing — back to login
  const redirectIfUnauthorized = (response: Response) => {
    if (response.status === 401) {
      localStorage.removeItem("teacher_session");
      router.push("/teacher");
      return true;
    }
    return false;
  };

  const handleApproval = async (approved: boolean) => {
    if (!group) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/groups/${group.code}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved, feedback }),
      });
      if (redirectIfUnauthorized(response)) return;

      const data = await response.json();
      console.log("Approval response:", data);

      if (data.success) {
        // Refresh data and force reload to ensure UI updates
        setFeedback("");
        alert(approved ? "Gruppen har godkänts!" : "Gruppen har avslagits.");
        // Force page reload to ensure fresh data
        window.location.reload();
      } else {
        alert(`Fel vid godkännande: ${data.error || "Okänt fel"}`);
        console.error("Approval failed:", data);
      }
    } catch (error) {
      console.error("Error submitting approval:", error);
      alert("Något gick fel vid godkännande. Kontrollera konsolen för mer info.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectPlanApproval = async () => {
    if (!group) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/groups/${group.code}/approve-project-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });
      if (redirectIfUnauthorized(response)) return;

      const data = await response.json();
      if (data.success) {
        setFeedback("");
        alert("Projektplanen har godkänts! Studenterna kan nu börja intervjua.");
        // Force page reload to ensure fresh data
        window.location.reload();
      } else {
        alert(`Fel vid godkännande: ${data.error || "Okänt fel"}`);
      }
    } catch (error) {
      console.error("Error approving project plan:", error);
      alert("Något gick fel vid godkännande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvestigationApproval = async () => {
    if (!group) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/groups/${group.code}/approve-investigation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });
      if (redirectIfUnauthorized(response)) return;

      const data = await response.json();
      if (data.success) {
        await fetchGroupData();
        setFeedback("");
        alert("Utredningen har godkänts! Studenterna har nu tillgång till Fas 2.");
      }
    } catch (error) {
      console.error("Error approving investigation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Four-gate approval handler
  const handleGateApproval = async (gateNumber: 1 | 2 | 3 | 4, approved: boolean) => {
    if (!group) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/groups/${group.code}/approve-gate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateNumber, approved, feedback }),
      });
      if (redirectIfUnauthorized(response)) return;

      const data = await response.json();
      if (data.success) {
        setFeedback("");
        const gateNames: Record<number, string> = { 1: 'Projektdirektiv', 2: 'Projektplan', 3: 'Utredningsrapport', 4: 'Slutredovisning' };
        if (approved) {
          alert(`${gateNames[gateNumber]} godkänd! Studenterna har nu tillgång till nästa fas.`);
        } else {
          alert(`${gateNames[gateNumber]} avvisad. Studenterna har fått feedback.`);
        }
        window.location.reload();
      } else {
        alert(`Fel vid godkännande: ${data.error || "Okänt fel"}`);
      }
    } catch (error) {
      console.error("Error processing gate approval:", error);
      alert("Något gick fel vid godkännande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? `${role.name} (${role.title})` : roleId;
  };

  const getRootCauseName = (id: string) => {
    const rc = rootCauses.find((r) => r.id === id);
    return rc?.name || id;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Laddar...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Gruppen hittades inte</p>
          <Button onClick={() => router.push("/teacher/dashboard")}>
            Tillbaka till dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push("/teacher/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Tillbaka till dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-sm text-gray-500">
                Kod: {group.code} • Studenter: {group.studentNames} • Fas: {group.phase}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/simulation/${group.code}`, '_blank')}
              >
                <Eye className="w-4 h-4 mr-1" />
                Visa studentvy
              </Button>
              {/* Four gates indicator */}
              {[
                { num: 1, name: "Gate 1", status: group.gate1Status },
                { num: 2, name: "Gate 2", status: group.gate2Status },
                { num: 3, name: "Gate 3", status: group.gate3Status },
                { num: 4, name: "Gate 4", status: group.gate4Status },
              ].map((gate) => {
                const getGateStyle = (status: GateStatus) => {
                  if (status === 'approved') return "bg-green-100 text-green-700";
                  if (status === 'pending') return "bg-yellow-100 text-yellow-700";
                  if (status === 'rejected') return "bg-red-100 text-red-700";
                  return "bg-gray-100 text-gray-400";
                };
                const getGateIcon = (status: GateStatus) => {
                  if (status === 'approved') return <CheckCircle className="w-3 h-3" />;
                  if (status === 'pending') return "⏳";
                  if (status === 'rejected') return <XCircle className="w-3 h-3" />;
                  return "—";
                };
                return (
                  <span
                    key={gate.num}
                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getGateStyle(gate.status)}`}
                    title={`${gate.name}: ${gate.status}`}
                  >
                    {getGateIcon(gate.status)}
                    {gate.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold">{interviews.length}</div>
            <div className="text-sm text-gray-500">Intervjuer</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold">{downloads.length}</div>
            <div className="text-sm text-gray-500">Nedladdade filer</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold">{proposals.length}</div>
            <div className="text-sm text-gray-500">Åtgärdsförslag</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold">{activityLog.length}</div>
            <div className="text-sm text-gray-500">Aktiviteter</div>
          </div>
        </div>

        {/* Approval section */}
        {group.status === "pending_approval" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">
              Gruppen väntar på godkännande
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback (valfritt)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Skriv feedback till studenterna..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => handleApproval(true)}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isSubmitting ? "Behandlar..." : "Godkänn"}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleApproval(false)}
                disabled={isSubmitting}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Avslå
              </Button>
            </div>
          </div>
        )}

        {/* Pending gate approval banner */}
        {(group.gate1Status === 'pending' || group.gate2Status === 'pending' || group.gate3Status === 'pending' || group.gate4Status === 'pending') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">
              {group.gate1Status === 'pending' && "Gate 1: Projektdirektiv väntar på godkännande"}
              {group.gate2Status === 'pending' && "Gate 2: Projektplan väntar på godkännande"}
              {group.gate3Status === 'pending' && "Gate 3: Utredningsrapport väntar på godkännande"}
              {group.gate4Status === 'pending' && "Gate 4: Slutredovisning väntar på godkännande"}
            </h3>
            <p className="text-sm text-yellow-700 mb-4">
              {group.gate1Status === 'pending' && "Granska projektdirektivet och godkänn för att låsa upp Fas 2 (Projektplan)."}
              {group.gate2Status === 'pending' && "Granska projektplanen och godkänn för att låsa upp Fas 3 (Utredning med intervjuer)."}
              {group.gate3Status === 'pending' && "Granska utredningsrapporten och godkänn för att låsa upp Fas 4 (Redovisning)."}
              {group.gate4Status === 'pending' && "Granska slutredovisningen och godkänn för att slutföra projektet."}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback (valfritt)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Skriv feedback till studenterna..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  const gateNum = group.gate1Status === 'pending' ? 1 : group.gate2Status === 'pending' ? 2 : group.gate3Status === 'pending' ? 3 : 4;
                  handleGateApproval(gateNum as 1 | 2 | 3 | 4, true);
                }}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isSubmitting ? "Behandlar..." : "Godkänn"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const gateNum = group.gate1Status === 'pending' ? 1 : group.gate2Status === 'pending' ? 2 : group.gate3Status === 'pending' ? 3 : 4;
                  handleGateApproval(gateNum as 1 | 2 | 3 | 4, false);
                }}
                disabled={isSubmitting}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Avslå (begär komplettering)
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b px-4">
            <div className="flex gap-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab("projectplan")}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "projectplan"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Gate 1 (Projektdirektiv)
                {group.gate1Status === 'pending' && (
                  <span className="ml-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Väntar</span>
                )}
                {group.gate1Status === 'approved' && (
                  <span className="ml-1"><CheckCircle className="w-3 h-3 inline text-green-600" /></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("gate2")}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "gate2"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Gate 2 (Projektplan)
                {group.gate2Status === 'pending' && (
                  <span className="ml-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Väntar</span>
                )}
                {group.gate2Status === 'approved' && (
                  <span className="ml-1"><CheckCircle className="w-3 h-3 inline text-green-600" /></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("investigation")}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "investigation"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Gate 3 (Utredning)
                {group.gate3Status === 'pending' && (
                  <span className="ml-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Väntar</span>
                )}
                {group.gate3Status === 'approved' && (
                  <span className="ml-1"><CheckCircle className="w-3 h-3 inline text-green-600" /></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("gate4")}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "gate4"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <ClipboardList className="w-4 h-4 inline mr-1" />
                Gate 4 (Slutredovisning)
                {group.gate4Status === 'pending' && (
                  <span className="ml-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">Väntar</span>
                )}
                {group.gate4Status === 'approved' && (
                  <span className="ml-1"><CheckCircle className="w-3 h-3 inline text-green-600" /></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("interviews")}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "interviews"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Intervjuer
              </button>
              <button
                onClick={() => setActiveTab("data")}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "data"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Nedladdad data
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "activity"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Aktivitetslogg
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "projectplan" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Projektdefinition</h3>
                  {group.projectPlanApproved ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Godkänd
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      Ej godkänd
                    </span>
                  )}
                </div>

                {!projectDefinition ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Studenterna har inte skickat in någon projektdefinition än.</p>
                    <p className="text-sm mt-2">Delfas: {group.subPhase}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium text-gray-700 mb-1">Syfte</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">{projectDefinition.purpose || <em className="text-gray-400">Ej ifyllt</em>}</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium text-gray-700 mb-1">Mål (SMART)</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">{projectDefinition.goals || <em className="text-gray-400">Ej ifyllt</em>}</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium text-gray-700 mb-1">Omfattning</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">{projectDefinition.scope || <em className="text-gray-400">Ej ifyllt</em>}</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium text-gray-700 mb-1">Avgränsningar</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">{projectDefinition.exclusions || <em className="text-gray-400">Ej ifyllt</em>}</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium text-gray-700 mb-1">Framgångskriterier</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">{projectDefinition.success_criteria || <em className="text-gray-400">Ej ifyllt</em>}</p>
                      </div>
                    </div>

                    {!group.projectPlanApproved && group.gate1Status !== 'approved' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-2">Godkänn projektdirektiv</h4>
                        <p className="text-sm text-yellow-700 mb-4">
                          Granska projektdirektivet och godkänn för att låsa upp Fas 2 (Projektplan).
                        </p>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Feedback (valfritt)
                          </label>
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Skriv feedback till studenterna..."
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
                          />
                        </div>
                        <div className="flex gap-4">
                          <Button
                            onClick={() => handleGateApproval(1, true)}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {isSubmitting ? "Godkänner..." : "Godkänn projektdirektiv"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleGateApproval(1, false)}
                            disabled={isSubmitting}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Avslå
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "gate2" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Gate 2: Projektplan</h3>
                  {group.gate2Status === 'approved' ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Godkänd
                    </span>
                  ) : group.gate2Status === 'pending' ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      Väntar på godkännande
                    </span>
                  ) : group.gate2Status === 'rejected' ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      Avvisad
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      Ej inlämnad
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Projektplanen inkluderar WBS, Gantt-schema, intressentanalys och riskanalys.
                  Studenterna arbetar med dessa verktyg i simuleringen.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium text-gray-700 mb-1">Intervjuer genomförda</h4>
                    <p className="text-2xl font-bold">{interviews.length}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium text-gray-700 mb-1">Datafiler nedladdade</h4>
                    <p className="text-2xl font-bold">{downloads.length}</p>
                  </div>
                </div>
                {group.phase < 2 && (
                  <div className="text-center py-4 text-gray-500">
                    <p>Studenterna har ännu inte nått Fas 2.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "investigation" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Gate 3: Utredningsrapport</h3>
                  {group.gate3Status === 'approved' ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Godkänd
                    </span>
                  ) : group.gate3Status === 'pending' ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      Väntar på godkännande
                    </span>
                  ) : group.gate3Status === 'rejected' ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      Avvisad
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      Ej inlämnad
                    </span>
                  )}
                </div>

                {/* Investigation tools overview */}
                {investigationTools && (
                  <div className="mb-6 space-y-4">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">Använda analysverktyg</h4>

                    {/* 7QC Tools */}
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <h5 className="font-medium text-blue-800 mb-2">7 QC-verktyg ({investigationTools.tools7qc?.completedTools?.length || 0}/7 använda)</h5>
                      {investigationTools.tools7qc?.completedTools && investigationTools.tools7qc.completedTools.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {investigationTools.tools7qc.completedTools.map((tool) => {
                            const toolNames: Record<string, string> = {
                              checksheet: "Datainsamlingsblad",
                              histogram: "Histogram",
                              pareto: "Paretodiagram",
                              causeEffect: "Orsak-verkan (Ishikawa)",
                              scatter: "Spridningsdiagram",
                              controlChart: "Styrdiagram",
                              stratification: "Stratifiering"
                            };
                            return (
                              <span key={tool} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                {toolNames[tool] || tool}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-blue-600 italic">Inga 7QC-verktyg använda</p>
                      )}
                    </div>

                    {/* 7QM Tools */}
                    <div className="p-4 border rounded-lg bg-purple-50">
                      <h5 className="font-medium text-purple-800 mb-2">7 QM-verktyg ({investigationTools.tools7qm?.completedTools?.length || 0}/7 använda)</h5>
                      {investigationTools.tools7qm?.completedTools && investigationTools.tools7qm.completedTools.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {investigationTools.tools7qm.completedTools.map((tool) => {
                            const toolNames: Record<string, string> = {
                              affinity: "Affinitetsdiagram",
                              relations: "Relationsdiagram",
                              tree: "Träddiagram",
                              matrix: "Matrisdiagram",
                              arrow: "Pildiagram",
                              pdpc: "PDPC",
                              prioritization: "Prioriteringsmatris"
                            };
                            return (
                              <span key={tool} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                                {toolNames[tool] || tool}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-purple-600 italic">Inga 7QM-verktyg använda</p>
                      )}
                    </div>

                    {/* 5 Why */}
                    {investigationTools.fiveWhy && (
                      <div className="p-4 border rounded-lg bg-orange-50">
                        <h5 className="font-medium text-orange-800 mb-2">5 Varför-analys</h5>
                        {investigationTools.fiveWhy.problem && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-orange-700">Problem: </span>
                            <span className="text-sm text-orange-600">{investigationTools.fiveWhy.problem}</span>
                          </div>
                        )}
                        {investigationTools.fiveWhy.responses && investigationTools.fiveWhy.responses.length > 0 && (
                          <div className="space-y-1 mb-2">
                            {investigationTools.fiveWhy.responses.map((response, i) => (
                              <div key={i} className="text-sm">
                                <span className="font-medium text-orange-700">Varför {i + 1}: </span>
                                <span className="text-orange-600">{response}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {investigationTools.fiveWhy.rootCause && (
                          <div className="mt-2 p-2 bg-orange-100 rounded">
                            <span className="text-sm font-medium text-orange-800">Rotorsak: </span>
                            <span className="text-sm text-orange-700">{investigationTools.fiveWhy.rootCause}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Investigation report */}
                {!investigationReport && !investigationTools ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Studenterna har inte skickat in någon utredningsrapport än.</p>
                    <p className="text-sm mt-2">Delfas: {group.subPhase}</p>
                  </div>
                ) : investigationReport ? (
                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">Utredningsrapport</h4>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium text-gray-700 mb-1">Sammanfattning</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{investigationReport.summary || <em className="text-gray-400">Ej ifyllt</em>}</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium text-gray-700 mb-1">Metodik</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{investigationReport.methodology || <em className="text-gray-400">Ej ifyllt</em>}</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium text-gray-700 mb-2">Identifierade rotorsaker ({investigationReport.root_causes?.length || 0})</h4>
                      {investigationReport.root_causes && investigationReport.root_causes.length > 0 ? (
                        <div className="space-y-3">
                          {investigationReport.root_causes.map((rc, index) => (
                            <div key={rc.id} className="p-3 bg-white border rounded">
                              <h5 className="font-medium text-gray-800">{index + 1}. {rc.title || "Utan titel"}</h5>
                              <p className="text-gray-600 text-sm mt-1">{rc.description}</p>
                              {rc.evidence && (
                                <p className="text-gray-500 text-xs mt-1 italic">Bevis: {rc.evidence}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <em className="text-gray-400">Inga rotorsaker dokumenterade</em>
                      )}
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium text-gray-700 mb-1">Slutsatser</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{investigationReport.conclusions || <em className="text-gray-400">Ej ifyllt</em>}</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium text-gray-700 mb-1">Rekommendationer</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">{investigationReport.recommendations || <em className="text-gray-400">Ej ifyllt</em>}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {activeTab === "gate4" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Gate 4: Slutredovisning — Åtgärdsmatris</h3>
                  {group.gate4Status === 'approved' ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Godkänd
                    </span>
                  ) : group.gate4Status === 'pending' ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      Väntar på godkännande
                    </span>
                  ) : group.gate4Status === 'rejected' ? (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      Avvisad
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      Ej inlämnad
                    </span>
                  )}
                </div>

                {proposals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Inga åtgärdsförslag inlämnade än.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border p-3 text-left font-semibold text-gray-700">Rotorsak</th>
                            <th className="border p-3 text-left font-semibold text-gray-700">Aktivitet</th>
                            <th className="border p-3 text-left font-semibold text-gray-700">Ansvarig</th>
                            <th className="border p-3 text-left font-semibold text-gray-700">Tidplan</th>
                            <th className="border p-3 text-right font-semibold text-gray-700">Kostnad (SEK)</th>
                            <th className="border p-3 text-right font-semibold text-gray-700">Förväntad besparing (SEK)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {proposals.map((proposal) => (
                            <tr key={proposal.id} className="hover:bg-gray-50">
                              <td className="border p-3">
                                <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                                  {getRootCauseName(proposal.rootCauseId)}
                                </span>
                              </td>
                              <td className="border p-3 text-gray-900">{proposal.description}</td>
                              <td className="border p-3 text-gray-700">{proposal.responsible || <em className="text-gray-400">—</em>}</td>
                              <td className="border p-3 text-gray-700">{proposal.timeline || <em className="text-gray-400">—</em>}</td>
                              <td className="border p-3 text-right text-gray-700">
                                {proposal.cost != null && proposal.cost > 0
                                  ? proposal.cost.toLocaleString("sv-SE")
                                  : <em className="text-gray-400">—</em>}
                              </td>
                              <td className="border p-3 text-right font-medium text-green-700">
                                {proposal.costReduction != null && proposal.costReduction > 0
                                  ? proposal.costReduction.toLocaleString("sv-SE")
                                  : <em className="text-gray-400">—</em>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50 font-semibold">
                            <td className="border p-3" colSpan={4}>Totalt</td>
                            <td className="border p-3 text-right">
                              {proposals.reduce((sum, p) => sum + (p.cost || 0), 0).toLocaleString("sv-SE")}
                            </td>
                            <td className="border p-3 text-right text-green-700">
                              {proposals.reduce((sum, p) => sum + (p.costReduction || 0), 0).toLocaleString("sv-SE")}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg bg-gray-50 text-center">
                        <div className="text-sm text-gray-500 mb-1">Antal åtgärder</div>
                        <div className="text-2xl font-bold">{proposals.length}</div>
                      </div>
                      <div className="p-4 border rounded-lg bg-gray-50 text-center">
                        <div className="text-sm text-gray-500 mb-1">Total kostnad</div>
                        <div className="text-2xl font-bold">
                          {proposals.reduce((sum, p) => sum + (p.cost || 0), 0).toLocaleString("sv-SE")} SEK
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg bg-green-50 text-center">
                        <div className="text-sm text-green-600 mb-1">Förväntad total besparing</div>
                        <div className="text-2xl font-bold text-green-700">
                          {proposals.reduce((sum, p) => sum + (p.costReduction || 0), 0).toLocaleString("sv-SE")} SEK
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "interviews" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Genomförda intervjuer</h3>
                {interviews.length === 0 ? (
                  <p className="text-gray-500">Inga intervjuer genomförda än.</p>
                ) : (
                  <div className="space-y-2">
                    {interviews.map((interview) => (
                      <div
                        key={interview.roleId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span className="font-medium">
                          {getRoleName(interview.roleId)}
                        </span>
                        <div className="text-sm text-gray-500">
                          {interview.questionsAsked} frågor •{" "}
                          {new Date(interview.startedAt).toLocaleDateString("sv-SE")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "data" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Nedladdade datafiler</h3>
                {downloads.length === 0 ? (
                  <p className="text-gray-500">Inga filer nedladdade än.</p>
                ) : (
                  <div className="space-y-2">
                    {downloads.map((download) => (
                      <div
                        key={download.fileId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span className="font-medium">{download.fileId}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(download.timestamp).toLocaleString("sv-SE")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Aktivitetslogg</h3>
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
                            {log.action}
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
      </main>
    </div>
  );
}
