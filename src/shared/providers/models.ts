// ============================================================
// 이미지 생성 모델 (테스트용 - 여기서 바꿔서 사용)
// ============================================================
export const ImageModel = {
  // OpenAI DALL-E
  DALLE_3: 'dall-e-3', // $0.040/장 (1024x1024 standard)
  DALLE_2: 'dall-e-2', // $0.016/장 (256x256) ~ $0.020/장 (1024x1024) 저렴!

  // Gemini Flash Image
  GEMINI_2_5_FLASH_IMAGE: 'gemini-2.5-flash-image',
  GEMINI_3_PRO_IMAGE_PREVIEW: 'gemini-3-pro-image-preview',

  // Google Imagen ($0.03/장)
  IMAGEN_3: 'imagen-3.0-generate-002', // 고품질
  IMAGEN_3_FAST: 'imagen-3.0-fast-generate-001', // 빠름
  IMAGEN_4: 'imagen-4.0-generate-001', // 최신, 최고품질

  // xAI Grok
  GROK_IMAGE: 'grok-2-image', // ~$0.07/장
} as const;

// 🔧 현재 사용할 이미지 모델 (여기만 바꾸면 됨!)
export const CURRENT_IMAGE_MODEL = ImageModel.IMAGEN_4;

// 이미지 모델별 설정
export type ImageProvider = 'openai' | 'gemini' | 'gemini-flash' | 'xai';

export const IMAGE_MODEL_CONFIG: Record<
  string,
  { provider: ImageProvider; endpoint: string; apiKeyEnv: string }
> = {
  [ImageModel.DALLE_3]: {
    provider: 'openai',
    endpoint: 'https://api.openai.com/v1/images/generations',
    apiKeyEnv: 'OPENAI_API_KEY',
  },
  [ImageModel.DALLE_2]: {
    provider: 'openai',
    endpoint: 'https://api.openai.com/v1/images/generations',
    apiKeyEnv: 'OPENAI_API_KEY',
  },
  [ImageModel.GEMINI_2_5_FLASH_IMAGE]: {
    provider: 'gemini-flash',
    endpoint:
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
    apiKeyEnv: 'GEMINI_API_KEY',
  },
  [ImageModel.GEMINI_3_PRO_IMAGE_PREVIEW]: {
    provider: 'gemini-flash',
    endpoint:
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent',
    apiKeyEnv: 'GEMINI_API_KEY',
  },
  [ImageModel.IMAGEN_3]: {
    provider: 'gemini',
    endpoint:
      'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict',
    apiKeyEnv: 'GEMINI_API_KEY',
  },
  [ImageModel.IMAGEN_3_FAST]: {
    provider: 'gemini',
    endpoint:
      'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-fast-generate-001:predict',
    apiKeyEnv: 'GEMINI_API_KEY',
  },
  [ImageModel.IMAGEN_4]: {
    provider: 'gemini',
    endpoint:
      'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict',
    apiKeyEnv: 'GEMINI_API_KEY',
  },
  [ImageModel.GROK_IMAGE]: {
    provider: 'xai',
    endpoint: 'https://api.x.ai/v1/images/generations',
    apiKeyEnv: 'XAI_API_KEY',
  },
};

export const IMAGE_MODEL_COST_USD: Record<string, number> = {
  [ImageModel.DALLE_3]: 0.04,
  [ImageModel.DALLE_2]: 0.02,
  [ImageModel.GEMINI_2_5_FLASH_IMAGE]: 0.039,
  [ImageModel.GEMINI_3_PRO_IMAGE_PREVIEW]: 0,
  [ImageModel.IMAGEN_3]: 0.03,
  [ImageModel.IMAGEN_3_FAST]: 0.03,
  [ImageModel.IMAGEN_4]: 0.04,
  [ImageModel.GROK_IMAGE]: 0.07,
};

