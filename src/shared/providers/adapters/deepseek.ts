import type { InternalStreamEvent, TokenUsage } from '@/shared/types';
import type { ChatParams, ProviderAdapter } from '@/shared/providers/types';
import { createSSEStream } from '@/shared/providers/types';

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

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelConfig.modelName,
        messages: formattedMessages,
        temperature: modelConfig.temperature ?? 0.7,
        ...(modelConfig.maxTokens && { max_tokens: modelConfig.maxTokens }),
        stream: true,
      }),
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

    const toTokenUsage = (tokensIn?: number, tokensOut?: number): TokenUsage | null => {
      const normalizedTokensIn = tokensIn ?? 0;
      const normalizedTokensOut = tokensOut ?? 0;
      if (!normalizedTokensIn && !normalizedTokensOut) return null;
      return { tokensIn: normalizedTokensIn, tokensOut: normalizedTokensOut };
    };

    async function* streamGenerator(): AsyncGenerator<InternalStreamEvent> {
      const decoder = new TextDecoder();
      let buffer = '';
      let hasUsage = false;

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
              if (!hasUsage) {
                const usage = parsed.usage;
                const tokenUsage = toTokenUsage(usage?.prompt_tokens, usage?.completion_tokens);
                if (tokenUsage) {
                  hasUsage = true;
                  yield { type: 'usage', data: tokenUsage };
                }
              }
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
