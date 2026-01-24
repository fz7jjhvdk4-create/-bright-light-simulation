import { NextRequest, NextResponse } from 'next/server';
import { getGroupByCode, saveProjectDefinition, getProjectDefinition, logActivity } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const group = await getGroupByCode(code.toUpperCase());

    if (!group) {
      return NextResponse.json({ error: 'Grupp hittades inte' }, { status: 404 });
    }

    const definition = await getProjectDefinition(group.id);

    return NextResponse.json({
      success: true,
      definition: definition ? {
        purpose: definition.purpose,
        goals: definition.goals,
        scope: definition.scope,
        exclusions: definition.exclusions,
        success_criteria: definition.success_criteria,
      } : null
    });
  } catch (error) {
    console.error('Error fetching project definition:', error);
    return NextResponse.json({ error: 'Kunde inte hämta projektdefinition' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const group = await getGroupByCode(code.toUpperCase());

    if (!group) {
      return NextResponse.json({ error: 'Grupp hittades inte' }, { status: 404 });
    }

    const body = await request.json();
    const { purpose, goals, scope, exclusions, success_criteria } = body;

    await saveProjectDefinition(group.id, {
      purpose: purpose || '',
      goals: goals || '',
      scope: scope || '',
      exclusions: exclusions || '',
      success_criteria: success_criteria || '',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving project definition:', error);
    return NextResponse.json({ error: 'Kunde inte spara projektdefinition' }, { status: 500 });
  }
}
