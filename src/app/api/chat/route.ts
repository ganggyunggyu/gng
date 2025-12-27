import { NextRequest } from 'next/server';
import { getAdapter } from '@/shared/providers';
import type { InternalMessage, ModelConfig } from '@/shared/types';

export const maxDuration = 60;

interface ChatRequestBody {
  messages: InternalMessage[];
  modelConfig: ModelConfig;
  systemPrompt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, modelConfig, systemPrompt }: ChatRequestBody = await request.json();

    if (!modelConfig?.provider || !modelConfig?.modelName) {
      return new Response(JSON.stringify({ error: 'modelConfig is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const adapter = getAdapter(modelConfig.provider);

    const stream = await adapter.chat({
      messages,
      modelConfig,
      systemPrompt,
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
