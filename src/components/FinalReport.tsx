"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Download, Send, Loader2, Award, TrendingDown, DollarSign } from "lucide-react";
import { rootCauses } from "@/lib/root-causes";

interface Proposal {
  id: number;
  rootCauseId: string;
  description: string;
  responsible: string | null;
  cost: number | null;
}

interface FinalReportProps {
  groupCode: string;
  groupName: string;
  proposals: Proposal[];
  onSubmit?: () => void;
}

export function FinalReport({ groupCode, groupName, proposals, onSubmit }: FinalReportProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [executiveSummary, setExecutiveSummary] = useState("");
  const [resultsVsGoals, setResultsVsGoals] = useState("");
  const [budgetSummary, setBudgetSummary] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");
  const [recommendations, setRecommendations] = useState("");

  const [eventImpact, setEventImpact] = useState(0);

  useEffect(() => {
    loadReport();
    loadEventImpact();
  }, [groupCode]);

  const loadReport = async () => {
    try {
      const response = await fetch(`/api/groups/${groupCode}/final-report`);
      const data = await response.json();
      if (data.success && data.report) {
        setExecutiveSummary(data.report.executive_summary || "");
        setResultsVsGoals(data.report.results_vs_goals || "");
        setBudgetSummary(data.report.budget_summary || "");
        setLessonsLearned(data.report.lessons_learned || "");
        setRecommendations(data.report.recommendations || "");
      }
    } catch (error) {
      console.error("Error loading report:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadEventImpact = () => {
    const savedEvents = localStorage.getItem(`events-${groupCode}`);
    if (savedEvents) {
      const events = JSON.parse(savedEvents);
      let totalImpact = 0;
      events.forEach((event: { resolved: boolean; chosenOption?: string; choices: { id: string; impact: number }[] }) => {
        if (event.resolved && event.chosenOption) {
          const choice = event.choices.find((c: { id: string }) => c.id === event.chosenOption);
          if (choice) totalImpact += choice.impact;
        }
      });
      setEventImpact(totalImpact);
    }
  };

  const saveReport = async () => {
    setSaving(true);
    try {
      await fetch(`/api/groups/${groupCode}/final-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          executive_summary: executiveSummary,
          results_vs_goals: resultsVsGoals,
          budget_summary: budgetSummary,
          lessons_learned: lessonsLearned,
          recommendations
        })
      });
    } catch (error) {
      console.error("Error saving report:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await saveReport();
      await fetch(`/api/groups/${groupCode}/complete-project`, {
        method: "POST"
      });
      onSubmit?.();
      alert("Projektet är nu avslutat! Rapporten har skickats in.");
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate results
  const addressedRootCauses = new Set(proposals.map(p => p.rootCauseId));
  let baseReduction = 0;
  rootCauses.forEach(rc => {
    if (addressedRootCauses.has(rc.id)) {
      baseReduction += rc.impact;
    }
  });
  const eventModifier = eventImpact * 0.05;
  const totalReduction = Math.min(1, Math.max(0, baseReduction + eventModifier));
  const reductionPercent = Math.round(totalReduction * 100);
  const currentCost = 4.8;
  const savings = currentCost * totalReduction;
  const totalProposalCost = proposals.reduce((sum, p) => sum + (p.cost || 0), 0);
  const goalMet = reductionPercent >= 50;

  const exportPDF = () => {
    let content = `
SLUTRAPPORT - KVALITETSFÖRBÄTTRINGSPROJEKT
==========================================
Bright Light Solutions AB
Grupp: ${groupName} (${groupCode})
Datum: ${new Date().toLocaleDateString("sv-SE")}

==========================================
SAMMANFATTNING
==========================================
${executiveSummary || "(Ej ifylld)"}

==========================================
RESULTAT VS MÅL
==========================================
Mål: Minska reklamationskostnader med 50%
Resultat: ${reductionPercent}% reduktion
Status: ${goalMet ? "MÅL UPPNÅTT" : "MÅL EJ UPPNÅTT"}

Förväntad besparing: ${savings.toFixed(1)} MSEK/år
Projektkostnad: ${(totalProposalCost / 1000000).toFixed(2)} MSEK

${resultsVsGoals || "(Ej ifylld)"}

==========================================
BUDGETSAMMANFATTNING
==========================================
Total budget: 800 000 SEK
Förbrukad: ${totalProposalCost.toLocaleString()} SEK
${budgetSummary || "(Ej ifylld)"}

==========================================
GENOMFÖRDA ÅTGÄRDER
==========================================
${proposals.map((p, i) => `${i + 1}. ${p.description}
   Ansvarig: ${p.responsible || "Ej angiven"}
   Kostnad: ${p.cost?.toLocaleString() || "Ej angiven"} SEK`).join("\n\n")}

==========================================
LÄRDOMAR
==========================================
${lessonsLearned || "(Ej ifylld)"}

==========================================
REKOMMENDATIONER
==========================================
${recommendations || "(Ej ifylld)"}

==========================================
ADRESSERADE ROTORSAKER
==========================================
${rootCauses.filter(rc => addressedRootCauses.has(rc.id)).map(rc => `✓ ${rc.name} (${Math.round(rc.impact * 100)}%)`).join("\n")}

${rootCauses.filter(rc => !addressedRootCauses.has(rc.id)).length > 0 ? `
EJ ADRESSERADE ROTORSAKER
-------------------------
${rootCauses.filter(rc => !addressedRootCauses.has(rc.id)).map(rc => `✗ ${rc.name} (${Math.round(rc.impact * 100)}%)`).join("\n")}
` : ""}

==========================================
Rapport genererad av BLS Simuleringssystem
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `slutrapport-${groupCode}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Slutrapport</h2>
        <p className="text-gray-600">
          Sammanfatta projektet och dokumentera lärdomar för framtiden.
        </p>
      </div>

      {/* Results summary card */}
      <div className={`p-6 rounded-lg border-2 mb-6 ${goalMet ? "border-green-300 bg-green-50" : "border-yellow-300 bg-yellow-50"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {goalMet ? (
              <Award className="w-12 h-12 text-green-500" />
            ) : (
              <TrendingDown className="w-12 h-12 text-yellow-500" />
            )}
            <div>
              <h3 className="text-2xl font-bold">{reductionPercent}% reduktion</h3>
              <p className={goalMet ? "text-green-600" : "text-yellow-600"}>
                {goalMet ? "Målet på 50% är uppnått!" : "Målet på 50% uppnåddes inte"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-green-600">
              <DollarSign className="w-6 h-6" />
              <span className="text-3xl font-bold">{savings.toFixed(1)} MSEK</span>
            </div>
            <p className="text-sm text-gray-500">Förväntad årlig besparing</p>
          </div>
        </div>
      </div>

      {/* Report sections */}
      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Sammanfattning för ledningen
          </h3>
          <textarea
            value={executiveSummary}
            onChange={(e) => setExecutiveSummary(e.target.value)}
            onBlur={saveReport}
            placeholder="Skriv en kort sammanfattning av projektet, dess mål och resultat..."
            className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
          />
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Resultat vs mål</h3>
          <textarea
            value={resultsVsGoals}
            onChange={(e) => setResultsVsGoals(e.target.value)}
            onBlur={saveReport}
            placeholder="Jämför de uppnådda resultaten med de ursprungliga målen. Vad gick bra? Vad kunde ha gjorts bättre?"
            className="w-full h-28 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
          />
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Budgetsammanfattning</h3>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total budget</p>
              <p className="text-xl font-bold">800 000 SEK</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Förbrukad</p>
              <p className="text-xl font-bold">{totalProposalCost.toLocaleString()} SEK</p>
            </div>
          </div>
          <textarea
            value={budgetSummary}
            onChange={(e) => setBudgetSummary(e.target.value)}
            onBlur={saveReport}
            placeholder="Kommentera budgetutfallet. Fanns det oväntade kostnader?"
            className="w-full h-20 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
          />
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Lärdomar (Lessons Learned)</h3>
          <textarea
            value={lessonsLearned}
            onChange={(e) => setLessonsLearned(e.target.value)}
            onBlur={saveReport}
            placeholder="Vilka lärdomar tar ni med er från projektet? Vad fungerade bra/dåligt? Vad skulle ni göra annorlunda?"
            className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
          />
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Rekommendationer</h3>
          <textarea
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            onBlur={saveReport}
            placeholder="Vilka rekommendationer har ni för organisationen framåt? Vad bör fortsätta efter projektet?"
            className="w-full h-24 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
          />
        </section>
      </div>

      {/* Validation */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-3">Checklista</h4>
        <ul className="space-y-2 text-sm">
          <li className={`flex items-center gap-2 ${executiveSummary ? "text-green-700" : "text-gray-500"}`}>
            <CheckCircle className={`w-4 h-4 ${executiveSummary ? "" : "opacity-30"}`} />
            Sammanfattning för ledningen
          </li>
          <li className={`flex items-center gap-2 ${resultsVsGoals ? "text-green-700" : "text-gray-500"}`}>
            <CheckCircle className={`w-4 h-4 ${resultsVsGoals ? "" : "opacity-30"}`} />
            Resultat vs mål
          </li>
          <li className={`flex items-center gap-2 ${budgetSummary ? "text-green-700" : "text-gray-500"}`}>
            <CheckCircle className={`w-4 h-4 ${budgetSummary ? "" : "opacity-30"}`} />
            Budgetsammanfattning
          </li>
          <li className={`flex items-center gap-2 ${lessonsLearned ? "text-green-700" : "text-gray-500"}`}>
            <CheckCircle className={`w-4 h-4 ${lessonsLearned ? "" : "opacity-30"}`} />
            Lärdomar dokumenterade
          </li>
          <li className={`flex items-center gap-2 ${recommendations ? "text-green-700" : "text-gray-500"}`}>
            <CheckCircle className={`w-4 h-4 ${recommendations ? "" : "opacity-30"}`} />
            Rekommendationer
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-between items-center pt-4 border-t">
        <Button variant="outline" onClick={exportPDF}>
          <Download className="w-4 h-4 mr-2" />
          Ladda ner rapport
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !executiveSummary || !lessonsLearned}
          className="bg-green-600 hover:bg-green-700"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Avslutar projekt...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Avsluta projekt
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
