import type { Provider } from '@/shared/types';
import type { ProviderAdapter } from './types';
import { openaiAdapter } from './openai';
import { anthropicAdapter } from './anthropic';
import { xaiAdapter } from './xai';
import { geminiAdapter } from './gemini';
import { deepseekAdapter } from './deepseek';
import { solarAdapter } from './solar';

const adapters: Record<Provider, ProviderAdapter> = {
  openai: openaiAdapter,
  anthropic: anthropicAdapter,
  xai: xaiAdapter,
  gemini: geminiAdapter,
  deepseek: deepseekAdapter,
  solar: solarAdapter,
};

export function getAdapter(provider: Provider): ProviderAdapter {
  const adapter = adapters[provider];
  if (!adapter) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  return adapter;
}

export { type ProviderAdapter, type ChatParams } from './types';
export {
  Model,
  MODELS_BY_PROVIDER,
  MODEL_DISPLAY_NAMES,
  getProviderFromModel,
  getModelDisplayName,
  type ModelName,
} from './models';
export { callAI, callAIStream, type CallAIParams, type CallAIResult } from './call-ai';
