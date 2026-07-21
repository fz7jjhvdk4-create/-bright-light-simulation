import { NextRequest, NextResponse } from 'next/server';
import { getGroupByCode, saveBudgetAllocation, getBudgetAllocation, logActivity } from '@/lib/db';
import { requirePhase } from '@/lib/api-guards';

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

    const allocations = await getBudgetAllocation(group.id);

    return NextResponse.json({ success: true, allocations });
  } catch (error) {
    console.error('Error fetching budget allocation:', error);
    return NextResponse.json({ error: 'Kunde inte hämta budgetallokering' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { allocations } = await request.json();

    const group = await getGroupByCode(code.toUpperCase());
    if (!group) {
      return NextResponse.json({ error: 'Grupp hittades inte' }, { status: 404 });
    }
    const phaseError = requirePhase(group, 4);
    if (phaseError) return phaseError;

    if (!Array.isArray(allocations)) {
      return NextResponse.json({ error: 'Ogiltig allokeringslista' }, { status: 400 });
    }

    await saveBudgetAllocation(group.id, allocations);
    await logActivity(group.id, 'budget_allocated', 'Budgetallokering sparad');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving budget allocation:', error);
    return NextResponse.json({ error: 'Kunde inte spara budgetallokering' }, { status: 500 });
  }
}
