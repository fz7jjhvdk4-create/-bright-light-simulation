import { NextRequest, NextResponse } from 'next/server';
import { getGroupByCode, updateGroupStatus, updateSubPhase, logActivity } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const group = await getGroupByCode(code.toUpperCase());
    if (!group) {
      return NextResponse.json({ error: 'Grupp hittades inte' }, { status: 404 });
    }

    // Check that group is in phase 1 and in execution or closing sub-phase
    if (group.phase !== 1) {
      return NextResponse.json({ error: 'Gruppen är inte i fas 1' }, { status: 400 });
    }

    // Update status to pending approval for investigation
    await updateGroupStatus(group.id, 'pending_investigation_approval');

    // Move to closing sub-phase
    await updateSubPhase(group.id, 'closing');

    await logActivity(group.id, 'investigation_submitted', 'Utredningsrapport inskickad för godkännande');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting investigation:', error);
    return NextResponse.json({ error: 'Kunde inte skicka in utredning' }, { status: 500 });
  }
}
