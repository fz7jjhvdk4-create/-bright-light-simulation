import { NextRequest, NextResponse } from 'next/server';
import { getGroupByCode, saveInvestigationReport, getInvestigationReport, logActivity } from '@/lib/db';

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

    const report = await getInvestigationReport(group.id);

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error fetching investigation report:', error);
    return NextResponse.json({ error: 'Kunde inte hämta rapport' }, { status: 500 });
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

    const report = await saveInvestigationReport(group.id, {
      summary: body.summary || '',
      methodology: body.methodology || '',
      root_causes: body.root_causes || [],
      conclusions: body.conclusions || '',
      recommendations: body.recommendations || ''
    });

    await logActivity(group.id, 'investigation_report_saved', 'Utredningsrapport sparad');

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error saving investigation report:', error);
    return NextResponse.json({ error: 'Kunde inte spara rapport' }, { status: 500 });
  }
}
