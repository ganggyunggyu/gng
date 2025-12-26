import type { InternalMessage, Provider } from '@/types';
import { getAdapter } from './index';
import { getProviderFromModel, getModelCapabilities, type ModelName } from './models';

/**
 * SSE 스트림 파싱 공통 함수
 */
async function* parseSSEStream(stream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\n')) {
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
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }
}

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
  const capabilities = getModelCapabilities(model);

  const stream = await adapter.chat({
    messages,
    modelConfig: {
      provider,
      modelName: model,
      temperature: capabilities.supportsTemperature ? temperature : undefined,
      maxTokens: capabilities.supportsMaxTokens ? maxTokens : undefined,
    },
    systemPrompt: capabilities.supportsSystemPrompt ? systemPrompt : undefined,
    signal,
  });

  let content = '';
  for await (const chunk of parseSSEStream(stream)) {
    content += chunk;
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
  const capabilities = getModelCapabilities(model);

  const stream = await adapter.chat({
    messages,
    modelConfig: {
      provider,
      modelName: model,
      temperature: capabilities.supportsTemperature ? temperature : undefined,
      maxTokens: capabilities.supportsMaxTokens ? maxTokens : undefined,
    },
    systemPrompt: capabilities.supportsSystemPrompt ? systemPrompt : undefined,
    signal,
  });

  yield* parseSSEStream(stream);
}
