import { NextRequest, NextResponse } from 'next/server';
import { getGroupByCode, approveInvestigation, updateGroupPhase, updateSubPhase, updateGroupStatus, logActivity } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { feedback } = await request.json();

    const group = await getGroupByCode(code.toUpperCase());
    if (!group) {
      return NextResponse.json({ error: 'Grupp hittades inte' }, { status: 404 });
    }

    // Approve the investigation
    await approveInvestigation(group.id);

    // Move to phase 2
    await updateGroupPhase(group.id, 2);

    // Reset sub-phase to intro for phase 2
    await updateSubPhase(group.id, 'intro');

    // Update status to active
    await updateGroupStatus(group.id, 'active');

    // Log activity
    await logActivity(group.id, 'investigation_approved', 'Utredning godkänd av lärare - Fas 2 upplåst');
    if (feedback) {
      await logActivity(group.id, 'investigation_feedback', `Feedback från lärare: ${feedback}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving investigation:', error);
    return NextResponse.json({ error: 'Kunde inte godkänna utredning' }, { status: 500 });
  }
}
