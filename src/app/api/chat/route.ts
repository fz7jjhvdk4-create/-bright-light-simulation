import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getRoleById, getRolesForPhase } from '@/lib/roles';
import { generateSystemPrompt } from '@/lib/prompts';
import { getGroupByCode, startInterview, incrementQuestions, saveChatMessage, getChatHistory, logActivity } from '@/lib/db';
import { dataFiles } from '@/lib/data-generator';

const anthropic = new Anthropic();

const CHAT_MODEL = 'claude-sonnet-5';
const MAX_HISTORY = 10;
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request: NextRequest) {
  try {
    // The client only sends the new message — history is rebuilt from the
    // database so students can't fabricate earlier turns in the conversation.
    const { code, roleId, message } = await request.json();

    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Meddelande saknas' }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: 'Meddelandet är för långt (max 2000 tecken)' }, { status: 400 });
    }

    const role = getRoleById(roleId);
    if (!role) {
      return NextResponse.json({ error: 'Okänd roll' }, { status: 400 });
    }

    const group = await getGroupByCode(String(code || ''));
    if (!group) {
      return NextResponse.json({ error: 'Ogiltig gruppkod' }, { status: 403 });
    }

    // Roles unlock per phase (e.g. JUKI-teknikern first in phase 3)
    const roleAvailable = getRolesForPhase(group.phase).some(r => r.id === role.id);
    if (!roleAvailable) {
      return NextResponse.json(
        { error: `${role.name} är inte tillgänglig i er nuvarande fas` },
        { status: 403 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY saknas');
      return NextResponse.json(
        { error: 'AI-tjänsten är inte konfigurerad. Kontakta läraren.' },
        { status: 503 }
      );
    }

    // Read history before saving the new message
    const history = await getChatHistory(group.id, roleId);

    await startInterview(group.id, roleId);
    if (history.length === 0) {
      await logActivity(group.id, 'interview_started', `Intervju startad med ${role.name}`);
    }
    const questionsAsked = await incrementQuestions(group.id, roleId);
    await saveChatMessage(group.id, roleId, 'user', message.trim());

    // Build system prompt with data availability info
    let systemPrompt = generateSystemPrompt(role);

    if (role.hasData && role.dataFiles) {
      const availableData = role.dataFiles.map(id => {
        const file = dataFiles[id as keyof typeof dataFiles];
        return file ? file.name : id;
      }).join(', ');

      systemPrompt += `\n\n## DATA DU KAN DELA
Om studenten frågar om data, statistik eller vill se siffror, säg att du kan dela relevant data.
Använd formuleringen: "Jag kan skicka dig [datanamn] om du vill ha det."
Tillgänglig data: ${availableData}

När du erbjuder data, lägg till taggen [ERBJUD_DATA:${role.dataFiles.join(',')}] i slutet av ditt svar.`;
    }

    if (role.documents && role.documents.length > 0) {
      systemPrompt += `\n\n## DOKUMENT DU KAN DELA
Om studenten frågar djupgående frågor eller vill ha bevis, kan du nämna att du har dokument.
Lägg till taggen [ERBJUD_DOKUMENT:${role.documents.join(',')}] när du erbjuder dokument.`;
    }

    // Last N turns; merge consecutive same-role turns since the API requires alternation
    const recent = [
      ...history.map(m => ({
        role: m.role_type === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: m.content as string,
      })),
      { role: 'user' as const, content: message.trim() },
    ].slice(-MAX_HISTORY);

    const apiMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    for (const m of recent) {
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

    let responseText: string;
    try {
      const completion = await anthropic.messages.create({
        model: CHAT_MODEL,
        max_tokens: 500,
        // Sonnet 5 runs adaptive thinking by default; disabled here since the
        // roleplay replies are short — thinking would eat the token budget and
        // put a thinking block first in content
        thinking: { type: 'disabled' },
        system: systemPrompt,
        messages: apiMessages,
      });
      const textBlock = completion.content.find(b => b.type === 'text');
      responseText = textBlock?.type === 'text' && textBlock.text
        ? textBlock.text
        : 'Inget svar.';
    } catch (apiError) {
      console.error('Anthropic API error:', apiError);
      return NextResponse.json(
        { error: 'Kunde inte nå AI-tjänsten just nu. Försök igen om en stund.' },
        { status: 502 }
      );
    }

    // Parse data/document offers from response
    const dataOfferMatch = responseText.match(/\[ERBJUD_DATA:([^\]]+)\]/);
    const docOfferMatch = responseText.match(/\[ERBJUD_DOKUMENT:([^\]]+)\]/);

    // Remove tags from visible response
    responseText = responseText
      .replace(/\[ERBJUD_DATA:[^\]]+\]/g, '')
      .replace(/\[ERBJUD_DOKUMENT:[^\]]+\]/g, '')
      .trim();

    await saveChatMessage(group.id, roleId, 'assistant', responseText);

    return NextResponse.json({
      response: responseText,
      questionsAsked: questionsAsked ?? null,
      offeredData: dataOfferMatch ? dataOfferMatch[1].split(',') : null,
      offeredDocuments: docOfferMatch ? docOfferMatch[1].split(',') : null,
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Ett tekniskt fel uppstod. Försök igen.' },
      { status: 500 }
    );
  }
}