// ============================================================
// AI 모델 상수 정의
// ============================================================
export const Model = {
  // OpenAI GPT-5 시리즈 (Responses API)
  GPT5: 'gpt-5-2025-08-07',
  GPT5_1: 'gpt-5.1-2025-11-13',
  GPT5_2: 'gpt-5.2-2025-12-11',
  GPT5_MINI: 'gpt-5-mini-2025-08-07',
  GPT5_NANO: 'gpt-5-nano-2025-08-07',
  GPT5_CHAT: 'gpt-5-chat-latest',

  // OpenAI GPT-4.1 시리즈 (2025-04-14)
  GPT4_1: 'gpt-4.1-2025-04-14',
  GPT4_1_MINI: 'gpt-4.1-mini-2025-04-14',
  GPT4_1_NANO: 'gpt-4.1-nano-2025-04-14',

  // OpenAI GPT-4o 시리즈
  GPT4O: 'chatgpt-4o-latest',
  GPT4O_API: 'gpt-4o',
  GPT4O_MINI: 'gpt-4o-mini',

  // Google Gemini
  GEMINI_2_5_PRO: 'gemini-2.5-pro',
  GEMINI_2_5_FLASH_IMAGE: 'gemini-2.5-flash-image',
  GEMINI_3_PRO_IMAGE_PREVIEW: 'gemini-3-pro-image-preview',
  GEMINI_3_PRO: 'gemini-3-pro-preview',
  GEMINI_3_FLASH: 'gemini-3-flash-preview',
  GEMINI_2_FLASH: 'gemini-2.0-flash',
  IMAGEN_4: 'imagen-4.0-generate-001',

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

// Provider 타입
export type Provider =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'xai'
  | 'deepseek'
  | 'solar';

// 모델에서 Provider 자동 추출
export const getProviderFromModel = (model: string): Provider => {
  if (model.startsWith('gpt-') || model.startsWith('chatgpt-')) return 'openai';
  if (model.startsWith('claude-')) return 'anthropic';
  if (model.startsWith('gemini-') || model.startsWith('imagen-'))
    return 'gemini';
  if (model.startsWith('grok-')) return 'xai';
  if (model.startsWith('deepseek-')) return 'deepseek';
  if (model.startsWith('solar-')) return 'solar';
  throw new Error(`Unknown model provider for: ${model}`);
};

// Provider별 모델 목록
export const MODELS_BY_PROVIDER: Record<Provider, string[]> = {
  openai: [
    Model.GPT5,
    Model.GPT5_1,
    Model.GPT5_2,
    Model.GPT5_MINI,
    Model.GPT5_NANO,
    Model.GPT5_CHAT,
    Model.GPT4_1,
    Model.GPT4_1_MINI,
    Model.GPT4_1_NANO,
    Model.GPT4O,
    Model.GPT4O_API,
    Model.GPT4O_MINI,
  ],
  anthropic: [
    Model.CLAUDE_SONNET_4_5,
    Model.CLAUDE_OPUS_4_5,
    Model.CLAUDE_SONNET_3_5,
    Model.CLAUDE_HAIKU_3_5,
    Model.CLAUDE_OPUS_3,
  ],
  gemini: [
    Model.GEMINI_2_5_PRO,
    Model.GEMINI_2_5_FLASH_IMAGE,
    Model.GEMINI_3_PRO_IMAGE_PREVIEW,
    Model.GEMINI_3_PRO,
    Model.GEMINI_3_FLASH,
    Model.GEMINI_2_FLASH,
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

// 모델 표시명 (UI용)
export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  // OpenAI GPT-5
  [Model.GPT5]: 'GPT-5',
  [Model.GPT5_1]: 'GPT-5.1',
  [Model.GPT5_2]: 'GPT-5.2',
  [Model.GPT5_MINI]: 'GPT-5 Mini',
  [Model.GPT5_NANO]: 'GPT-5 Nano',
  [Model.GPT5_CHAT]: 'GPT-5 Chat',
  // OpenAI GPT-4.1
  [Model.GPT4_1]: 'GPT-4.1',
  [Model.GPT4_1_MINI]: 'GPT-4.1 Mini',
  [Model.GPT4_1_NANO]: 'GPT-4.1 Nano',
  // OpenAI GPT-4o
  [Model.GPT4O]: 'GPT-4o (Latest)',
  [Model.GPT4O_API]: 'GPT-4o',
  [Model.GPT4O_MINI]: 'GPT-4o Mini',
  // Claude
  [Model.CLAUDE_SONNET_4_5]: 'Claude Sonnet 4.5',
  [Model.CLAUDE_OPUS_4_5]: 'Claude Opus 4.5',
  [Model.CLAUDE_SONNET_3_5]: 'Claude Sonnet 3.5',
  [Model.CLAUDE_HAIKU_3_5]: 'Claude Haiku 3.5',
  [Model.CLAUDE_OPUS_3]: 'Claude Opus 3',
  // Gemini
  [Model.GEMINI_2_5_PRO]: 'Gemini 2.5 Pro',
  [Model.GEMINI_2_5_FLASH_IMAGE]: 'Gemini 2.5 Flash Image',
  [Model.GEMINI_3_PRO_IMAGE_PREVIEW]: 'Gemini 3 Pro Image Preview',
  [Model.GEMINI_3_PRO]: 'Gemini 3 Pro',
  [Model.GEMINI_3_FLASH]: 'Gemini 3 Flash Preview',
  [Model.GEMINI_2_FLASH]: 'Gemini 2 Flash',
  [Model.IMAGEN_4]: 'Imagen 4',
  // xAI
  [Model.GROK_4]: 'Grok 4',
  [Model.GROK_4_FAST]: 'Grok 4 Fast',
  [Model.GROK_4_RES]: 'Grok 4 Reasoning',
  [Model.GROK_4_NON_RES]: 'Grok 4 Non-Reasoning',
  [Model.GROK_4_1_RES]: 'Grok 4.1 Reasoning',
  [Model.GROK_4_1_NON_RES]: 'Grok 4.1 Non-Reasoning',
  [Model.GROK_CODE]: 'Grok Code',
  [Model.GROK_IMAGE]: 'Grok Image',
  // DeepSeek
  [Model.DEEPSEEK_CHAT]: 'DeepSeek Chat',
  [Model.DEEPSEEK_RES]: 'DeepSeek Reasoner',
  // Solar
  [Model.SOLAR_PRO]: 'Solar Pro',
  [Model.SOLAR_PRO2]: 'Solar Pro 2',
};

// 모델명으로 표시명 가져오기
export const getModelDisplayName = (modelName: string): string => {
  return MODEL_DISPLAY_NAMES[modelName] || modelName;
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
