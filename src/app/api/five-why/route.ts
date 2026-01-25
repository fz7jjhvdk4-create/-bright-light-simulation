import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, type } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt krävs' },
        { status: 400 }
      );
    }

    const systemPrompt = type === 'analysis'
      ? `Du är en kvalitetsexpert som hjälper till att analysera problem med 5 Varför-metoden.
         Ge alltid svar på svenska. När du ombeds ge JSON, svara ENDAST med valid JSON utan extra text.`
      : `Du är en kvalitetsexpert som hjälper till med 5 Varför-analyser.
         Ge alltid svar på svenska. Var kortfattad och fokuserad.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const textContent = message.content.find(block => block.type === 'text');
    const response = textContent ? textContent.text : '';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Five Why API error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid analysen' },
      { status: 500 }
    );
  }
}
