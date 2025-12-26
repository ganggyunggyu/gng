// AI 모델 상수 정의
export const Model = {
  // OpenAI GPT-4 시리즈
  GPT4O: 'gpt-4o',
  GPT4O_MINI: 'gpt-4o-mini',
  GPT4_TURBO: 'gpt-4-turbo',
  // OpenAI Reasoning 모델
  O1: 'o1',
  O1_MINI: 'o1-mini',
  O1_PREVIEW: 'o1-preview',
  O3_MINI: 'o3-mini',
  O4_MINI: 'o4-mini',

  // Google Gemini
  GEMINI_2_FLASH: 'gemini-2.0-flash',
  GEMINI_2_FLASH_LITE: 'gemini-2.0-flash-lite',
  GEMINI_1_5_PRO: 'gemini-1.5-pro',
  GEMINI_1_5_FLASH: 'gemini-1.5-flash',

  // Anthropic Claude
  CLAUDE_SONNET_4_5: 'claude-sonnet-4-5-20250929',
  CLAUDE_OPUS_4_5: 'claude-opus-4-5-20251101',
  CLAUDE_SONNET_3_5: 'claude-3-5-sonnet-20241022',
  CLAUDE_HAIKU_3_5: 'claude-3-5-haiku-20241022',
  CLAUDE_OPUS_3: 'claude-3-opus-20240229',

  // Upstage Solar
  SOLAR_PRO: 'solar-pro',
  SOLAR_PRO2: 'solar-pro2',

  // xAI Grok
  GROK_4: 'grok-4',
  GROK_4_FAST: 'grok-4-fast',
  GROK_4_RES: 'grok-4-fast-reasoning',
  GROK_4_NON_RES: 'grok-4-fast-non-reasoning',
  GROK_4_1_RES: 'grok-4-1-fast-reasoning',
  GROK_4_1_NON_RES: 'grok-4-1-fast-non-reasoning',
  GROK_CODE: 'grok-code-fast-1-0825',
  GROK_IMAGE: 'grok-2-image',

  // DeepSeek
  DEEPSEEK_CHAT: 'deepseek-chat',
  DEEPSEEK_RES: 'deepseek-reasoner',
} as const;

export type ModelName = (typeof Model)[keyof typeof Model];

// 모델별 기능 설정
export interface ModelCapabilities {
  supportsTemperature: boolean;
  supportsMaxTokens: boolean;
  supportsSystemPrompt: boolean;
  isReasoning: boolean;
}

const DEFAULT_CAPABILITIES: ModelCapabilities = {
  supportsTemperature: true,
  supportsMaxTokens: true,
  supportsSystemPrompt: true,
  isReasoning: false,
};

const REASONING_CAPABILITIES: ModelCapabilities = {
  supportsTemperature: false,
  supportsMaxTokens: true,
  supportsSystemPrompt: false,
  isReasoning: true,
};

const MODEL_CAPABILITIES: Partial<Record<string, Partial<ModelCapabilities>>> = {
  [Model.O1]: REASONING_CAPABILITIES,
  [Model.O1_MINI]: REASONING_CAPABILITIES,
  [Model.O1_PREVIEW]: REASONING_CAPABILITIES,
  [Model.O3_MINI]: REASONING_CAPABILITIES,
  [Model.O4_MINI]: REASONING_CAPABILITIES,
  [Model.DEEPSEEK_RES]: REASONING_CAPABILITIES,
  [Model.GROK_4_RES]: REASONING_CAPABILITIES,
  [Model.GROK_4_1_RES]: REASONING_CAPABILITIES,
};

export function getModelCapabilities(model: string): ModelCapabilities {
  const override = MODEL_CAPABILITIES[model];
  return override ? { ...DEFAULT_CAPABILITIES, ...override } : DEFAULT_CAPABILITIES;
}

// 모델에서 Provider 자동 추출
export function getProviderFromModel(model: string): Provider {
  if (model.startsWith('gpt-') || model.startsWith('chatgpt-') || model.startsWith('o1') || model.startsWith('o3') || model.startsWith('o4')) return 'openai';
  if (model.startsWith('claude-')) return 'anthropic';
  if (model.startsWith('gemini-') || model.startsWith('imagen-'))
    return 'gemini';
  if (model.startsWith('grok-')) return 'xai';
  if (model.startsWith('deepseek-')) return 'deepseek';
  if (model.startsWith('solar-')) return 'solar';
  throw new Error(`Unknown model provider for: ${model}`);
}

// Provider 타입
export type Provider =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'xai'
  | 'deepseek'
  | 'solar';

// Provider별 모델 목록
export const MODELS_BY_PROVIDER: Record<Provider, string[]> = {
  openai: [Model.GPT4O, Model.GPT4O_MINI, Model.GPT4_TURBO],
  anthropic: [
    Model.CLAUDE_SONNET_4_5,
    Model.CLAUDE_OPUS_4_5,
    Model.CLAUDE_SONNET_3_5,
    Model.CLAUDE_HAIKU_3_5,
    Model.CLAUDE_OPUS_3,
  ],
  gemini: [
    Model.GEMINI_2_FLASH,
    Model.GEMINI_2_FLASH_LITE,
    Model.GEMINI_1_5_PRO,
    Model.GEMINI_1_5_FLASH,
  ],
  xai: [
    Model.GROK_4,
    Model.GROK_4_FAST,
    Model.GROK_4_RES,
    Model.GROK_4_NON_RES,
    Model.GROK_4_1_RES,
    Model.GROK_4_1_NON_RES,
    Model.GROK_CODE,
    Model.GROK_IMAGE,
  ],
  deepseek: [Model.DEEPSEEK_CHAT, Model.DEEPSEEK_RES],
  solar: [Model.SOLAR_PRO, Model.SOLAR_PRO2],
};

// Provider별 API 설정
export const PROVIDER_CONFIG: Record<
  Provider,
  { baseURL: string; apiKeyEnv: string; isOpenAICompatible: boolean }
> = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    apiKeyEnv: 'OPENAI_API_KEY',
    isOpenAICompatible: true,
  },
  anthropic: {
    baseURL: 'https://api.anthropic.com/v1',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    isOpenAICompatible: false,
  },
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    apiKeyEnv: 'GEMINI_API_KEY',
    isOpenAICompatible: false,
  },
  xai: {
    baseURL: 'https://api.x.ai/v1',
    apiKeyEnv: 'XAI_API_KEY',
    isOpenAICompatible: true,
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    isOpenAICompatible: true,
  },
  solar: {
    baseURL: 'https://api.upstage.ai/v1/solar',
    apiKeyEnv: 'SOLAR_API_KEY',
    isOpenAICompatible: true,
  },
};
