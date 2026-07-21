import { NextRequest, NextResponse } from 'next/server';
import { getGroupByCode, saveFinalReport, getFinalReport, logActivity } from '@/lib/db';
import { requirePhase } from '@/lib/api-guards';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const group = await getGroupByCode(code.toUpperCase());
    if (!group) {
      return NextResponse.json({ error: 'Grupp hittades inte' }, { status: 404 });
    }

    const report = await getFinalReport(group.id);

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error fetching final report:', error);
    return NextResponse.json({ error: 'Kunde inte hämta slutrapport' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();

    const group = await getGroupByCode(code.toUpperCase());
    if (!group) {
      return NextResponse.json({ error: 'Grupp hittades inte' }, { status: 404 });
    }
    const phaseError = requirePhase(group, 4);
    if (phaseError) return phaseError;

    await saveFinalReport(group.id, {
      executive_summary: body.executive_summary || '',
      results_vs_goals: body.results_vs_goals || '',
      budget_summary: body.budget_summary || '',
      lessons_learned: body.lessons_learned || '',
      recommendations: body.recommendations || ''
    });

    await logActivity(group.id, 'final_report_saved', 'Slutrapport sparad');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving final report:', error);
    return NextResponse.json({ error: 'Kunde inte spara slutrapport' }, { status: 500 });
  }
}
