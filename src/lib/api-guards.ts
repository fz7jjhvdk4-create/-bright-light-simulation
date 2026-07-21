import { NextResponse } from 'next/server';
import { Group } from './db';

// Phase gating for write endpoints. The UI hides locked tools, but the API
// must enforce the same rule — clients can call endpoints directly.
export function requirePhase(group: Group, minPhase: number): NextResponse | null {
  if (group.phase < minPhase) {
    return NextResponse.json(
      {
        success: false,
        error: `Det här momentet låses upp i fas ${minPhase}. Er grupp är i fas ${group.phase}.`,
      },
      { status: 403 }
    );
  }
  return null;
}
