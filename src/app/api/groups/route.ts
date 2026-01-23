import { NextRequest, NextResponse } from 'next/server';
import { createGroup } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name, studentNames } = await request.json();

    if (!name || !studentNames) {
      return NextResponse.json(
        { error: 'Gruppnamn och studentnamn krävs' },
        { status: 400 }
      );
    }

    const group = await createGroup(name, studentNames);

    return NextResponse.json({
      success: true,
      group: {
        id: group.id,
        code: group.code,
        name: group.name,
        phase: group.phase,
        status: group.status
      }
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Kunde inte skapa grupp' },
      { status: 500 }
    );
  }
}
