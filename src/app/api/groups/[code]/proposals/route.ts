import { getGroupByCode, logActivity } from '@/lib/db';
import { sql } from '@vercel/postgres';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const group = await getGroupByCode(code);
    if (!group) {
      return Response.json(
        { success: false, error: 'Grupp hittades inte' },
        { status: 404 }
      );
    }

    const result = await sql`
      SELECT * FROM action_proposals
      WHERE group_id = ${group.id}
      ORDER BY created_at DESC
    `;

    return Response.json({
      success: true,
      proposals: result.rows.map(p => ({
        id: p.id,
        rootCauseId: p.root_cause_id,
        description: p.description,
        responsible: p.responsible,
        cost: p.cost,
        createdAt: p.created_at
      }))
    });
  } catch (error) {
    console.error('Get proposals error:', error);
    return Response.json(
      { success: false, error: 'Kunde inte hämta åtgärdsförslag' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { rootCauseId, description, responsible, cost } = await request.json();

    if (!rootCauseId || !description) {
      return Response.json(
        { success: false, error: 'Rotorsak och beskrivning krävs' },
        { status: 400 }
      );
    }

    const group = await getGroupByCode(code);
    if (!group) {
      return Response.json(
        { success: false, error: 'Grupp hittades inte' },
        { status: 404 }
      );
    }

    const result = await sql`
      INSERT INTO action_proposals (group_id, root_cause_id, description, responsible, cost)
      VALUES (${group.id}, ${rootCauseId}, ${description}, ${responsible || null}, ${cost || null})
      RETURNING *
    `;

    await logActivity(group.id, 'proposal_added', `Åtgärdsförslag tillagt för: ${rootCauseId}`);

    return Response.json({
      success: true,
      proposal: {
        id: result.rows[0].id,
        rootCauseId: result.rows[0].root_cause_id,
        description: result.rows[0].description,
        responsible: result.rows[0].responsible,
        cost: result.rows[0].cost,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Create proposal error:', error);
    return Response.json(
      { success: false, error: 'Kunde inte skapa åtgärdsförslag' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('id');

    if (!proposalId) {
      return Response.json(
        { success: false, error: 'Förslags-ID saknas' },
        { status: 400 }
      );
    }

    const group = await getGroupByCode(code);
    if (!group) {
      return Response.json(
        { success: false, error: 'Grupp hittades inte' },
        { status: 404 }
      );
    }

    await sql`
      DELETE FROM action_proposals
      WHERE id = ${proposalId} AND group_id = ${group.id}
    `;

    await logActivity(group.id, 'proposal_deleted', `Åtgärdsförslag borttaget: ${proposalId}`);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete proposal error:', error);
    return Response.json(
      { success: false, error: 'Kunde inte ta bort åtgärdsförslag' },
      { status: 500 }
    );
  }
}
