import { NextRequest, NextResponse } from 'next/server';
import { getGroupByCode, getChatHistory } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');

    if (!roleId) {
      return NextResponse.json({ error: 'roleId krävs' }, { status: 400 });
    }

    const group = await getGroupByCode(code.toUpperCase());
    if (!group) {
      return NextResponse.json({ error: 'Grupp hittades inte' }, { status: 404 });
    }

    const history = await getChatHistory(group.id, roleId);

    return NextResponse.json({
      success: true,
      messages: history.map(msg => ({
        role: msg.role_type,
        content: msg.content,
        timestamp: msg.timestamp
      }))
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Kunde inte hämta chatthistorik' }, { status: 500 });
  }
}
