"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { getRoleById } from "@/lib/roles";
import { rootCauses, getRootCauseById } from "@/lib/root-causes";
import { exportAsPDF, downloadBlob } from "@/lib/export-utils";
import { MAX_INTERVIEW_QUESTIONS } from "@/lib/interview";

interface LabReport {
  group: {
    name: string;
    code: string;
    studentNames: string;
    phase: number;
    gate1Status: string;
    gate2Status: string;
    gate3Status: string;
    gate4Status: string;
    status: string;
  };
  projectDefinition: {
    purpose: string;
    goals: string;
    scope: string;
    exclusions: string;
    success_criteria: string;
  } | null;
  investigationReport: {
    summary: string;
    methodology: string;
    root_causes: Array<{ id: string; title: string; description: string; evidence: string }>;
    conclusions: string;
    recommendations: string;
  } | null;
  tools: {
    tools7qc: {
      completedTools?: string[];
      pareto?: { title: string; items: { name: string; count: number }[] };
      causeEffect?: Array<{ id: string; problem: string; categories: { name: string; causes: string[] }[] }>;
    } | null;
    tools7qm: {
      completedTools?: string[];
      affinity?: { title: string; groups: { name: string; items: string[] }[] };
      tree?: { title: string; goal: string; branches: { name: string; subBranches: string[] }[] };
    } | null;
    fiveWhy: {
      problem?: string;
      whys?: string[];
      analysis?: { rootCause: string; solutions: Array<{ title: string; description: string }> } | null;
    } | null;
  };
  proposals: Array<{
    rootCauseId: string;
    description: string;
    responsible: string | null;
    cost: number | null;
    timeline: string | null;
    costReduction: number | null;
  }>;
  budgetAllocations: Array<{ proposalId: number; allocated: number; notes: string }>;
  finalReport: {
    executive_summary: string;
    results_vs_goals: string;
    budget_summary: string;
    lessons_learned: string;
    recommendations: string;
  } | null;
  interviews: Array<{ roleId: string; questionsAsked: number }>;
  questions: Array<{ roleId: string; content: string; timestamp: string }>;
  downloadsCount: number;
}

const QC_TOOL_NAMES: Record<string, string> = {
  checksheet: "Datainsamlingsblad", histogram: "Histogram", pareto: "Paretodiagram",
  causeEffect: "Ishikawa", scatter: "Spridningsdiagram", controlChart: "Styrdiagram",
  stratification: "Stratifiering",
};
const QM_TOOL_NAMES: Record<string, string> = {
  affinity: "Affinitetsdiagram", relations: "Relationsdiagram", tree: "Träddiagram",
  arrow: "Pildiagram", pdpc: "PDPC", prioritization: "Prioriteringsmatris",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold border-b pb-1 mb-3">{title}</h3>
      {children}
    </section>
  );
}

function TextField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="mb-3">
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className="text-sm text-gray-900 whitespace-pre-wrap">
        {value?.trim() ? value : <span className="text-gray-400 italic">Ej ifyllt</span>}
      </div>
    </div>
  );
}

