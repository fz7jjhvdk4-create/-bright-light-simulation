"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FileArchive,
  FileText,
  Download,
  CheckCircle,
  Loader2,
  FileSpreadsheet,
  Image as ImageIcon
} from "lucide-react";
import {
  generateFinalReportPDF,
  createExportZip,
  downloadBlob,
  exportAsJSON,
  exportAsExcel
} from "@/lib/export-utils";

interface ExportPanelProps {
  groupCode: string;
  groupData: {
    name: string;
    code: string;
    studentNames: string;
    phase: number;
  };
  activityLog: Array<{ timestamp: string; action: string; detail: string }>;
  interviews: Array<{ roleId: string; questionsAsked: number }>;
  downloads: Array<{ fileId: string }>;
  proposals: Array<{
    rootCauseId: string;
    description: string;
    responsible?: string | null;
    cost?: number | null
  }>;
}

export function ExportPanel({
  groupCode,
  groupData,
  activityLog,
  interviews,
  downloads,
  proposals
}: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);

  const handleExportReport = async () => {
    setIsExporting("report");
    try {
      const blob = await generateFinalReportPDF(groupData, activityLog, interviews, downloads, proposals);
      downloadBlob(blob, `slutrapport-${groupCode}.pdf`);
      setCompleted(prev => [...prev, "report"]);
    } catch (error) {
      console.error("Export error:", error);
      alert("Kunde inte exportera rapport");
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportActivityLog = () => {
    const blob = exportAsJSON(activityLog, `aktivitetslogg-${groupCode}.json`);
    downloadBlob(blob, `aktivitetslogg-${groupCode}.json`);
    setCompleted(prev => [...prev, "activity"]);
  };

  const handleExportProposalsExcel = () => {
    const data = proposals.map(p => ({
      "Rotorsak": p.rootCauseId,
      "Beskrivning": p.description,
      "Ansvarig": p.responsible || "",
      "Kostnad (SEK)": p.cost || 0
    }));
    const blob = exportAsExcel(data, `atgardsforslag-${groupCode}.xlsx`, "Åtgärdsförslag");
    downloadBlob(blob, `atgardsforslag-${groupCode}.xlsx`);
    setCompleted(prev => [...prev, "proposals"]);
  };

  const handleExportAll = async () => {
    setIsExporting("all");
    try {
      const files: Array<{ name: string; blob: Blob }> = [];

      // Final report PDF
      const reportBlob = await generateFinalReportPDF(groupData, activityLog, interviews, downloads, proposals);
      files.push({ name: `slutrapport-${groupCode}.pdf`, blob: reportBlob });

      // Activity log JSON
      const activityBlob = exportAsJSON(activityLog, `aktivitetslogg-${groupCode}.json`);
      files.push({ name: `aktivitetslogg-${groupCode}.json`, blob: activityBlob });

      // Proposals Excel
      const proposalsData = proposals.map(p => ({
        "Rotorsak": p.rootCauseId,
        "Beskrivning": p.description,
        "Ansvarig": p.responsible || "",
        "Kostnad (SEK)": p.cost || 0
      }));
      const proposalsBlob = exportAsExcel(proposalsData, `atgardsforslag-${groupCode}.xlsx`, "Åtgärdsförslag");
      files.push({ name: `atgardsforslag-${groupCode}.xlsx`, blob: proposalsBlob });

      // Interview summary
      const interviewData = interviews.map(i => ({
        "Roll-ID": i.roleId,
        "Antal frågor": i.questionsAsked
      }));
      const interviewBlob = exportAsExcel(interviewData, `intervjuer-${groupCode}.xlsx`, "Intervjuer");
      files.push({ name: `intervjuer-${groupCode}.xlsx`, blob: interviewBlob });

      // Stakeholder analysis from localStorage
      const stakeholderData = localStorage.getItem(`stakeholders-${groupCode}`);
      if (stakeholderData) {
        const stakeholderBlob = new Blob([stakeholderData], { type: "application/json" });
        files.push({ name: `intressentanalys-${groupCode}.json`, blob: stakeholderBlob });
      }

      // Risk analysis from localStorage
      const riskData = localStorage.getItem(`risks-${groupCode}`);
      if (riskData) {
        const riskBlob = new Blob([riskData], { type: "application/json" });
        files.push({ name: `riskanalys-${groupCode}.json`, blob: riskBlob });
      }

      // WBS from localStorage
      const wbsData = localStorage.getItem(`wbs-${groupCode}`);
      if (wbsData) {
        const wbsBlob = new Blob([wbsData], { type: "application/json" });
        files.push({ name: `wbs-${groupCode}.json`, blob: wbsBlob });
      }

      // Create ZIP
      const zipBlob = await createExportZip(groupCode, files);
      downloadBlob(zipBlob, `projekt-${groupCode}-export.zip`);
      setCompleted(prev => [...prev, "all"]);
    } catch (error) {
      console.error("Export error:", error);
      alert("Kunde inte skapa exportfil");
    } finally {
      setIsExporting(null);
    }
  };

  const isComplete = (key: string) => completed.includes(key);

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-2">Exportera projekt</h3>
      <p className="text-sm text-gray-500 mb-6">
        Ladda ner dina projektdokument för inlämning eller arkivering.
      </p>

      <div className="space-y-4">
        {/* Final report */}
        <div className="flex items-center justify-between p-4 border rounded-lg hover:border-yellow-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium">Slutrapport</div>
              <div className="text-sm text-gray-500">Komplett PDF med sammanfattning</div>
            </div>
          </div>
          <Button
            onClick={handleExportReport}
            disabled={isExporting === "report"}
            variant={isComplete("report") ? "outline" : "default"}
          >
            {isExporting === "report" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : isComplete("report") ? (
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isComplete("report") ? "Nedladdad" : "Ladda ner"}
          </Button>
        </div>

        {/* Activity log */}
        <div className="flex items-center justify-between p-4 border rounded-lg hover:border-yellow-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">Aktivitetslogg</div>
              <div className="text-sm text-gray-500">JSON-format med alla aktiviteter</div>
            </div>
          </div>
          <Button
            onClick={handleExportActivityLog}
            variant={isComplete("activity") ? "outline" : "default"}
          >
            {isComplete("activity") ? (
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isComplete("activity") ? "Nedladdad" : "Ladda ner"}
          </Button>
        </div>

        {/* Proposals Excel */}
        <div className="flex items-center justify-between p-4 border rounded-lg hover:border-yellow-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium">Åtgärdsförslag</div>
              <div className="text-sm text-gray-500">Excel-fil med alla förslag</div>
            </div>
          </div>
          <Button
            onClick={handleExportProposalsExcel}
            variant={isComplete("proposals") ? "outline" : "default"}
            disabled={proposals.length === 0}
          >
            {isComplete("proposals") ? (
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isComplete("proposals") ? "Nedladdad" : proposals.length === 0 ? "Inga förslag" : "Ladda ner"}
          </Button>
        </div>

        {/* Full ZIP export */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-200 rounded-lg">
                <FileArchive className="w-6 h-6 text-yellow-700" />
              </div>
              <div>
                <div className="font-semibold">Komplett export (ZIP)</div>
                <div className="text-sm text-gray-600">
                  Alla dokument samlade i en ZIP-fil
                </div>
              </div>
            </div>
            <Button
              onClick={handleExportAll}
              disabled={isExporting === "all"}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              {isExporting === "all" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isComplete("all") ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <FileArchive className="w-4 h-4 mr-2" />
              )}
              {isExporting === "all" ? "Skapar..." : isComplete("all") ? "Nedladdad" : "Ladda ner allt"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
