import type { Provider } from '@/types';
import type { ProviderAdapter } from './types';
import { openaiAdapter } from './openai';
import { anthropicAdapter } from './anthropic';
import { xaiAdapter } from './xai';

const adapters: Record<Provider, ProviderAdapter> = {
  openai: openaiAdapter,
  anthropic: anthropicAdapter,
  xai: xaiAdapter,
};

export function getAdapter(provider: Provider): ProviderAdapter {
  const adapter = adapters[provider];
  if (!adapter) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  return adapter;
}

export const AVAILABLE_MODELS: Record<Provider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
  xai: ['grok-2', 'grok-2-mini'],
};

export { type ProviderAdapter, type ChatParams } from './types';
