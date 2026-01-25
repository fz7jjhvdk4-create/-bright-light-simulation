import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    }
  };

  try {
    // Test database connection
    const result = await sql`SELECT NOW() as time, current_database() as db`;
    checks.database = {
      connected: true,
      time: result.rows[0]?.time,
      db: result.rows[0]?.db
    };

    // Check if groups table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'groups'
      ) as exists
    `;
    checks.groupsTable = tableCheck.rows[0]?.exists;

  } catch (error) {
    checks.database = {
      connected: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }

  return NextResponse.json(checks);
}
