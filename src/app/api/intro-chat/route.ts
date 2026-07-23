import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getGroupByCode } from '@/lib/db';
import { sql } from '@vercel/postgres';

const anthropic = new Anthropic();

const CHAT_MODEL = 'claude-sonnet-5';
const MAX_HISTORY = 10;
const MAX_MESSAGE_LENGTH = 2000;

const MARIA_INTRO_PROMPT = `Du är Maria Ek, VD för Bright Light Solutions AB. Du har ett inledande möte med projektteamet som ska utreda era kvalitetsproblem.

VIKTIGT:
- Beskriv PROBLEMET (ökade reklamationer) men INTE orsakerna - det ska de utreda
- Var tydlig med att detta är ett UTREDNINGSPROJEKT först, sedan implementering
- Ge dem budget (800 000 SEK) och tidsram (6 månader för utredning, sedan 6 månader implementering)
- Introducera styrgruppen (du, Anna Berg ekonomichef, Henrik Wallin från styrelsen)
- Betona att de måste börja med att PLANERA projektet innan de börjar intervjua folk
- Du vet INTE vad som orsakar problemen - det är deras jobb att ta reda på

BAKGRUND du kan dela:
- Reklamationerna har ökat från 412 till 847 på två år
- Kostnaderna har gått från 2,1 till 4,8 MSEK
- Styrelsen är orolig och kräver resultat
- Det finns olika teorier internt men ingen vet säkert vad som är fel

PERSONLIGHET: Resultatinriktad, rak, lite stressad. Styrelsen andas dig i nacken.

Svara ALLTID på svenska och håll svaren korta och koncisa (max 3-4 meningar per svar).`;

async function buildPhase2Prompt(groupId: number): Promise<string> {
  const result = await sql`
    SELECT description, cost FROM action_proposals WHERE group_id = ${groupId}
  `;
  const proposalSummary = result.rows
    .map(p => `- ${p.description} (${p.cost ? Number(p.cost).toLocaleString('sv-SE') : 'okänd'} SEK)`)
    .join('\n');

  return `Du är Maria Ek, VD för Bright Light Solutions AB. Du har ett uppföljningsmöte med projektteamet som nu ska implementera sina åtgärdsförslag.

KONTEXT:
Teamet har genomfört en utredning i Fas 1 och identifierat följande åtgärdsförslag:
${proposalSummary || '(Inga åtgärdsförslag registrerade ännu)'}

DITT UPPDRAG I DETTA MÖTE:
- Gratulera dem till en bra utredning
- Bekräfta att styrgruppen (du, Anna Berg, Henrik Wallin) har godkänt åtgärdsförslagen
- Förklara att de nu har 9 månader och resterande budget att genomföra implementeringen
- Betona vikten av:
  * Detaljerad planering (WBS, tidplan, resurser)
  * Regelbunden rapportering till styrgruppen
  * Riskhantering och förändringsledning
  * Att involvera Kenneth Johansson som förändringsledare på golvet

PERSONLIGHET: Resultatinriktad men nu mer positiv och hoppfull. Du ser framåt.

Svara ALLTID på svenska och håll svaren korta och koncisa (max 3-4 meningar per svar).`;
}

export async function POST(request: NextRequest) {
  try {
    // The system prompt lives on the server — the client only picks which
    // meeting it is and must present a valid group code.
    const { code, meeting, messages } = await request.json();

    const group = await getGroupByCode(String(code || ''));
    if (!group) {
      return NextResponse.json({ error: 'Ogiltig gruppkod' }, { status: 403 });
    }

    if (meeting !== 'intro' && meeting !== 'phase2') {
      return NextResponse.json({ error: 'Okänt möte' }, { status: 400 });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Meddelanden saknas' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY saknas');
      return NextResponse.json(
        { error: 'AI-tjänsten är inte konfigurerad. Kontakta läraren.' },
        { status: 503 }
      );
    }

    const systemPrompt = meeting === 'intro'
      ? MARIA_INTRO_PROMPT
      : await buildPhase2Prompt(group.id);

    // Sanitize client history: only role + bounded text content,
    // merged to strict user/assistant alternation as the API requires
    const sanitized = messages
      .slice(-MAX_HISTORY)
      .map((m: { role?: string; content?: string }) => ({
        role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: String(m.content || '').slice(0, MAX_MESSAGE_LENGTH),
      }))
      .filter(m => m.content.trim().length > 0);

    const apiMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    for (const m of sanitized) {
      const prev = apiMessages[apiMessages.length - 1];
      if (prev && prev.role === m.role) {
        prev.content += `\n${m.content}`;
      } else {
        apiMessages.push({ ...m });
      }
    }
    while (apiMessages.length > 0 && apiMessages[0].role !== 'user') {
      apiMessages.shift();
    }
    if (apiMessages.length === 0) {
      return NextResponse.json({ error: 'Meddelanden saknas' }, { status: 400 });
    }

    let responseText: string;
    try {
      const completion = await anthropic.messages.create({
        model: CHAT_MODEL,
        max_tokens: 400,
        // Sonnet 5 runs adaptive thinking by default; disabled for short roleplay replies
        thinking: { type: 'disabled' },
        system: systemPrompt,
        messages: apiMessages,
      });
      const textBlock = completion.content.find(b => b.type === 'text');
      responseText = textBlock?.type === 'text' && textBlock.text
        ? textBlock.text
        : 'Hmm, låt mig tänka på det...';
    } catch (apiError) {
      console.error('Anthropic API error:', apiError);
      return NextResponse.json(
        { error: 'Kunde inte nå AI-tjänsten just nu. Försök igen om en stund.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('Intro chat error:', error);
    return NextResponse.json(
      { error: 'Ett tekniskt fel uppstod. Försök igen.' },
      { status: 500 }
    );
  }
}
