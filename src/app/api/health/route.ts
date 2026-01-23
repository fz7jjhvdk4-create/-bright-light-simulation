import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  const checks = {
    api: true,
    database: false,
    tables: false,
    error: null as string | null
  };

  try {
    // Test database connection
    const result = await sql`SELECT 1 as test`;
    checks.database = result.rows[0]?.test === 1;

    // Check if tables exist
    const tablesCheck = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('groups', 'activity_log', 'interviews', 'downloads')
    `;
    checks.tables = tablesCheck.rows.length >= 4;

    return NextResponse.json({
      status: checks.database && checks.tables ? 'healthy' : 'degraded',
      checks,
      message: checks.tables
        ? 'Allt fungerar!'
        : 'Databastabeller saknas. Besök /api/init för att skapa dem.'
    });
  } catch (error) {
    checks.error = String(error);
    return NextResponse.json({
      status: 'error',
      checks,
      message: 'Kunde inte ansluta till databasen. Kontrollera POSTGRES_URL.',
      suggestion: 'Se till att POSTGRES_URL är konfigurerad i Vercel Environment Variables.'
    }, { status: 500 });
  }
}
