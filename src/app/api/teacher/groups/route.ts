import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const result = await sql`
      SELECT
        g.id,
        g.code,
        g.name,
        g.student_names,
        g.phase,
        g.status,
        g.created_at,
        (SELECT COUNT(*) FROM interviews WHERE group_id = g.id) as interviews_count,
        (SELECT COUNT(*) FROM downloads WHERE group_id = g.id) as downloads_count,
        (SELECT COUNT(*) FROM action_proposals WHERE group_id = g.id) as proposals_count
      FROM groups g
      ORDER BY g.created_at DESC
    `;

    return Response.json({
      success: true,
      groups: result.rows.map(g => ({
        id: g.id,
        code: g.code,
        name: g.name,
        studentNames: g.student_names,
        phase: g.phase,
        status: g.status,
        createdAt: g.created_at,
        interviewsCount: parseInt(g.interviews_count),
        downloadsCount: parseInt(g.downloads_count),
        proposalsCount: parseInt(g.proposals_count)
      }))
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return Response.json(
      { success: false, error: 'Kunde inte hämta grupper' },
      { status: 500 }
    );
  }
}
