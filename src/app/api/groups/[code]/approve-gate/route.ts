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
    const { gateNumber, approved, feedback } = await request.json();

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

    const gateNames = {
      1: 'Projektdirektiv',
      2: 'Projektplan',
      3: 'Utredningsrapport'
    };

    if (approved) {
      // Approve gate and move to next phase
      let newPhase = group.phase;
      let newStatus = 'active';

      if (gateNumber === 1) {
        newPhase = 2;
      } else if (gateNumber === 2) {
        newPhase = 3;
      } else if (gateNumber === 3) {
        newStatus = 'completed';
      }

      await sql`
        UPDATE groups
        SET gate1_status = CASE WHEN ${gateNumber} = 1 THEN 'approved' ELSE gate1_status END,
            gate2_status = CASE WHEN ${gateNumber} = 2 THEN 'approved' ELSE gate2_status END,
            gate3_status = CASE WHEN ${gateNumber} = 3 THEN 'approved' ELSE gate3_status END,
            phase = ${newPhase},
            status = ${newStatus},
            project_plan_approved = CASE WHEN ${gateNumber} = 1 THEN TRUE ELSE project_plan_approved END,
            investigation_approved = CASE WHEN ${gateNumber} = 3 THEN TRUE ELSE investigation_approved END
        WHERE id = ${group.id}
      `;

      await logActivity(
        group.id,
        `gate${gateNumber}_approved`,
        `${gateNames[gateNumber as 1 | 2 | 3]} godkänd av lärare${feedback ? `. Feedback: ${feedback}` : ''}`
      );

      return NextResponse.json({
        success: true,
        message: `Gate ${gateNumber} godkänd`,
        newPhase
      });
    } else {
      // Reject gate
      await sql`
        UPDATE groups
        SET gate1_status = CASE WHEN ${gateNumber} = 1 THEN 'rejected' ELSE gate1_status END,
            gate2_status = CASE WHEN ${gateNumber} = 2 THEN 'rejected' ELSE gate2_status END,
            gate3_status = CASE WHEN ${gateNumber} = 3 THEN 'rejected' ELSE gate3_status END,
            status = 'active'
        WHERE id = ${group.id}
      `;

      await logActivity(
        group.id,
        `gate${gateNumber}_rejected`,
        `${gateNames[gateNumber as 1 | 2 | 3]} avvisad: ${feedback || 'Ingen feedback angiven'}`
      );

      return NextResponse.json({
        success: true,
        message: `Gate ${gateNumber} avvisad`
      });
    }
  } catch (error) {
    console.error('Error processing gate approval:', error);
    return NextResponse.json(
      { error: 'Kunde inte behandla godkännande' },
      { status: 500 }
    );
  }
}
