import { NextRequest, NextResponse } from 'next/server';
import { getGroupByCode, logActivity } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { action, detail } = await request.json();

    if (!action || !detail) {
      return NextResponse.json(
        { error: 'Action och detail krävs' },
        { status: 400 }
      );
    }

    const group = await getGroupByCode(code.toUpperCase());
    if (!group) {
      return NextResponse.json({ error: 'Grupp hittades inte' }, { status: 404 });
    }

    await logActivity(group.id, action, detail);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { error: 'Kunde inte logga aktivitet' },
      { status: 500 }
    );
  }
}
