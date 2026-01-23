import { getGroupByCode, logActivity } from '@/lib/db';
import { sql } from '@vercel/postgres';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { documentId } = await request.json();

    if (!documentId) {
      return Response.json(
        { success: false, error: 'Dokument-ID saknas' },
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

    // Record the document view
    await sql`
      INSERT INTO document_views (group_id, document_id)
      VALUES (${group.id}, ${documentId})
      ON CONFLICT (group_id, document_id) DO NOTHING
    `;

    await logActivity(group.id, 'document_viewed', `Dokument visat: ${documentId}`);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Document view error:', error);
    return Response.json(
      { success: false, error: 'Kunde inte registrera dokumentvisning' },
      { status: 500 }
    );
  }
}
