import { getGroupByCode, updateGroupStatus, logActivity } from '@/lib/db';
import { sql } from '@vercel/postgres';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json().catch(() => ({}));
    const { type } = body;

    const group = await getGroupByCode(code);
    if (!group) {
      return Response.json(
        { success: false, error: 'Grupp hittades inte' },
        { status: 404 }
      );
    }

    // Handle project plan submission (before interviews are unlocked)
    if (type === 'project_plan') {
      // Check if project definition exists
      const definitionResult = await sql`
        SELECT id FROM project_definitions WHERE group_id = ${group.id}
      `;

      if (definitionResult.rows.length === 0) {
        return Response.json(
          { success: false, error: 'Ni måste fylla i projektdefinitionen först (i Förstudie-fasen)' },
          { status: 400 }
        );
      }

      // Update status to pending approval for project plan
      await updateGroupStatus(group.id, 'pending_approval');
      await logActivity(
        group.id,
        'project_plan_submitted',
        'Projektplan inlämnad för godkännande'
      );

      return Response.json({ success: true, type: 'project_plan' });
    }

    // Handle full phase 1 submission (after interviews are done)
    // Check requirements
    const proposalsResult = await sql`
      SELECT COUNT(*) as count FROM action_proposals WHERE group_id = ${group.id}
    `;
    const proposalsCount = parseInt(proposalsResult.rows[0].count);

    const interviewsResult = await sql`
      SELECT COUNT(*) as count FROM interviews WHERE group_id = ${group.id}
    `;
    const interviewsCount = parseInt(interviewsResult.rows[0].count);

    const downloadsResult = await sql`
      SELECT COUNT(*) as count FROM downloads WHERE group_id = ${group.id}
    `;
    const downloadsCount = parseInt(downloadsResult.rows[0].count);

    // Validate minimum requirements
    const errors = [];
    if (proposalsCount < 3) {
      errors.push(`Minst 3 åtgärdsförslag krävs (har ${proposalsCount})`);
    }
    if (interviewsCount < 4) {
      errors.push(`Minst 4 intervjuer krävs (har ${interviewsCount})`);
    }
    if (downloadsCount < 2) {
      errors.push(`Minst 2 nedladdade datafiler krävs (har ${downloadsCount})`);
    }

    if (errors.length > 0) {
      return Response.json(
        { success: false, error: errors.join('. ') },
        { status: 400 }
      );
    }

    // Update status to pending approval
    await updateGroupStatus(group.id, 'pending_approval');
    await logActivity(
      group.id,
      'submission',
      `Fas 1 inlämnad för godkännande. ${proposalsCount} åtgärdsförslag, ${interviewsCount} intervjuer, ${downloadsCount} datafiler.`
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error('Submit error:', error);
    return Response.json(
      { success: false, error: 'Kunde inte lämna in' },
      { status: 500 }
    );
  }
}
