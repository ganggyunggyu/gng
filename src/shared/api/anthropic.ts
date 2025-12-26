import type { ProviderAdapter, ChatParams } from './types';
import type { InternalStreamEvent } from '@/shared/types';
import { createSSEStream } from './types';
import { aiApiClient } from './axios-instance';
import type { Readable } from 'stream';

export const anthropicAdapter: ProviderAdapter = {
  name: 'anthropic',

  async chat({ messages, modelConfig, systemPrompt, signal }: ChatParams) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const formattedMessages = messages.map((m) => ({
      role: m.role === 'system' ? 'user' : m.role,
      content: m.content,
    }));

    const response = await aiApiClient.post<Readable>(
      'https://api.anthropic.com/v1/messages',
      {
        model: modelConfig.modelName,
        system: systemPrompt,
        messages: formattedMessages,
        max_tokens: modelConfig.maxTokens ?? 4096,
        stream: true,
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        responseType: 'stream',
        signal,
      },
    );

    const stream = response.data;

    async function* streamGenerator(): AsyncGenerator<InternalStreamEvent> {
      let buffer = '';

      try {
        for await (const chunk of stream) {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;

            const data = trimmed.slice(5).trim();
            if (data === '[DONE]') {
              yield { type: 'done', data: '' };
              return;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'content_block_delta') {
                const content = parsed.delta?.text;
                if (content) {
                  yield { type: 'delta', data: content };
                }
              } else if (parsed.type === 'message_stop') {
                yield { type: 'done', data: '' };
                return;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
        yield { type: 'done', data: '' };
      } catch (error) {
        yield {
          type: 'error',
          data: { error: error instanceof Error ? error.message : 'Unknown error' },
        };
      }
    }

    return createSSEStream(streamGenerator());
  },
};
