import type { Provider } from '@/types';
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

export const AVAILABLE_MODELS: Record<Provider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  xai: ['grok-3', 'grok-3-fast', 'grok-2', 'grok-2-vision'],
  gemini: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  solar: ['solar-pro', 'solar-mini'],
};

export { type ProviderAdapter, type ChatParams } from './types';
export { Model, MODELS_BY_PROVIDER, getProviderFromModel, type ModelName } from './models';
