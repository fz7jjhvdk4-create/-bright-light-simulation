"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, AlertCircle, Send, Loader2 } from "lucide-react";
import { useAutosave, autosaveLabel } from "@/hooks/useAutosave";

interface RootCause {
  id: string;
  title: string;
  description: string;
  evidence: string;
}

interface ActionProposal {
  id: string;
  rootCauseId: string;
  description: string;
  responsible: string;
  estimatedCost: number;
  estimatedEffect: string;
  priority: 'high' | 'medium' | 'low';
}

interface InvestigationReportProps {
  groupCode: string;
  onSubmit: () => void;
  isSubmitted?: boolean;
}

export function InvestigationReport({ groupCode, onSubmit, isSubmitted = false }: InvestigationReportProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Report sections
  const [summary, setSummary] = useState("");
  const [methodology, setMethodology] = useState("");
  const [rootCauses, setRootCauses] = useState<RootCause[]>([]);
  const [actionProposals, setActionProposals] = useState<ActionProposal[]>([]);
  const [conclusions, setConclusions] = useState("");
  const [recommendations, setRecommendations] = useState("");

  const reportData = useMemo(() => ({
    summary,
    methodology,
    root_causes: rootCauses,
    conclusions,
    recommendations,
  }), [summary, methodology, rootCauses, conclusions, recommendations]);

  const postReport = useCallback(async (report: typeof reportData) => {
    const response = await fetch(`/api/groups/${groupCode}/investigation-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    });
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || "Kunde inte spara");
    }
  }, [groupCode]);

  const { status: autosaveStatus, markSaved } = useAutosave(reportData, postReport);

  useEffect(() => {
    loadReport();
    loadProposals();
  }, [groupCode]);

  const loadReport = async () => {
    try {
      const response = await fetch(`/api/groups/${groupCode}/investigation-report`);
      const data = await response.json();
      if (data.success && data.report) {
        setSummary(data.report.summary || "");
        setMethodology(data.report.methodology || "");
        setRootCauses(data.report.root_causes || []);
        setConclusions(data.report.conclusions || "");
        setRecommendations(data.report.recommendations || "");
        markSaved({
          summary: data.report.summary || "",
          methodology: data.report.methodology || "",
          root_causes: data.report.root_causes || [],
          conclusions: data.report.conclusions || "",
          recommendations: data.report.recommendations || "",
        });
      }
    } catch (error) {
      console.error("Error loading report:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProposals = async () => {
    try {
      const response = await fetch(`/api/groups/${groupCode}/proposals`);
      const data = await response.json();
      if (data.success && data.proposals) {
        setActionProposals(data.proposals.map((p: {
          id: number;
          root_cause_id: string;
          description: string;
          responsible: string | null;
          cost: number | null;
        }) => ({
          id: String(p.id),
          rootCauseId: p.root_cause_id,
          description: p.description,
          responsible: p.responsible || "",
          estimatedCost: p.cost || 0,
          estimatedEffect: "",
          priority: "medium" as const
        })));
      }
    } catch (error) {
      console.error("Error loading proposals:", error);
    }
  };

  const saveReport = async () => {
    setSaving(true);
    try {
      await postReport(reportData);
      markSaved(reportData);
    } catch (error) {
      console.error("Error saving report:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!summary || !methodology || rootCauses.length === 0 || actionProposals.length === 0) {
      alert("Vänligen fyll i alla obligatoriska fält innan inlämning.");
      return;
    }

    setSubmitting(true);
    try {
      // Save the report first
      await saveReport();

      // Then submit for approval
      const response = await fetch(`/api/groups/${groupCode}/submit-investigation`, {
        method: "POST"
      });
      const data = await response.json();
      if (data.success) {
        onSubmit();
      } else {
        alert(`Kunde inte skicka in: ${data.error}`);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Ett fel uppstod vid inlämning.");
    } finally {
      setSubmitting(false);
    }
  };

  const addRootCause = () => {
    setRootCauses(prev => [...prev, {
      id: `rc-${Date.now()}`,
      title: "",
      description: "",
      evidence: ""
    }]);
  };

  const updateRootCause = (index: number, field: keyof RootCause, value: string) => {
    setRootCauses(prev => prev.map((rc, i) =>
      i === index ? { ...rc, [field]: value } : rc
    ));
  };

  const removeRootCause = (index: number) => {
    setRootCauses(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const isFormValid = summary && methodology && rootCauses.length > 0 && actionProposals.length > 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Utredningsrapport
            </h2>
            <p className="text-gray-600">
              Sammanfatta er utredning av kvalitetsproblemen. Denna rapport kommer att granskas av läraren.
            </p>
            {!isSubmitted && (
              <p className={`text-sm mt-1 min-h-5 ${autosaveStatus === "error" ? "text-red-600" : "text-gray-400"}`}>
                {autosaveLabel(autosaveStatus)}
              </p>
            )}
          </div>

          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Rapport inskickad
              </h3>
              <p className="text-green-700">
                Er utredningsrapport har skickats in för granskning.
                Invänta lärarens godkännande för att fortsätta.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Executive Summary */}
              <section>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Sammanfattning *
                </h3>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  onBlur={saveReport}
                  placeholder="Ge en kort sammanfattning av utredningens syfte, genomförande och huvudsakliga fynd..."
                  className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </section>

              {/* Methodology */}
              <section>
                <h3 className="text-lg font-semibold mb-3">Metodik *</h3>
                <textarea
                  value={methodology}
                  onChange={(e) => setMethodology(e.target.value)}
                  onBlur={saveReport}
                  placeholder="Beskriv hur ni genomförde utredningen: vilka intervjuade ni, vilka data analyserade ni, vilka metoder använde ni..."
                  className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </section>

              {/* Root Causes */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Identifierade rotorsaker *</h3>
                  <Button onClick={addRootCause} variant="outline" size="sm">
                    + Lägg till rotorsak
                  </Button>
                </div>

                {rootCauses.length === 0 ? (
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">
                      Lägg till de rotorsaker ni identifierat under utredningen.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rootCauses.map((rc, index) => (
                      <div key={rc.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-medium text-gray-500">
                            Rotorsak {index + 1}
                          </span>
                          <button
                            onClick={() => removeRootCause(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Ta bort
                          </button>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={rc.title}
                            onChange={(e) => updateRootCause(index, "title", e.target.value)}
                            onBlur={saveReport}
                            placeholder="Titel (t.ex. 'Bristfällig kvalitetskontroll')"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <textarea
                            value={rc.description}
                            onChange={(e) => updateRootCause(index, "description", e.target.value)}
                            onBlur={saveReport}
                            placeholder="Beskriv rotorsaken i detalj..."
                            className="w-full h-20 p-2 border rounded resize-none focus:ring-2 focus:ring-blue-500"
                          />
                          <textarea
                            value={rc.evidence}
                            onChange={(e) => updateRootCause(index, "evidence", e.target.value)}
                            onBlur={saveReport}
                            placeholder="Vilka bevis/data stödjer denna slutsats?"
                            className="w-full h-16 p-2 border rounded resize-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Action Proposals Summary */}
              <section>
                <h3 className="text-lg font-semibold mb-3">Åtgärdsförslag</h3>
                {actionProposals.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      Ni har inga åtgärdsförslag registrerade. Gå till verktyget &quot;Handlingsplan&quot;
                      under Verktyg-fliken för att lägga till era förslag.
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Ni har registrerat {actionProposals.length} åtgärdsförslag:
                    </p>
                    <ul className="space-y-2">
                      {actionProposals.map((proposal, index) => (
                        <li key={proposal.id} className="flex items-start gap-2 text-sm">
                          <span className="text-green-600">✓</span>
                          <span>{proposal.description || `Åtgärd ${index + 1}`}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {/* Conclusions */}
              <section>
                <h3 className="text-lg font-semibold mb-3">Slutsatser *</h3>
                <textarea
                  value={conclusions}
                  onChange={(e) => setConclusions(e.target.value)}
                  onBlur={saveReport}
                  placeholder="Vad är de viktigaste slutsatserna från utredningen? Vad har ni lärt er?"
                  className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </section>

              {/* Recommendations */}
              <section>
                <h3 className="text-lg font-semibold mb-3">Rekommendationer</h3>
                <textarea
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  onBlur={saveReport}
                  placeholder="Vilka rekommendationer har ni för nästa fas? Vad bör prioriteras?"
                  className="w-full h-24 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </section>

              {/* Validation summary */}
              <section className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Checklista för inlämning</h4>
                <ul className="space-y-2 text-sm">
                  <li className={`flex items-center gap-2 ${summary ? "text-green-700" : "text-gray-500"}`}>
                    {summary ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    Sammanfattning ifylld
                  </li>
                  <li className={`flex items-center gap-2 ${methodology ? "text-green-700" : "text-gray-500"}`}>
                    {methodology ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    Metodik beskriven
                  </li>
                  <li className={`flex items-center gap-2 ${rootCauses.length > 0 ? "text-green-700" : "text-gray-500"}`}>
                    {rootCauses.length > 0 ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    Minst en rotorsak identifierad ({rootCauses.length} st)
                  </li>
                  <li className={`flex items-center gap-2 ${actionProposals.length > 0 ? "text-green-700" : "text-gray-500"}`}>
                    {actionProposals.length > 0 ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    Åtgärdsförslag registrerade ({actionProposals.length} st)
                  </li>
                  <li className={`flex items-center gap-2 ${conclusions ? "text-green-700" : "text-gray-500"}`}>
                    {conclusions ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    Slutsatser formulerade
                  </li>
                </ul>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Sticky submit footer - always visible */}
      {!isSubmitted && (
        <div className="border-t bg-white p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {isFormValid ? (
                <span className="text-green-600">Alla obligatoriska fält är ifyllda</span>
              ) : (
                <span>Fyll i alla obligatoriska fält (*) innan inlämning</span>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !isFormValid}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Skickar in...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Skicka in för godkännande
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
