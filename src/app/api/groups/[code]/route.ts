import { NextRequest, NextResponse } from 'next/server';
import { getGroupByCode, getGroupStats, getInterviews, getDownloads, getActivityLog, getDocumentViews } from '@/lib/db';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    console.log('GET /api/groups/[code] called for:', code);
    const group = await getGroupByCode(code.toUpperCase());
    console.log('Group fetched, project_plan_approved:', group?.project_plan_approved);

    if (!group) {
      return NextResponse.json(
        { error: 'Grupp hittades inte' },
        { status: 404 }
      );
    }

    const stats = await getGroupStats(group.id);
    const interviews = await getInterviews(group.id);
    const downloads = await getDownloads(group.id);
    const activityLog = await getActivityLog(group.id);
    const viewedDocuments = await getDocumentViews(group.id);

    const response = NextResponse.json({
      success: true,
      group: {
        id: group.id,
        code: group.code,
        name: group.name,
        studentNames: group.student_names,
        phase: group.phase,
        subPhase: group.sub_phase || 'intro',
        projectPlanApproved: group.project_plan_approved || false,
        investigationApproved: group.investigation_approved || false,
        status: group.status,
        createdAt: group.created_at
      },
      stats,
      interviews: interviews.map(i => ({
        roleId: i.role_id,
        questionsAsked: i.questions_asked,
        startedAt: i.started_at
      })),
      downloads: downloads.map(d => ({
        fileId: d.file_id,
        timestamp: d.timestamp
      })),
      activityLog: activityLog.map(a => ({
        id: a.id,
        timestamp: a.timestamp,
        action: a.action,
        detail: a.detail
      })),
      viewedDocuments
    });

    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Kunde inte hämta grupp' },
      { status: 500 }
    );
  }
}
