import type { ProviderAdapter, ChatParams } from './types';
import type { InternalStreamEvent } from '@/shared/types';
import { createSSEStream } from './types';
import { aiApiClient } from './axios-instance';
import type { Readable } from 'stream';

export const deepseekAdapter: ProviderAdapter = {
  name: 'deepseek',

  async chat({ messages, modelConfig, systemPrompt, signal }: ChatParams) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    const formattedMessages = systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
      : messages;

    const response = await aiApiClient.post<Readable>(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: modelConfig.modelName,
        messages: formattedMessages,
        temperature: modelConfig.temperature ?? 0.7,
        max_tokens: modelConfig.maxTokens ?? 4096,
        stream: true,
      },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
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
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield { type: 'delta', data: content };
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
