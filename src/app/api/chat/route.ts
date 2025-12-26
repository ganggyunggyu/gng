import { NextRequest } from 'next/server';
import { getAdapter } from '@/lib/providers';
import { db } from '@/lib/db';
import type { InternalMessage } from '@/types';

export const maxDuration = 60;

interface ChatRequestBody {
  projectId: string;
  threadId: string;
  messages: InternalMessage[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { projectId, messages } = body;

    const project = await db.projects.get(projectId);
    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const promptVersion = project.currentPromptVersionId
      ? await db.promptVersions.get(project.currentPromptVersionId)
      : null;

    const systemPrompt = promptVersion
      ? [
          promptVersion.layers.systemBase,
          promptVersion.layers.persona,
          promptVersion.layers.constraints,
          promptVersion.layers.toolsPolicy,
        ]
          .filter(Boolean)
          .join('\n\n')
      : undefined;

    const adapter = getAdapter(project.modelConfig.provider);

    const stream = await adapter.chat({
      messages,
      modelConfig: project.modelConfig,
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
