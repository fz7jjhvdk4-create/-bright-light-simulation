import { getGroupByCode, updateGroupPhase, updateGroupStatus, logActivity } from '@/lib/db';

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
      // Approve: update phase to 2 and status to approved
      console.log('Approving group, updating phase to 2 and status to approved');
      await updateGroupPhase(group.id, 2);
      await updateGroupStatus(group.id, 'approved');
      await logActivity(
        group.id,
        'phase_approved',
        `Fas 1 godkänd av lärare. ${feedback ? `Feedback: ${feedback}` : ''}`
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
