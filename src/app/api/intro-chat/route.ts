import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, messages } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        response: 'Maria Ek: Ursäkta, vi har tekniska problem just nu. Försök igen om en stund.',
      }, { status: 200 });
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
        max_tokens: 400,
        system: systemPrompt,
        messages: messages.slice(-10).map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content
        }))
      })
    });

    if (!response.ok) {
      console.error('Anthropic API error:', response.status);
      return NextResponse.json({
        response: 'Ursäkta, jag blev distraherad. Kan du upprepa frågan?',
      }, { status: 200 });
    }

    const data = await response.json();
    const responseText = data.content[0]?.text || 'Hmm, låt mig tänka på det...';

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('Intro chat error:', error);
    return NextResponse.json({
      response: 'Ett tekniskt fel uppstod. Försök igen.',
    }, { status: 200 });
  }
}
