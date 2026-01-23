import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { getRoleById } from '@/lib/roles';
import { generateSystemPrompt } from '@/lib/prompts';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { groupId, roleId, messages } = await request.json();

    if (!roleId || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'roleId och messages krävs' },
        { status: 400 }
      );
    }

    const role = getRoleById(roleId);
    if (!role) {
      return NextResponse.json(
        { error: 'Roll hittades inte' },
        { status: 404 }
      );
    }

    const systemPrompt = generateSystemPrompt(role);

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const textContent = response.content.find(block => block.type === 'text');
    const responseText = textContent && 'text' in textContent ? textContent.text : '';

    // TODO: Log the interaction to database when groupId is provided
    // await logActivity(groupId, 'chat_message', `Intervju med ${role.name}`);
    // await incrementQuestions(groupId, roleId);

    return NextResponse.json({
      success: true,
      response: responseText,
      role: {
        id: role.id,
        name: role.name,
        hasData: role.hasData,
        dataFiles: role.dataFiles,
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Kunde inte få svar' },
      { status: 500 }
    );
  }
}
