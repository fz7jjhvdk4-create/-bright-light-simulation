import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

export async function POST() {
  try {
    const result = await initializeDatabase();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Databas initialiserad'
      });
    } else {
      return NextResponse.json(
        { error: 'Databasinitialisering misslyckades', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Kunde inte initalisera databas' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Använd POST för att initalisera databasen'
  });
}
