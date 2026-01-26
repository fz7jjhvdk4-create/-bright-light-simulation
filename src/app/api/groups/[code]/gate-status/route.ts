import { NextRequest, NextResponse } from 'next/server';
import { getGroupByCode, getInterviews, getDownloads, getProjectDefinition, getInvestigationReport } from '@/lib/db';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

interface GateRequirements {
  gate1: {
    items: Array<{ name: string; met: boolean; description: string }>;
    allMet: boolean;
  };
  gate2: {
    items: Array<{ name: string; met: boolean; description: string }>;
    allMet: boolean;
  };
  gate3: {
    items: Array<{ name: string; met: boolean; description: string }>;
    allMet: boolean;
  };
  gate4: {
    items: Array<{ name: string; met: boolean; description: string }>;
    allMet: boolean;
  };
}

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

    // Get all data needed to check requirements
    const interviews = await getInterviews(group.id);
    const downloads = await getDownloads(group.id);
    const projectDef = await getProjectDefinition(group.id);
    const investigationReport = await getInvestigationReport(group.id);

    // Get proposals count
    const proposalsResult = await sql`
      SELECT COUNT(*) as count FROM action_proposals WHERE group_id = ${group.id}
    `;
    const proposalsCount = parseInt(proposalsResult.rows[0].count);

    // Get 7QC/7QM/5Why usage from localStorage would need to be stored in DB
    // For now, we'll check if they have data (this should be enhanced)

    // Gate 1 requirements: Project definition (syfte, mål, avgränsningar)
    const gate1Items = [
      {
        name: 'Syfte formulerat',
        met: !!(projectDef?.purpose && projectDef.purpose.length > 10),
        description: 'Projektets syfte ska vara tydligt beskrivet'
      },
      {
        name: 'SMART-mål definierade',
        met: !!(projectDef?.goals && projectDef.goals.length > 10),
        description: 'Projektmål enligt SMART-kriterierna'
      },
      {
        name: 'Avgränsningar specificerade',
        met: !!(projectDef?.exclusions && projectDef.exclusions.length > 5),
        description: 'Vad som inte ingår i projektet'
      }
    ];

    // Gate 2 requirements: WBS, Gantt, Intressentanalys, Riskanalys
    // These are stored in localStorage, so we check if project definition exists as proxy
    // In a full implementation, these would be stored in DB
    const gate2Items = [
      {
        name: 'WBS med aktiviteter',
        met: true, // Assumed if they've progressed - should check localStorage/DB
        description: 'Work Breakdown Structure skapad'
      },
      {
        name: 'Tidplan/Gantt',
        met: true, // Assumed
        description: 'Gantt-schema med aktiviteter och milstolpar'
      },
      {
        name: 'Intressentanalys',
        met: true, // Assumed
        description: 'Power/Interest-matris genomförd'
      },
      {
        name: 'Riskanalys med åtgärder',
        met: true, // Assumed
        description: 'Risker identifierade med sannolikhet och konsekvens'
      }
    ];

    // Gate 3 requirements: Investigation phase
    const gate3Items = [
      {
        name: 'Minst 6 roller intervjuade',
        met: interviews.length >= 6,
        description: `${interviews.length} av 6 roller intervjuade`
      },
      {
        name: 'Relevant data nedladdad',
        met: downloads.length >= 1,
        description: `${downloads.length} datafiler nedladdade`
      },
      {
        name: 'Minst 4 st 7QC-verktyg använda',
        met: false, // Need to track this
        description: 'Paretodiagram, Ishikawa, Histogram, etc.'
      },
      {
        name: 'Minst 2 st 7QM-verktyg använda',
        met: false, // Need to track this
        description: 'Affinitetsdiagram, Relationsdiagram, etc.'
      },
      {
        name: '5 Varför-analys genomförd',
        met: false, // Need to track this
        description: 'Rotorsaksanalys med 5 Varför'
      }
    ];

    // Gate 4 requirements: Presentation/reporting phase
    const gate4Items = [
      {
        name: 'Handlingsplan med minst 3 åtgärder',
        met: proposalsCount >= 3,
        description: `${proposalsCount} av 3 åtgärder dokumenterade`
      },
      {
        name: 'Ansvarig angiven för varje åtgärd',
        met: proposalsCount >= 3, // Simplified check
        description: 'Varje åtgärd har en ansvarig person'
      },
      {
        name: 'Tidplan angiven för varje åtgärd',
        met: proposalsCount >= 3, // Simplified check
        description: 'Varje åtgärd har en tidplan'
      },
      {
        name: 'Total reduktion >50%',
        met: false, // Need to calculate from proposals
        description: 'Förväntad total reduktion av reklamationskostnader'
      }
    ];

    const requirements: GateRequirements = {
      gate1: {
        items: gate1Items,
        allMet: gate1Items.every(item => item.met)
      },
      gate2: {
        items: gate2Items,
        allMet: gate2Items.every(item => item.met)
      },
      gate3: {
        items: gate3Items,
        allMet: gate3Items.every(item => item.met)
      },
      gate4: {
        items: gate4Items,
        allMet: gate4Items.every(item => item.met)
      }
    };

    return NextResponse.json({
      success: true,
      phase: group.phase,
      gate1Status: (group as any).gate1_status || 'not_submitted',
      gate2Status: (group as any).gate2_status || 'not_submitted',
      gate3Status: (group as any).gate3_status || 'not_submitted',
      gate4Status: (group as any).gate4_status || 'not_submitted',
      requirements,
      stats: {
        interviewsCount: interviews.length,
        downloadsCount: downloads.length,
        proposalsCount,
        hasProjectDefinition: !!projectDef,
        hasInvestigationReport: !!investigationReport
      }
    });
  } catch (error) {
    console.error('Error getting gate status:', error);
    return NextResponse.json(
      { error: 'Kunde inte hämta gate-status' },
      { status: 500 }
    );
  }
}
