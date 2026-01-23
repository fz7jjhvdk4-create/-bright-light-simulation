import { NextRequest, NextResponse } from 'next/server';
import { createGroup, initializeDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { name, studentNames } = await request.json();

    if (!name || !studentNames) {
      return NextResponse.json(
        { error: 'Gruppnamn och studentnamn krävs' },
        { status: 400 }
      );
    }

    // Try to create the group - if tables don't exist, initialize them first
    let group;
    try {
      group = await createGroup(name, studentNames);
    } catch (dbError: unknown) {
      // Check if it's a "relation does not exist" error
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
        console.log('Tables do not exist, initializing database...');
        await initializeDatabase();
        // Retry creating the group
        group = await createGroup(name, studentNames);
      } else {
        throw dbError;
      }
    }

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
