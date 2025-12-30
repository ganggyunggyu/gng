import type { InternalMessage, Provider, TokenUsage } from '@/shared/types';
import { getAdapter } from '@/shared/providers/get-adapter';
import {
  getProviderFromModel,
  PROVIDER_CONFIG,
  type ModelName,
} from '@/shared/providers/models';

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
  usage?: TokenUsage;
  cost?: TokenCost;
}

export interface TokenCost {
  usd: number;
  krw: number;
}

interface ParsedSSEEvent {
  type: 'delta' | 'done' | 'error' | 'usage';
  data: string | TokenUsage | { error: string };
}

const MODEL_PRICING_USD: Array<{
  match: string;
  input: number;
  output: number;
}> = [
  { match: 'gpt-5-mini', input: 0.25, output: 2.0 },
  { match: 'gpt-5-nano', input: 0.05, output: 0.4 },
  { match: 'gpt-5', input: 1.25, output: 10.0 },
  { match: 'gpt-4o', input: 2.5, output: 10.0 },
  { match: 'gpt-4.1', input: 2.0, output: 8.0 },
  { match: 'gemini-3.0-flash', input: 0.5, output: 3.0 },
  { match: 'gemini-3-flash', input: 0.5, output: 3.0 },
  { match: 'gemini-3-pro', input: 1.25, output: 5.0 },
  { match: 'gemini-2.5-pro', input: 1.25, output: 5.0 },
  { match: 'claude-sonnet', input: 3.0, output: 15.0 },
  { match: 'claude-opus', input: 15.0, output: 75.0 },
  { match: 'grok-4-1-fast', input: 0.2, output: 0.5 },
  { match: 'grok-4-fast', input: 0.2, output: 0.5 },
  { match: 'grok-4', input: 3.0, output: 15.0 },
  { match: 'deepseek', input: 0.28, output: 0.42 },
  { match: 'solar', input: 0.15, output: 0.6 },
];

const DEFAULT_PRICING_USD = { input: 0.01, output: 0.03 };
const USD_TO_KRW = 1400;

const getModelPricing = (
  modelName: string
): { input: number; output: number } => {
  const normalizedModelName = modelName.toLowerCase();
  const matched = MODEL_PRICING_USD.find(({ match }) =>
    normalizedModelName.includes(match)
  );
  if (!matched) return DEFAULT_PRICING_USD;
  const { input, output } = matched;
  return { input, output };
};

const calculateTokenCost = (
  modelName: string,
  usage: TokenUsage
): TokenCost => {
  const { input, output } = getModelPricing(modelName);
  const inputCost = (usage.tokensIn / 1_000_000) * input;
  const outputCost = (usage.tokensOut / 1_000_000) * output;
  const totalUsd = inputCost + outputCost;

  return {
    usd: Number(totalUsd.toFixed(6)),
    krw: Number((totalUsd * USD_TO_KRW).toFixed(0)),
  };
};

const isTokenUsage = (data: unknown): data is TokenUsage => {
  if (!data || typeof data !== 'object') return false;
  const record = data as Record<string, unknown>;
  return (
    typeof record.tokensIn === 'number' && typeof record.tokensOut === 'number'
  );
};

const getErrorMessage = (data: unknown): string => {
  if (!data) return 'Unknown error';
  if (typeof data === 'string') return data;
  if (typeof data === 'object' && 'error' in data) {
    const error = (data as { error?: string }).error;
    return error || 'Unknown error';
  }
  return 'Unknown error';
};

const parseSSEStream = async function* (
  stream: ReadableStream<Uint8Array>
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
};

const createChatStream = (params: CallAIParams) => {
  const {
    model,
    messages,
    systemPrompt,
    temperature = 0.7,
    maxTokens,
    signal,
  } = params;

  const provider = getProviderFromModel(model);
  const { apiKeyEnv } = PROVIDER_CONFIG[provider];
  const apiKey = process.env[apiKeyEnv];
  if (!apiKey) {
    throw new Error(`${apiKeyEnv} is not configured`);
  }
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
};

/**
 * 통합 AI 호출 함수 (비스트리밍)
 */
export const callAI = async (params: CallAIParams): Promise<CallAIResult> => {
  const { provider, model, stream } = createChatStream(params);
  let content = '';
  let usage: TokenUsage | undefined;

  for await (const event of parseSSEStream(await stream)) {
    if (event.type === 'delta' && typeof event.data === 'string') {
      content += event.data;
    } else if (event.type === 'usage' && isTokenUsage(event.data)) {
      usage = event.data;
    } else if (event.type === 'error') {
      throw new Error(getErrorMessage(event.data));
    }
  }

  const cost = usage ? calculateTokenCost(model, usage) : undefined;

  return {
    content,
    provider,
    model,
    ...(usage && { usage }),
    ...(cost && { cost }),
  };
};

/**
 * 통합 AI 호출 함수 (스트리밍)
 */
export const callAIStream = async function* (
  params: CallAIParams
): AsyncGenerator<string> {
  const { stream } = createChatStream(params);

  for await (const event of parseSSEStream(await stream)) {
    if (event.type === 'delta' && typeof event.data === 'string') {
      yield event.data;
    } else if (event.type === 'error') {
      throw new Error(getErrorMessage(event.data));
    }
  }
};
