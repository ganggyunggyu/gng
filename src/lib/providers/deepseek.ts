import type { ProviderAdapter, ChatParams } from './types';
import type { InternalStreamEvent } from '@/types';
import { createSSEStream } from './types';

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

    const body: Record<string, unknown> = {
      model: modelConfig.modelName,
      messages: formattedMessages,
      stream: true,
    };

    if (modelConfig.temperature !== undefined) {
      body.temperature = modelConfig.temperature;
    }
    if (modelConfig.maxTokens !== undefined) {
      body.max_tokens = modelConfig.maxTokens;
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    async function* streamGenerator(): AsyncGenerator<InternalStreamEvent> {
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
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
