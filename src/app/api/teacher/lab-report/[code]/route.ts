import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  getGroupByCode,
  getProjectDefinition,
  getInvestigationReport,
  getBudgetAllocation,
  getFinalReport,
  getInterviews,
} from '@/lib/db';

// Aggregated lab report for the teacher (issue #9). Guarded by the teacher
// session via src/proxy.ts (everything under /api/teacher/*).
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const group = await getGroupByCode(code.toUpperCase());
    if (!group) {
      return NextResponse.json({ success: false, error: 'Grupp hittades inte' }, { status: 404 });
    }

    const [
      projectDefinition,
      investigationReport,
      toolsResult,
      proposalsResult,
      budgetAllocations,
      finalReport,
      interviews,
      questionsResult,
      downloadsResult,
    ] = await Promise.all([
      getProjectDefinition(group.id),
      getInvestigationReport(group.id),
      sql`SELECT tools_7qc, tools_7qm, five_why FROM investigation_tools_data WHERE group_id = ${group.id}`,
      sql`SELECT * FROM action_proposals WHERE group_id = ${group.id} ORDER BY created_at ASC`,
      getBudgetAllocation(group.id),
      getFinalReport(group.id),
      getInterviews(group.id),
      sql`
        SELECT role_id, content, timestamp FROM chat_messages
        WHERE group_id = ${group.id} AND role_type = 'user'
        ORDER BY timestamp ASC
      `,
      sql`SELECT file_id FROM downloads WHERE group_id = ${group.id}`,
    ]);

    const toolsRow = toolsResult.rows[0];

    return NextResponse.json({
      success: true,
      report: {
        group: {
          name: group.name,
          code: group.code,
          studentNames: group.student_names,
          phase: group.phase,
          gate1Status: group.gate1_status,
          gate2Status: group.gate2_status,
          gate3Status: group.gate3_status,
          gate4Status: group.gate4_status,
          status: group.status,
        },
        projectDefinition: projectDefinition ?? null,
        investigationReport: investigationReport ?? null,
        tools: {
          tools7qc: toolsRow?.tools_7qc ? JSON.parse(toolsRow.tools_7qc) : null,
          tools7qm: toolsRow?.tools_7qm ? JSON.parse(toolsRow.tools_7qm) : null,
          fiveWhy: toolsRow?.five_why ? JSON.parse(toolsRow.five_why) : null,
        },
        proposals: proposalsResult.rows.map(p => ({
          rootCauseId: p.root_cause_id,
          description: p.description,
          responsible: p.responsible,
          cost: p.cost,
          timeline: p.timeline,
          costReduction: p.cost_reduction,
        })),
        budgetAllocations,
        finalReport: finalReport ?? null,
        interviews: interviews.map(i => ({
          roleId: i.role_id,
          questionsAsked: i.questions_asked,
        })),
        questions: questionsResult.rows.map(q => ({
          roleId: q.role_id,
          content: q.content,
          timestamp: q.timestamp,
        })),
        downloadsCount: downloadsResult.rows.length,
      },
    });
  } catch (error) {
    console.error('Lab report error:', error);
    return NextResponse.json({ success: false, error: 'Kunde inte skapa labbrapporten' }, { status: 500 });
  }
}
