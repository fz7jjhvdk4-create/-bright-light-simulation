import { NextRequest, NextResponse } from 'next/server';
import { getGroupByCode, logActivity } from '@/lib/db';
import { evaluateGate3 } from '@/lib/gate-requirements';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { gateNumber } = await request.json();

    if (!gateNumber || ![1, 2, 3, 4].includes(gateNumber)) {
      return NextResponse.json(
        { error: 'Ogiltigt gate-nummer' },
        { status: 400 }
      );
    }

    const group = await getGroupByCode(code.toUpperCase());
    if (!group) {
      return NextResponse.json({ error: 'Grupp hittades inte' }, { status: 404 });
    }

    // Check that group is in the correct phase for this gate
    if (group.phase !== gateNumber) {
      return NextResponse.json(
        { error: `Gruppen måste vara i fas ${gateNumber} för att skicka in Gate ${gateNumber}` },
        { status: 400 }
      );
    }

    // Gate 3 has hard requirements — enforced here so they can't be bypassed
    if (gateNumber === 3) {
      const [interviewsResult, toolsResult] = await Promise.all([
        sql`SELECT COUNT(*) as count FROM interviews WHERE group_id = ${group.id}`,
        sql`SELECT tools_7qc, tools_7qm FROM investigation_tools_data WHERE group_id = ${group.id}`,
      ]);
      const interviewsCount = parseInt(interviewsResult.rows[0].count);
      const toolsRow = toolsResult.rows[0];
      const completed7qc: string[] = toolsRow?.tools_7qc
        ? (JSON.parse(toolsRow.tools_7qc).completedTools ?? []) : [];
      const completed7qm: string[] = toolsRow?.tools_7qm
        ? (JSON.parse(toolsRow.tools_7qm).completedTools ?? []) : [];

      const { items, allMet } = evaluateGate3(interviewsCount, completed7qc, completed7qm);
      if (!allMet) {
        const missing = items
          .filter(item => !item.met)
          .map(item => `${item.label}: ${item.current} av ${item.required}`)
          .join(', ');
        return NextResponse.json(
          { error: `Kraven för Gate 3 är inte uppfyllda ännu — ${missing}. Fortsätt utredningen och försök igen.` },
          { status: 400 }
        );
      }
    }

    // Update gate status to pending
    await sql`
      UPDATE groups
      SET gate1_status = CASE WHEN ${gateNumber} = 1 THEN 'pending' ELSE gate1_status END,
          gate2_status = CASE WHEN ${gateNumber} = 2 THEN 'pending' ELSE gate2_status END,
          gate3_status = CASE WHEN ${gateNumber} = 3 THEN 'pending' ELSE gate3_status END,
          gate4_status = CASE WHEN ${gateNumber} = 4 THEN 'pending' ELSE gate4_status END,
          status = ${`pending_gate${gateNumber}`}
      WHERE id = ${group.id}
    `;

    const gateNames: Record<number, string> = {
      1: 'Projektdirektiv',
      2: 'Projektplan',
      3: 'Utredningsrapport',
      4: 'Slutredovisning'
    };

    await logActivity(group.id, `gate${gateNumber}_submitted`, `${gateNames[gateNumber]} skickad för godkännande`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting gate:', error);
    return NextResponse.json(
      { error: 'Kunde inte skicka in för godkännande' },
      { status: 500 }
    );
  }
}
