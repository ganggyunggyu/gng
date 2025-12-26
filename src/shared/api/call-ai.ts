import type { InternalMessage, Provider } from '@/shared/types';
import { getAdapter } from './index';
import { getProviderFromModel, type ModelName } from './models';

export interface CallAIParams {
  model: ModelName | string;
  messages: InternalMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface CallAIResult {
  content: string;
  provider: Provider;
  model: string;
}

/**
 * 통합 AI 호출 함수 (비스트리밍)
 *
 * @example
 * ```ts
 * import { callAI, Model } from '@/lib/providers';
 *
 * const result = await callAI({
 *   model: Model.GPT4O,
 *   messages: [{ role: 'user', content: '안녕!' }],
 *   systemPrompt: '친절한 어시스턴트',
 * });
 *
 * console.log(result.content);
 * ```
 */
export async function callAI({
  model,
  messages,
  systemPrompt,
  temperature = 0.7,
  maxTokens = 4096,
  signal,
}: CallAIParams): Promise<CallAIResult> {
  const provider = getProviderFromModel(model);
  const adapter = getAdapter(provider);

  const stream = await adapter.chat({
    messages,
    modelConfig: {
      provider,
      modelName: model,
      temperature,
      maxTokens,
    },
    systemPrompt,
    signal,
  });

  // 스트림을 문자열로 수집
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let content = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (!data) continue;

      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'delta' && typeof parsed.data === 'string') {
          content += parsed.data;
        } else if (parsed.type === 'error') {
          throw new Error(parsed.data?.error || 'Unknown error');
        }
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }

  return { content, provider, model };
}

/**
 * 통합 AI 호출 함수 (스트리밍)
 *
 * @example
 * ```ts
 * import { callAIStream, Model } from '@/lib/providers';
 *
 * const stream = await callAIStream({
 *   model: Model.CLAUDE_SONNET_4_5,
 *   messages: [{ role: 'user', content: '안녕!' }],
 * });
 *
 * for await (const chunk of stream) {
 *   process.stdout.write(chunk);
 * }
 * ```
 */
export async function* callAIStream({
  model,
  messages,
  systemPrompt,
  temperature = 0.7,
  maxTokens = 4096,
  signal,
}: CallAIParams): AsyncGenerator<string> {
  const provider = getProviderFromModel(model);
  const adapter = getAdapter(provider);

  const stream = await adapter.chat({
    messages,
    modelConfig: {
      provider,
      modelName: model,
      temperature,
      maxTokens,
    },
    systemPrompt,
    signal,
  });

  const reader = stream.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (!data) continue;

      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'delta' && typeof parsed.data === 'string') {
          yield parsed.data;
        } else if (parsed.type === 'error') {
          throw new Error(parsed.data?.error || 'Unknown error');
        }
      } catch (e) {
        if (e instanceof SyntaxError) continue; // Skip invalid JSON
        throw e;
      }
    }
  }
}
