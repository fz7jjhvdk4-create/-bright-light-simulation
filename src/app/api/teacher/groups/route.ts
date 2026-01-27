import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';
import { deleteGroup } from '@/lib/db';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
        g.gate1_status,
        g.gate2_status,
        g.gate3_status,
        g.gate4_status,
        (SELECT COUNT(*) FROM interviews WHERE group_id = g.id) as interviews_count,
        (SELECT COUNT(*) FROM downloads WHERE group_id = g.id) as downloads_count,
        (SELECT COUNT(*) FROM action_proposals WHERE group_id = g.id) as proposals_count
      FROM groups g
      ORDER BY g.created_at DESC
    `;

    const response = NextResponse.json({
      success: true,
      groups: result.rows.map(g => ({
        id: g.id,
        code: g.code,
        name: g.name,
        studentNames: g.student_names,
        phase: g.phase,
        status: g.status,
        createdAt: g.created_at,
        gate1Status: g.gate1_status || 'not_submitted',
        gate2Status: g.gate2_status || 'not_submitted',
        gate3Status: g.gate3_status || 'not_submitted',
        gate4Status: g.gate4_status || 'not_submitted',
        interviewsCount: parseInt(g.interviews_count),
        downloadsCount: parseInt(g.downloads_count),
        proposalsCount: parseInt(g.proposals_count)
      }))
    });

    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Error fetching groups:', error);
    return Response.json(
      { success: false, error: 'Kunde inte hämta grupper' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { groupId } = await request.json();

    if (!groupId) {
      return NextResponse.json(
        { success: false, error: 'Grupp-ID krävs' },
        { status: 400 }
      );
    }

    const deleted = await deleteGroup(groupId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Gruppen hittades inte' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Grupp "${deleted.name}" (${deleted.code}) har tagits bort`
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { success: false, error: 'Kunde inte ta bort gruppen' },
      { status: 500 }
    );
  }
}
