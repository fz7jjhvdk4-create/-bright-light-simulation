import { NextRequest, NextResponse } from 'next/server';
import { getRoleById } from '@/lib/roles';
import { generateSystemPrompt } from '@/lib/prompts';
import { getGroupByCode, startInterview, incrementQuestions, saveChatMessage, getChatHistory, logActivity } from '@/lib/db';
import { dataFiles } from '@/lib/data-generator';

export async function POST(request: NextRequest) {
  try {
    const { groupId, roleId, messages } = await request.json();

    const role = getRoleById(roleId);
    if (!role) {
      return NextResponse.json({ error: 'Okänd roll' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY saknas');
      return NextResponse.json({
        response: `[${role.name} är inte tillgänglig just nu. Kontakta läraren.]`,
        error: 'API-konfiguration saknas'
      }, { status: 200 });
    }

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1];

    // Log the interview start if first message
    if (groupId && messages.length === 1) {
      try {
        await startInterview(groupId, roleId);
        await logActivity(groupId, 'interview_started', `Intervju startad med ${role.name}`);
      } catch (e) {
        console.error('Could not log interview:', e);
      }
    }

    // Increment question count
    if (groupId) {
      try {
        await incrementQuestions(groupId, roleId);
        await saveChatMessage(groupId, roleId, 'user', lastUserMessage.content);
      } catch (e) {
        console.error('Could not save message:', e);
      }
    }

    // Build system prompt with data availability info
    let systemPrompt = generateSystemPrompt(role);

    // Add data sharing instructions if this role has data
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

    // Add document sharing instructions
    if (role.documents && role.documents.length > 0) {
      systemPrompt += `\n\n## DOKUMENT DU KAN DELA
Om studenten frågar djupgående frågor eller vill ha bevis, kan du nämna att du har dokument.
Lägg till taggen [ERBJUD_DOKUMENT:${role.documents.join(',')}] när du erbjuder dokument.`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: systemPrompt,
        messages: messages.slice(-10).map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content
        }))
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return NextResponse.json({
        response: `${role.name}: Ursäkta, jag måste tänka på det. Kan du fråga igen?`,
      }, { status: 200 });
    }

    const data = await response.json();
    let responseText = data.content[0]?.text || 'Inget svar.';

    // Parse data/document offers from response
    const dataOfferMatch = responseText.match(/\[ERBJUD_DATA:([^\]]+)\]/);
    const docOfferMatch = responseText.match(/\[ERBJUD_DOKUMENT:([^\]]+)\]/);

    // Remove tags from visible response
    responseText = responseText
      .replace(/\[ERBJUD_DATA:[^\]]+\]/g, '')
      .replace(/\[ERBJUD_DOKUMENT:[^\]]+\]/g, '')
      .trim();

    // Save assistant message
    if (groupId) {
      try {
        await saveChatMessage(groupId, roleId, 'assistant', responseText);
      } catch (e) {
        console.error('Could not save assistant message:', e);
      }
    }

    return NextResponse.json({
      response: responseText,
      offeredData: dataOfferMatch ? dataOfferMatch[1].split(',') : null,
      offeredDocuments: docOfferMatch ? docOfferMatch[1].split(',') : null,
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({
      response: 'Ett tekniskt fel uppstod. Försök igen.',
      error: 'server_error'
    }, { status: 200 });
  }
}
