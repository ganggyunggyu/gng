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

interface ParsedSSEEvent {
  type: 'delta' | 'done' | 'error' | 'usage';
  data?: string;
  error?: string;
}

async function* parseSSEStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<ParsedSSEEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data:')) continue;

        const data = line.slice(5).trim();
        if (!data) continue;

        try {
          yield JSON.parse(data) as ParsedSSEEvent;
        } catch {
          // JSON 파싱 실패 시 무시
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function createChatStream(params: CallAIParams) {
  const {
    model,
    messages,
    systemPrompt,
    temperature = 0.7,
    maxTokens = 4096,
    signal,
  } = params;

  const provider = getProviderFromModel(model);
  const adapter = getAdapter(provider);

  return {
    provider,
    model,
    stream: adapter.chat({
      messages,
      modelConfig: { provider, modelName: model, temperature, maxTokens },
      systemPrompt,
      signal,
    }),
  };
}

/**
 * 통합 AI 호출 함수 (비스트리밍)
 */
export async function callAI(params: CallAIParams): Promise<CallAIResult> {
  const { provider, model, stream } = createChatStream(params);
  let content = '';

  for await (const event of parseSSEStream(await stream)) {
    if (event.type === 'delta' && event.data) {
      content += event.data;
    } else if (event.type === 'error') {
      throw new Error(event.error ?? 'Unknown error');
    }
  }

  return { content, provider, model };
}

/**
 * 통합 AI 호출 함수 (스트리밍)
 */
export async function* callAIStream(
  params: CallAIParams,
): AsyncGenerator<string> {
  const { stream } = createChatStream(params);

  for await (const event of parseSSEStream(await stream)) {
    if (event.type === 'delta' && event.data) {
      yield event.data;
    } else if (event.type === 'error') {
      throw new Error(event.error ?? 'Unknown error');
    }
  }
}
