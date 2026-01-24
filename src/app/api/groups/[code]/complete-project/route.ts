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

    // Update status to completed
    await updateGroupStatus(group.id, 'completed');

    // Move to closing sub-phase
    await updateSubPhase(group.id, 'closing');

    await logActivity(group.id, 'project_completed', 'Projektet har avslutats');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completing project:', error);
    return NextResponse.json({ error: 'Kunde inte avsluta projektet' }, { status: 500 });
  }
}
