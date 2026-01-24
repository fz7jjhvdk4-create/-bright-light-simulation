import { NextRequest, NextResponse } from 'next/server';
import { getGroupByCode, approveProjectPlan, updateSubPhase, updateGroupStatus, logActivity } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Safely parse body - it might be empty
    let feedback = '';
    try {
      const body = await request.json();
      feedback = body?.feedback || '';
    } catch {
      // Body might be empty, that's OK
    }

    console.log('Approve project plan called for code:', code);

    const group = await getGroupByCode(code.toUpperCase());
    if (!group) {
      console.log('Group not found:', code);
      return NextResponse.json({ success: false, error: 'Grupp hittades inte' }, { status: 404 });
    }

    console.log('Found group:', group.id, 'Current project_plan_approved:', group.project_plan_approved);

    // Approve the project plan
    await approveProjectPlan(group.id);
    console.log('Project plan approved');

    // Move to execution phase (where interviews happen)
    await updateSubPhase(group.id, 'execution');
    console.log('Sub-phase updated to execution');

    // Update status back to active (project plan approved, ready for interviews)
    await updateGroupStatus(group.id, 'active');
    console.log('Status updated to active');

    // Log activity
    await logActivity(group.id, 'project_plan_approved', 'Projektplan godkänd av lärare - intervjuer upplåsta');
    if (feedback) {
      await logActivity(group.id, 'project_plan_feedback', `Feedback från lärare: ${feedback}`);
    }

    // Verify the update
    const updatedGroup = await getGroupByCode(code.toUpperCase());
    console.log('Verified - project_plan_approved is now:', updatedGroup?.project_plan_approved);

    return NextResponse.json({
      success: true,
      projectPlanApproved: updatedGroup?.project_plan_approved,
      subPhase: updatedGroup?.sub_phase
    });
  } catch (error) {
    console.error('Error approving project plan:', error);
    return NextResponse.json({ success: false, error: 'Kunde inte godkänna projektplan', details: String(error) }, { status: 500 });
  }
}
