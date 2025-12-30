import type { InternalStreamEvent, TokenUsage } from '@/shared/types';
import type { ChatParams, ProviderAdapter } from '@/shared/providers/types';
import { createSSEStream } from '@/shared/providers/types';

export const openaiAdapter: ProviderAdapter = {
  name: 'openai',

  async chat({ messages, modelConfig, systemPrompt, signal }: ChatParams) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { modelName, temperature, maxTokens } = modelConfig;
    const normalizedModelName = modelName.toLowerCase();
    const isResponseApiModel =
      normalizedModelName.startsWith('gpt-5') && !normalizedModelName.includes('chat');
    const isTemperatureSupported =
      !isResponseApiModel ||
      (!normalizedModelName.includes('nano') && !normalizedModelName.includes('mini'));

    const formattedMessages = systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
      : messages;
    const inputMessages = messages.map(({ role, content }) => ({ role, content }));

    const response = await fetch(
      isResponseApiModel
        ? 'https://api.openai.com/v1/responses'
        : 'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(
          isResponseApiModel
            ? {
                model: modelName,
                input: inputMessages,
                ...(systemPrompt ? { instructions: systemPrompt } : {}),
                ...(isTemperatureSupported && { temperature: temperature ?? 0.7 }),
                ...(maxTokens && { max_output_tokens: maxTokens }),
                stream: true,
              }
            : {
                model: modelName,
                messages: formattedMessages,
                temperature: temperature ?? 0.7,
                ...(maxTokens && {
                  max_completion_tokens: maxTokens,
                }),
                stream_options: { include_usage: true },
                stream: true,
              },
        ),
        signal,
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
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
              if (isResponseApiModel) {
                const { type, delta } = parsed;
                if (type === 'response.output_text.delta' && typeof delta === 'string') {
                  yield { type: 'delta', data: delta };
                  continue;
                }
                if (type === 'response.completed' || type === 'response.done') {
                  const usage = parsed.response?.usage;
                  const tokenUsage = toTokenUsage(usage?.input_tokens, usage?.output_tokens);
                  if (tokenUsage) {
                    yield { type: 'usage', data: tokenUsage };
                  }
                  yield { type: 'done', data: '' };
                  return;
                }
                if (type === 'error' || type === 'response.error') {
                  yield {
                    type: 'error',
                    data: { error: parsed.error?.message || 'Unknown error' },
                  };
                  return;
                }
              } else {
                const usage = parsed.usage;
                const tokenUsage = toTokenUsage(usage?.prompt_tokens, usage?.completion_tokens);
                if (tokenUsage) {
                  yield { type: 'usage', data: tokenUsage };
                }
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  yield { type: 'delta', data: content };
                }
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
