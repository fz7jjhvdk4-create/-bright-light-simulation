"use client";

import { useCallback, useEffect, useState } from "react";
import { dataFiles } from "@/lib/data-generator";
import { Document } from "@/lib/documents";

export type SubPhase = 'intro' | 'prestudy' | 'planning' | 'execution' | 'closing';

export type GateStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

export interface GroupData {
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

export interface InterviewData {
  roleId: string;
  questionsAsked: number;
}

export interface DownloadData {
  fileId: string;
}

export interface ActivityLogItem {
  id: number;
  timestamp: string;
  action: string;
  detail: string;
}

export interface Proposal {
  id: number;
  rootCauseId: string;
  description: string;
  responsible: string | null;
  cost: number | null;
}

// All server-backed group state for the simulation page: the group itself,
// interview/download/document statistics, activity log and proposals.
export function useGroupData(code: string) {
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [downloads, setDownloads] = useState<DownloadData[]>([]);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [viewedDocuments, setViewedDocuments] = useState<string[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const fetchGroupData = useCallback(async () => {
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
  }, [code]);

  useEffect(() => {
    if (code) {
      fetchGroupData();
    }
  }, [code, fetchGroupData]);

  const isRoleInterviewed = (roleId: string) =>
    interviews.some(i => i.roleId === roleId);

  const isFileDownloaded = (fileId: string) =>
    downloads.some(d => d.fileId === fileId);

  const isDocumentViewed = (docId: string) =>
    viewedDocuments.includes(docId);

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

  const logDocumentView = async (doc: Document) => {
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

  return {
    group,
    loading,
    error,
    interviews,
    setInterviews,
    downloads,
    isDownloading,
    activityLog,
    viewedDocuments,
    proposals,
    fetchGroupData,
    isRoleInterviewed,
    isFileDownloaded,
    isDocumentViewed,
    handleDownload,
    logDocumentView,
    updateSubPhase,
  };
}
