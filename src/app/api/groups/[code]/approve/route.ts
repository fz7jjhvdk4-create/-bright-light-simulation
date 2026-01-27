import { getGroupByCode, updateGroupPhase, updateGroupStatus, logActivity, approveProjectPlan, approveInvestigation, updateSubPhase } from '@/lib/db';
import { sql } from '@vercel/postgres';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { approved, feedback } = body;

    console.log('Approve API called:', { code, approved, feedback });

    const group = await getGroupByCode(code);
    if (!group) {
      console.log('Group not found:', code);
      return Response.json(
        { success: false, error: 'Grupp hittades inte' },
        { status: 404 }
      );
    }

    console.log('Found group:', { id: group.id, currentStatus: group.status, currentPhase: group.phase });

    if (approved) {
      // Approve: advance phase and status
      const currentPhase = group.phase;
      const nextPhase = currentPhase + 1;
      console.log(`Approving group, advancing from phase ${currentPhase} to ${nextPhase}`);

      // Also approve project plan and investigation if not already done
      if (!group.project_plan_approved) {
        await approveProjectPlan(group.id);
        console.log('Project plan auto-approved');
      }
      if (!group.investigation_approved) {
        await approveInvestigation(group.id);
        console.log('Investigation auto-approved');
      }

      // Set sub_phase to intro for next phase
      await updateSubPhase(group.id, 'intro');

      // Safety net: also update gate statuses to match
      await sql`
        UPDATE groups
        SET gate1_status = CASE WHEN ${currentPhase} = 1 THEN 'approved' ELSE gate1_status END,
            gate2_status = CASE WHEN ${currentPhase} = 2 THEN 'approved' ELSE gate2_status END,
            gate3_status = CASE WHEN ${currentPhase} = 3 THEN 'approved' ELSE gate3_status END,
            gate4_status = CASE WHEN ${currentPhase} = 4 THEN 'approved' ELSE gate4_status END
        WHERE id = ${group.id}
      `;

      await updateGroupPhase(group.id, Math.min(nextPhase, 4));
      await updateGroupStatus(group.id, 'active');
      await logActivity(
        group.id,
        'phase_approved',
        `Fas ${currentPhase} godkänd av lärare. ${feedback ? `Feedback: ${feedback}` : ''}`
      );
      console.log('Group approved successfully');
    } else {
      // Reject: keep phase 1 but update status back to active
      console.log('Rejecting group, setting status to active');
      await updateGroupStatus(group.id, 'active');
      await logActivity(
        group.id,
        'phase_rejected',
        `Fas 1 avslagen av lärare. Feedback: ${feedback || 'Ingen feedback'}`
      );
      console.log('Group rejected successfully');
    }

    // Verify the update
    const updatedGroup = await getGroupByCode(code);
    console.log('Verified update:', { newStatus: updatedGroup?.status, newPhase: updatedGroup?.phase });

    return Response.json({
      success: true,
      approved,
      newStatus: updatedGroup?.status,
      newPhase: updatedGroup?.phase
    });
  } catch (error) {
    console.error('Approval error:', error);
    return Response.json(
      { success: false, error: 'Kunde inte behandla godkännande', details: String(error) },
      { status: 500 }
    );
  }
}
