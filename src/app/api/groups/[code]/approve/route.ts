import { getGroupByCode, updateGroupPhase, updateGroupStatus, logActivity } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { approved, feedback } = await request.json();

    const group = await getGroupByCode(code);
    if (!group) {
      return Response.json(
        { success: false, error: 'Grupp hittades inte' },
        { status: 404 }
      );
    }

    if (approved) {
      // Approve: update phase to 2 and status to approved
      await updateGroupPhase(group.id, 2);
      await updateGroupStatus(group.id, 'approved');
      await logActivity(
        group.id,
        'phase_approved',
        `Fas 1 godkänd av lärare. ${feedback ? `Feedback: ${feedback}` : ''}`
      );
    } else {
      // Reject: keep phase 1 but update status back to active
      await updateGroupStatus(group.id, 'active');
      await logActivity(
        group.id,
        'phase_rejected',
        `Fas 1 avslagen av lärare. Feedback: ${feedback || 'Ingen feedback'}`
      );
    }

    return Response.json({ success: true, approved });
  } catch (error) {
    console.error('Approval error:', error);
    return Response.json(
      { success: false, error: 'Kunde inte behandla godkännande' },
      { status: 500 }
    );
  }
}
