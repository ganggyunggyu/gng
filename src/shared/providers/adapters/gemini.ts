import type { InternalStreamEvent, TokenUsage } from '@/shared/types';
import type { ChatParams, ProviderAdapter } from '@/shared/providers/types';
import { createSSEStream } from '@/shared/providers/types';

export const geminiAdapter: ProviderAdapter = {
  name: 'gemini',

  async chat({ messages, modelConfig, systemPrompt, signal }: ChatParams) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const modelAliases: Record<string, string> = {
      'gemini-3.0-flash': 'gemini-3-flash-preview',
    };
    const resolvedModelName =
      modelAliases[modelConfig.modelName] ?? modelConfig.modelName;

    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${resolvedModelName}:streamGenerateContent?key=${apiKey}&alt=sse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
          generationConfig: {
            temperature: modelConfig.temperature ?? 0.7,
            ...(modelConfig.maxTokens && { maxOutputTokens: modelConfig.maxTokens }),
          },
        }),
        signal,
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
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
            if (!data) continue;

            try {
              const parsed = JSON.parse(data);
              if (!hasUsage) {
                const usage = parsed.usageMetadata;
                const tokenUsage = toTokenUsage(
                  usage?.promptTokenCount,
                  usage?.candidatesTokenCount,
                );
                if (tokenUsage) {
                  hasUsage = true;
                  yield { type: 'usage', data: tokenUsage };
                }
              }
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
