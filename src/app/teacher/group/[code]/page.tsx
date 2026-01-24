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
} from "lucide-react";

interface GroupDetail {
  id: number;
  code: string;
  name: string;
  studentNames: string;
  phase: number;
  subPhase: string;
  projectPlanApproved: boolean;
  investigationApproved: boolean;
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
  createdAt: string;
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
    "activity" | "interviews" | "data" | "proposals" | "projectplan" | "investigation"
  >("projectplan");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectDefinition, setProjectDefinition] = useState<ProjectDefinition | null>(null);
  const [investigationReport, setInvestigationReport] = useState<InvestigationReport | null>(null);

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
      const [groupRes, proposalsRes, definitionRes, investigationRes] = await Promise.all([
        fetch(`/api/groups/${code}`),
        fetch(`/api/groups/${code}/proposals`),
        fetch(`/api/groups/${code}/project-definition`),
        fetch(`/api/groups/${code}/investigation-report`),
      ]);

      const groupData = await groupRes.json();
      const proposalsData = await proposalsRes.json();
      const definitionData = await definitionRes.json();
      const investigationData = await investigationRes.json();

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
    } catch (error) {
      console.error("Error fetching group data:", error);
    } finally {
      setLoading(false);
    }
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

      const data = await response.json();
      console.log("Approval response:", data);

      if (data.success) {
        // Refresh data
        await fetchGroupData();
        setFeedback("");
        alert(approved ? "Gruppen har godkänts!" : "Gruppen har avslagits.");
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

      const data = await response.json();
      if (data.success) {
        await fetchGroupData();
        setFeedback("");
        alert("Projektplanen har godkänts! Studenterna kan nu börja intervjua.");
      }
    } catch (error) {
      console.error("Error approving project plan:", error);
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
                Kod: {group.code} • Studenter: {group.studentNames}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  group.phase === 1
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                Fas {group.phase}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  group.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : group.status === "pending_approval"
                    ? "bg-yellow-100 text-yellow-700"
                    : group.status === "pending_investigation_approval"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {group.status === "approved"
                  ? "Godkänd"
                  : group.status === "pending_approval"
                  ? "Väntar godkännande"
                  : group.status === "pending_investigation_approval"
                  ? "Utredning väntar"
                  : "Pågående"}
              </span>
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
                Projektplan
                {!group.projectPlanApproved && projectDefinition && (
                  <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">Ny</span>
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
                Utredning
                {group.status === "pending_investigation_approval" && (
                  <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">Väntar</span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("proposals")}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "proposals"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <ClipboardList className="w-4 h-4 inline mr-1" />
                Åtgärdsförslag
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

                    {!group.projectPlanApproved && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-2">Godkänn projektplan</h4>
                        <p className="text-sm text-yellow-700 mb-4">
                          När du godkänner projektplanen får studenterna tillgång till intervjufunktionen.
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
                        <Button
                          onClick={handleProjectPlanApproval}
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {isSubmitting ? "Godkänner..." : "Godkänn projektplan"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "investigation" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Utredningsrapport</h3>
                  {group.investigationApproved ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Godkänd
                    </span>
                  ) : group.status === "pending_investigation_approval" ? (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      Väntar på godkännande
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      Ej inlämnad
                    </span>
                  )}
                </div>

                {!investigationReport ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Studenterna har inte skickat in någon utredningsrapport än.</p>
                    <p className="text-sm mt-2">Delfas: {group.subPhase}</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
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

                    {group.status === "pending_investigation_approval" && !group.investigationApproved && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="font-medium text-orange-800 mb-2">Godkänn utredning</h4>
                        <p className="text-sm text-orange-700 mb-4">
                          När du godkänner utredningen får studenterna tillgång till Fas 2 (Implementering).
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          />
                        </div>
                        <Button
                          onClick={handleInvestigationApproval}
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {isSubmitting ? "Godkänner..." : "Godkänn utredning och lås upp Fas 2"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "proposals" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Åtgärdsförslag</h3>
                {proposals.length === 0 ? (
                  <p className="text-gray-500">
                    Inga åtgärdsförslag inlämnade än.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        className="p-4 border rounded-lg bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                            {getRootCauseName(proposal.rootCauseId)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(proposal.createdAt).toLocaleString("sv-SE")}
                          </span>
                        </div>
                        <p className="text-gray-900 mb-2">{proposal.description}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          {proposal.responsible && (
                            <span>Ansvarig: {proposal.responsible}</span>
                          )}
                          {proposal.cost && (
                            <span>
                              Kostnad: {proposal.cost.toLocaleString()} SEK
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
