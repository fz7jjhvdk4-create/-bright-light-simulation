import { NextRequest, NextResponse } from 'next/server';
import { getGroupByCode, logActivity } from '@/lib/db';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { gateNumber } = await request.json();

    if (!gateNumber || ![1, 2, 3].includes(gateNumber)) {
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

    // Update gate status to pending
    const gateColumn = `gate${gateNumber}_status`;
    await sql`
      UPDATE groups
      SET gate1_status = CASE WHEN ${gateNumber} = 1 THEN 'pending' ELSE gate1_status END,
          gate2_status = CASE WHEN ${gateNumber} = 2 THEN 'pending' ELSE gate2_status END,
          gate3_status = CASE WHEN ${gateNumber} = 3 THEN 'pending' ELSE gate3_status END,
          status = ${`pending_gate${gateNumber}`}
      WHERE id = ${group.id}
    `;

    const gateNames = {
      1: 'Projektdirektiv',
      2: 'Projektplan',
      3: 'Utredningsrapport'
    };

    await logActivity(group.id, `gate${gateNumber}_submitted`, `${gateNames[gateNumber as 1 | 2 | 3]} skickad för godkännande`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting gate:', error);
    return NextResponse.json(
      { error: 'Kunde inte skicka in för godkännande' },
      { status: 500 }
    );
  }
}
