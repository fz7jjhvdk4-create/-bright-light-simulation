import { getGroupByCode, recordDownload } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { fileId } = await request.json();

    if (!fileId) {
      return Response.json(
        { success: false, error: 'Fil-ID saknas' },
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

    await recordDownload(group.id, fileId);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Download record error:', error);
    return Response.json(
      { success: false, error: 'Kunde inte registrera nedladdning' },
      { status: 500 }
    );
  }
}
