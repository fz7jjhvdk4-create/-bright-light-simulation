import { NextRequest, NextResponse } from 'next/server';
import { getGroupByCode, approveProjectPlan, updateSubPhase, logActivity } from '@/lib/db';

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

    // Approve the project plan
    await approveProjectPlan(group.id);

    // Move to execution phase (where interviews happen)
    await updateSubPhase(group.id, 'execution');

    // Log activity
    if (feedback) {
      await logActivity(group.id, 'project_plan_feedback', `Feedback från lärare: ${feedback}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving project plan:', error);
    return NextResponse.json({ error: 'Kunde inte godkänna projektplan' }, { status: 500 });
  }
}