function ToolChips({ completed, names }: { completed: string[]; names: Record<string, string> }) {
  const keys = Object.keys(names);
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {keys.map(key => {
        const done = completed.includes(key);
        return (
          <span
            key={key}
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
            }`}
          >
            {names[key]}{done ? " ✓" : ""}
          </span>
        );
      })}
    </div>
  );
}

export function TeacherLabReport({ groupCode }: { groupCode: string }) {
  const [report, setReport] = useState<LabReport | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/teacher/lab-report/${groupCode}`);
        const data = await response.json();
        if (response.ok && data.success) {
          setReport(data.report);
        } else {
          setError(data.error || "Kunde inte hämta labbrapporten");
        }
      } catch {
        setError("Kunde inte nå servern");
      } finally {
        setLoading(false);
      }
    })();
  }, [groupCode]);

  const handleExportPDF = async () => {
    if (!report) return;
    try {
      const blob = await exportAsPDF(
        "lab-report-content",
        `labbrapport-${report.group.code}.pdf`,
        `Labbrapport — ${report.group.name}`
      );
      downloadBlob(blob, `labbrapport-${report.group.code}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Kunde inte exportera som PDF");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }
  if (error || !report) {
    return <div className="p-6 text-red-600 text-sm">{error || "Ingen rapportdata"}</div>;
  }

  // Group questions by role, in interview order
  const questionsByRole = new Map<string, string[]>();
  for (const q of report.questions) {
    const list = questionsByRole.get(q.roleId) ?? [];
    list.push(q.content);
    questionsByRole.set(q.roleId, list);
  }

  // Same result model as the students' final report: addressed root causes
  // determine the projected complaint reduction against the 50% target
  const addressedRootCauses = new Set(report.proposals.map(p => p.rootCauseId));
  const baseReduction = rootCauses.reduce(
    (sum, rc) => sum + (addressedRootCauses.has(rc.id) ? rc.impact : 0), 0
  );
  const reductionPercent = Math.round(Math.min(1, baseReduction) * 100);
  const totalCost = report.proposals.reduce((sum, p) => sum + (p.cost || 0), 0);
  const projectedSavings = 4.8 * Math.min(1, baseReduction);

  const completed7qc = report.tools.tools7qc?.completedTools ?? [];
  const completed7qm = report.tools.tools7qm?.completedTools ?? [];
  const pareto = report.tools.tools7qc?.pareto;
  const paretoItems = (pareto?.items ?? []).filter(i => i.count > 0).sort((a, b) => b.count - a.count);
  const paretoTotal = paretoItems.reduce((s, i) => s + i.count, 0);
  const fiveWhy = report.tools.fiveWhy;
  const gates = [
    report.group.gate1Status, report.group.gate2Status,
    report.group.gate3Status, report.group.gate4Status,
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          Samlad bild av gruppens arbete — planering, verktygsanvändning, intervjuer och lösning.
        </p>
        <Button size="sm" variant="outline" onClick={handleExportPDF}>
          <FileText className="w-4 h-4 mr-1" />
          Exportera PDF
        </Button>
      </div>

      <div id="lab-report-content" className="bg-white p-6 rounded-lg border">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold">Labbrapport — {report.group.name} ({report.group.code})</h2>
          <p className="text-sm text-gray-600">Studenter: {report.group.studentNames}</p>
          <p className="text-sm text-gray-600">
            Fas {report.group.phase} · Gates:{" "}
            {gates.map((s, i) => `G${i + 1} ${s === "approved" ? "✓" : s === "pending" ? "⏳" : s === "rejected" ? "✗" : "–"}`).join("  ")}
            {" "}· {new Date().toLocaleDateString("sv-SE")}
          </p>
        </div>

        {/* Summary stats */}
        <Section title="Sammanfattning">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { value: report.interviews.length, label: "roller intervjuade" },
              { value: report.questions.length, label: "frågor ställda" },
              { value: completed7qc.length + completed7qm.length, label: "verktyg avklarade" },
              { value: report.proposals.length, label: "åtgärdsförslag" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-800">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Planning */}
        <Section title="1. Planering — Projektdefinition">
          {report.projectDefinition ? (
            <>
              <TextField label="Syfte" value={report.projectDefinition.purpose} />
              <TextField label="Mål" value={report.projectDefinition.goals} />
              <TextField label="Omfattning" value={report.projectDefinition.scope} />
              <TextField label="Avgränsningar" value={report.projectDefinition.exclusions} />
              <TextField label="Framgångskriterier" value={report.projectDefinition.success_criteria} />
            </>
          ) : (
            <p className="text-sm text-gray-400 italic">Ingen projektdefinition sparad.</p>
          )}
        </Section>

        {/* Tools */}
        <Section title="2. Verktygsanvändning">
          <h4 className="text-sm font-semibold mb-1">7QC — Kvalitetsverktyg</h4>
          <ToolChips completed={completed7qc} names={QC_TOOL_NAMES} />

          {paretoItems.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-1">
                Paretodiagram: {pareto?.title}
              </div>
              <table className="text-sm w-full max-w-md">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="py-1">Feltyp</th><th>Antal</th><th>Andel</th>
                  </tr>
                </thead>
                <tbody>
                  {paretoItems.map(item => (
                    <tr key={item.name} className="border-b border-gray-100">
                      <td className="py-1">{item.name}</td>
                      <td>{item.count}</td>
                      <td>{paretoTotal > 0 ? `${Math.round((item.count / paretoTotal) * 100)} %` : "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(report.tools.tools7qc?.causeEffect ?? [])
            .filter(d => d.categories.some(c => c.causes.length > 0))
            .map(diagram => (
              <div key={diagram.id} className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Ishikawa: {diagram.problem}</div>
                <ul className="text-sm list-disc pl-5">
                  {diagram.categories.filter(c => c.causes.length > 0).map(c => (
                    <li key={c.name}><strong>{c.name}:</strong> {c.causes.join(", ")}</li>
                  ))}
                </ul>
              </div>
            ))}

          {fiveWhy?.problem && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-1">5 Varför: {fiveWhy.problem}</div>
              <ol className="text-sm list-decimal pl-5">
                {(fiveWhy.whys ?? []).filter(w => w.trim()).map((why, i) => <li key={i}>{why}</li>)}
              </ol>
              {fiveWhy.analysis?.rootCause && (
                <p className="text-sm mt-1"><strong>Identifierad rotorsak:</strong> {fiveWhy.analysis.rootCause}</p>
              )}
            </div>
          )}

          <h4 className="text-sm font-semibold mb-1 mt-4">7QM — Ledningsverktyg</h4>
          <ToolChips completed={completed7qm} names={QM_TOOL_NAMES} />

          {(report.tools.tools7qm?.affinity?.groups ?? []).some(g => g.items.length > 0) && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-1">
                Affinitetsdiagram: {report.tools.tools7qm?.affinity?.title}
              </div>
              <ul className="text-sm list-disc pl-5">
                {(report.tools.tools7qm?.affinity?.groups ?? [])
                  .filter(g => g.items.length > 0)
                  .map(g => <li key={g.name}><strong>{g.name}:</strong> {g.items.join(", ")}</li>)}
              </ul>
            </div>
          )}

          {(report.tools.tools7qm?.tree?.branches ?? []).some(b => b.subBranches.length > 0) && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-1">
                Träddiagram: {report.tools.tools7qm?.tree?.goal || report.tools.tools7qm?.tree?.title}
              </div>
              <ul className="text-sm list-disc pl-5">
                {(report.tools.tools7qm?.tree?.branches ?? [])
                  .filter(b => b.name.trim())
                  .map((b, i) => <li key={i}><strong>{b.name}:</strong> {b.subBranches.join(", ")}</li>)}
              </ul>
            </div>
          )}
        </Section>

        {/* Investigation report */}
        <Section title="3. Utredningsrapport">
          {report.investigationReport ? (
            <>
              <TextField label="Sammanfattning" value={report.investigationReport.summary} />
              <TextField label="Metod" value={report.investigationReport.methodology} />
              {report.investigationReport.root_causes.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Identifierade rotorsaker</div>
                  <ul className="text-sm list-disc pl-5">
                    {report.investigationReport.root_causes.map((rc, i) => (
                      <li key={i}><strong>{rc.title}</strong>{rc.evidence ? ` — bevis: ${rc.evidence}` : ""}</li>
                    ))}
                  </ul>
                </div>
              )}
              <TextField label="Slutsatser" value={report.investigationReport.conclusions} />
              <TextField label="Rekommendationer" value={report.investigationReport.recommendations} />
            </>
          ) : (
            <p className="text-sm text-gray-400 italic">Ingen utredningsrapport sparad.</p>
          )}
        </Section>

        {/* Interviews */}
        <Section title="4. Intervjuer — ställda frågor">
          {report.interviews.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Inga intervjuer genomförda.</p>
          ) : (
            report.interviews.map(interview => {
              const role = getRoleById(interview.roleId);
              const questions = questionsByRole.get(interview.roleId) ?? [];
              return (
                <div key={interview.roleId} className="mb-4">
                  <div className="text-sm font-medium text-gray-700">
                    {role ? `${role.name} (${role.title})` : interview.roleId}
                    <span className="ml-2 text-xs text-gray-400">
                      {interview.questionsAsked}/{MAX_INTERVIEW_QUESTIONS} frågor
                    </span>
                  </div>
                  <ol className="text-sm list-decimal pl-5 text-gray-800">
                    {questions.map((q, i) => <li key={i}>{q}</li>)}
                  </ol>
                </div>
              );
            })
          )}
        </Section>

        {/* Solution */}
        <Section title="5. Lösning — Åtgärder och resultat">
          {report.proposals.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Inga åtgärdsförslag ännu.</p>
          ) : (
            <>
              <div className="overflow-x-auto mb-3">
                <table className="text-sm w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b">
                      <th className="py-1 pr-2">Rotorsak</th>
                      <th className="pr-2">Åtgärd</th>
                      <th className="pr-2">Ansvarig</th>
                      <th className="pr-2">Tidplan</th>
                      <th>Kostnad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.proposals.map((p, i) => (
                      <tr key={i} className="border-b border-gray-100 align-top">
                        <td className="py-1 pr-2 whitespace-nowrap">{getRootCauseById(p.rootCauseId)?.name ?? p.rootCauseId}</td>
                        <td className="pr-2">{p.description}</td>
                        <td className="pr-2">{p.responsible || "–"}</td>
                        <td className="pr-2">{p.timeline || "–"}</td>
                        <td className="whitespace-nowrap">{p.cost ? `${p.cost.toLocaleString("sv-SE")} kr` : "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xl font-bold">{totalCost.toLocaleString("sv-SE")} kr</div>
                  <div className="text-xs text-gray-500">total åtgärdskostnad (budget 800 000 kr)</div>
                </div>
                <div className={`rounded-lg p-3 ${reductionPercent >= 50 ? "bg-green-50" : "bg-yellow-50"}`}>
                  <div className="text-xl font-bold">{reductionPercent} %</div>
                  <div className="text-xs text-gray-500">beräknad reklamationsminskning (mål 50 %)</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xl font-bold">{projectedSavings.toFixed(1)} MSEK</div>
                  <div className="text-xs text-gray-500">beräknad årlig besparing</div>
                </div>
              </div>
            </>
          )}
        </Section>

        {/* Final report */}
        {report.finalReport && (
          <Section title="6. Slutrapport">
            <TextField label="Sammanfattning" value={report.finalReport.executive_summary} />
            <TextField label="Resultat mot mål" value={report.finalReport.results_vs_goals} />
            <TextField label="Budgetuppföljning" value={report.finalReport.budget_summary} />
            <TextField label="Lärdomar" value={report.finalReport.lessons_learned} />
            <TextField label="Rekommendationer" value={report.finalReport.recommendations} />
          </Section>
        )}
      </div>
    </div>
  );
}
