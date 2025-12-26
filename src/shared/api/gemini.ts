import type { ProviderAdapter, ChatParams } from './types';
import type { InternalStreamEvent } from '@/shared/types';
import { createSSEStream } from './types';
import { aiApiClient } from './axios-instance';
import type { Readable } from 'stream';

export const geminiAdapter: ProviderAdapter = {
  name: 'gemini',

  async chat({ messages, modelConfig, systemPrompt, signal }: ChatParams) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await aiApiClient.post<Readable>(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelConfig.modelName}:streamGenerateContent?key=${apiKey}&alt=sse`,
      {
        contents,
        systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
        generationConfig: {
          temperature: modelConfig.temperature ?? 0.7,
          maxOutputTokens: modelConfig.maxTokens ?? 4096,
        },
      },
      {
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
            if (!data) continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
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
