import { getGroupByCode } from '@/lib/db';
import { sql } from '@vercel/postgres';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const group = await getGroupByCode(code);
    if (!group) {
      return Response.json({ success: false, error: 'Grupp hittades inte' }, { status: 404 });
    }

    const result = await sql`
      SELECT tools_7qc, tools_7qm, five_why, problems, created_at
      FROM investigation_tools_data
      WHERE group_id = ${group.id}
    `;

    if (result.rows.length === 0) {
      return Response.json({ success: true, data: null });
    }

    const row = result.rows[0];
    return Response.json({
      success: true,
      data: {
        tools7qc: row.tools_7qc ? JSON.parse(row.tools_7qc) : null,
        tools7qm: row.tools_7qm ? JSON.parse(row.tools_7qm) : null,
        fiveWhy: row.five_why ? JSON.parse(row.five_why) : null,
        problems: row.problems ? JSON.parse(row.problems) : null,
        createdAt: row.created_at,
      }
    });
  } catch (error) {
    console.error('Investigation tools GET error:', error);
    return Response.json({ success: false, error: 'Kunde inte hämta data' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { tools7qc, tools7qm, fiveWhy, problems } = body;

    const group = await getGroupByCode(code);
    if (!group) {
      return Response.json({ success: false, error: 'Grupp hittades inte' }, { status: 404 });
    }

    const tools7qcJson = tools7qc ? JSON.stringify(tools7qc) : null;
    const tools7qmJson = tools7qm ? JSON.stringify(tools7qm) : null;
    const fiveWhyJson = fiveWhy ? JSON.stringify(fiveWhy) : null;
    const problemsJson = problems ? JSON.stringify(problems) : null;

    await sql`
      INSERT INTO investigation_tools_data (group_id, tools_7qc, tools_7qm, five_why, problems)
      VALUES (${group.id}, ${tools7qcJson}, ${tools7qmJson}, ${fiveWhyJson}, ${problemsJson})
      ON CONFLICT (group_id)
      DO UPDATE SET
        tools_7qc = ${tools7qcJson},
        tools_7qm = ${tools7qmJson},
        five_why = ${fiveWhyJson},
        problems = ${problemsJson}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error('Investigation tools POST error:', error);
    return Response.json({ success: false, error: 'Kunde inte spara data' }, { status: 500 });
  }
}
