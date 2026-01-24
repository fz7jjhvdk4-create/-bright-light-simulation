import { NextRequest, NextResponse } from 'next/server';
import { getGroupByCode, updateSubPhase, logActivity } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { subPhase } = await request.json();

    const validSubPhases = ['intro', 'prestudy', 'planning', 'execution', 'closing'];
    if (!validSubPhases.includes(subPhase)) {
      return NextResponse.json({ error: 'Ogiltig delfas' }, { status: 400 });
    }

    const group = await getGroupByCode(code.toUpperCase());
    if (!group) {
      return NextResponse.json({ error: 'Grupp hittades inte' }, { status: 404 });
    }

    await updateSubPhase(group.id, subPhase);

    return NextResponse.json({ success: true, subPhase });
  } catch (error) {
    console.error('Error updating sub-phase:', error);
    return NextResponse.json({ error: 'Kunde inte uppdatera delfas' }, { status: 500 });
  }
}
