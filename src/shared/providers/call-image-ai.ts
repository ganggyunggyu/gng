import axios from 'axios';
import {
  ImageModel,
  IMAGE_MODEL_CONFIG,
  IMAGE_MODEL_COST_USD,
  CURRENT_IMAGE_MODEL,
  type ImageProvider,
} from '@/shared/providers/models';

export interface CallImageAIParams {
  prompt: string;
  size?: string;
  systemPrompt?: string;
  model?: string;
}

export interface CallImageAIResult {
  imageUrl: string;
  revisedPrompt?: string;
  model: string;
  costUsd: number;
}

interface DallEResponse {
  data: Array<{
    url: string;
    revised_prompt?: string;
  }>;
}

interface ImagenResponse {
  predictions: Array<{
    bytesBase64Encoded: string;
  }>;
}

interface GeminiFlashImageResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        inlineData?: { data?: string; mimeType?: string };
        inline_data?: { data?: string; mimeType?: string };
      }>;
    };
  }>;
}

interface GrokImageResponse {
  data: Array<{
    url: string;
  }>;
}

const buildPrompt = (userPrompt: string, systemPrompt?: string): string => {
  if (!systemPrompt) return userPrompt;
  return `${systemPrompt}\n\n${userPrompt}`;
};

const generateWithOpenAI = async (
  prompt: string,
  model: string,
  size: string,
  apiKey: string,
): Promise<{ imageUrl: string; revisedPrompt?: string }> => {
  const isDalle3 = model === ImageModel.DALLE_3;

  const { data } = await axios.post<DallEResponse>(
    'https://api.openai.com/v1/images/generations',
    {
      model,
      prompt,
      n: 1,
      size: isDalle3 ? size : '512x512',
      ...(isDalle3 && { quality: 'standard' }),
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    },
  );

  return {
    imageUrl: data.data[0]?.url ?? '',
    revisedPrompt: data.data[0]?.revised_prompt,
  };
};

const generateWithGemini = async (
  prompt: string,
  endpoint: string,
  apiKey: string,
): Promise<{ imageUrl: string; revisedPrompt?: string }> => {
  const { data } = await axios.post<ImagenResponse>(
    endpoint,
    {
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '1:1',
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
    },
  );

  const base64 = data.predictions?.[0]?.bytesBase64Encoded;
  if (!base64) throw new Error('No image generated');

  const imageUrl = `data:image/png;base64,${base64}`;
  return { imageUrl };
};

const generateWithGeminiFlash = async (
  prompt: string,
  endpoint: string,
  apiKey: string,
): Promise<{ imageUrl: string; revisedPrompt?: string }> => {
  const { data } = await axios.post<GeminiFlashImageResponse>(
    `${endpoint}?key=${apiKey}`,
    {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    },
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inlineData = part.inlineData ?? part.inline_data;
    const imageData = inlineData?.data;
    if (imageData) {
      const mimeType = inlineData?.mimeType ?? 'image/png';
      return { imageUrl: `data:${mimeType};base64,${imageData}` };
    }
  }

  throw new Error('No image generated');
};

const generateWithXAI = async (
  prompt: string,
  model: string,
  apiKey: string,
): Promise<{ imageUrl: string; revisedPrompt?: string }> => {
  const { data } = await axios.post<GrokImageResponse>(
    'https://api.x.ai/v1/images/generations',
    {
      model,
      prompt,
      n: 1,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    },
  );

  return { imageUrl: data.data[0]?.url ?? '' };
};

const generateByProvider: Record<
  ImageProvider,
  (
    prompt: string,
    model: string,
    size: string,
    endpoint: string,
    apiKey: string,
  ) => Promise<{ imageUrl: string; revisedPrompt?: string }>
> = {
  openai: (prompt, model, size, _endpoint, apiKey) =>
    generateWithOpenAI(prompt, model, size, apiKey),
  gemini: (prompt, _model, _size, endpoint, apiKey) =>
    generateWithGemini(prompt, endpoint, apiKey),
  'gemini-flash': (prompt, _model, _size, endpoint, apiKey) =>
    generateWithGeminiFlash(prompt, endpoint, apiKey),
  xai: (prompt, model, _size, _endpoint, apiKey) => generateWithXAI(prompt, model, apiKey),
};

export const callImageAI = async (params: CallImageAIParams): Promise<CallImageAIResult> => {
  const { prompt, size = '1024x1024', systemPrompt, model: requestedModel } = params;
  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) {
    throw new Error('Prompt is required');
  }

  const model = requestedModel || CURRENT_IMAGE_MODEL;
  const config = IMAGE_MODEL_CONFIG[model];

  if (!config) {
    throw new Error(`Unknown image model: ${model}`);
  }

  const { apiKeyEnv, endpoint, provider } = config;
  const apiKey = process.env[apiKeyEnv];
  if (!apiKey) {
    throw new Error(`${apiKeyEnv} is not configured`);
  }

  const fullPrompt = buildPrompt(trimmedPrompt, systemPrompt);
  const generator = generateByProvider[provider];

  if (!generator) {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  const result = await generator(fullPrompt, model, size, endpoint, apiKey);
  const costUsd = IMAGE_MODEL_COST_USD[model] ?? 0;

  return {
    imageUrl: result.imageUrl,
    revisedPrompt: result.revisedPrompt,
    model,
    costUsd,
  };
};
