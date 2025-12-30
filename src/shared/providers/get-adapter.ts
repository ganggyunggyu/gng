import type { Provider } from '@/shared/types';
import type { ProviderAdapter } from '@/shared/providers/types';
import {
  anthropicAdapter,
  deepseekAdapter,
  geminiAdapter,
  openaiAdapter,
  solarAdapter,
  xaiAdapter,
} from '@/shared/providers/adapters';

const adapters: Record<Provider, ProviderAdapter> = {
  openai: openaiAdapter,
  anthropic: anthropicAdapter,
  xai: xaiAdapter,
  gemini: geminiAdapter,
  deepseek: deepseekAdapter,
  solar: solarAdapter,
};

export const getAdapter = (provider: Provider): ProviderAdapter => {
  const adapter = adapters[provider];
  if (!adapter) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  return adapter;
};
