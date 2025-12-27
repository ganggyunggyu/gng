import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import {
  CURRENT_IMAGE_MODEL,
  IMAGE_MODEL_CONFIG,
  ImageModel,
} from '@/shared/providers';

// OpenAI DALL-E 응답 타입
interface DallEResponse {
  data: Array<{
    url: string;
    revised_prompt?: string;
  }>;
}

// Gemini Imagen 응답 타입
interface ImagenResponse {
  predictions: Array<{
    bytesBase64Encoded: string;
  }>;
}

// xAI Grok 응답 타입
interface GrokImageResponse {
  data: Array<{
    url: string;
  }>;
}

// 시스템 프롬프트와 사용자 프롬프트 결합
function buildPrompt(userPrompt: string, systemPrompt?: string): string {
  if (!systemPrompt) return userPrompt;
  return `${systemPrompt}\n\n${userPrompt}`;
}

async function generateWithOpenAI(
  prompt: string,
  model: string,
  size: string,
  apiKey: string,
): Promise<{ imageUrl: string; revisedPrompt?: string }> {
  const isDalle3 = model === ImageModel.DALLE_3;

  const { data } = await axios.post<DallEResponse>(
    'https://api.openai.com/v1/images/generations',
    {
      model,
      prompt,
      n: 1,
      size: isDalle3 ? size : '512x512', // DALL-E 2는 512x512
      ...(isDalle3 && { quality: 'standard' }), // quality는 DALL-E 3만 지원
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    },
  );

  return {
    imageUrl: data.data[0]?.url ?? '',
    revisedPrompt: data.data[0]?.revised_prompt,
  };
}

async function generateWithGemini(
  prompt: string,
  model: string,
  apiKey: string,
): Promise<{ imageUrl: string; revisedPrompt?: string }> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict`;

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
}

async function generateWithXAI(
  prompt: string,
  apiKey: string,
): Promise<{ imageUrl: string; revisedPrompt?: string }> {
  const { data } = await axios.post<GrokImageResponse>(
    'https://api.x.ai/v1/images/generations',
    {
      model: ImageModel.GROK_IMAGE,
      prompt,
      n: 1,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    },
  );

  return { imageUrl: data.data[0]?.url ?? '' };
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, size = '1024x1024', systemPrompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const model = CURRENT_IMAGE_MODEL;
    const config = IMAGE_MODEL_CONFIG[model];

    if (!config) {
      return NextResponse.json({ error: `Unknown image model: ${model}` }, { status: 500 });
    }

    const apiKey = process.env[config.apiKeyEnv];
    if (!apiKey) {
      return NextResponse.json(
        { error: `${config.apiKeyEnv} is not configured` },
        { status: 500 },
      );
    }

    // 시스템 프롬프트 + 사용자 프롬프트 결합
    const fullPrompt = buildPrompt(prompt, systemPrompt);

    let result: { imageUrl: string; revisedPrompt?: string };

    switch (config.provider) {
      case 'openai':
        result = await generateWithOpenAI(fullPrompt, model, size, apiKey);
        break;
      case 'gemini':
        result = await generateWithGemini(fullPrompt, model, apiKey);
        break;
      case 'xai':
        result = await generateWithXAI(fullPrompt, apiKey);
        break;
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }

    return NextResponse.json({
      imageUrl: result.imageUrl,
      revisedPrompt: result.revisedPrompt,
      model,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    if (axios.isAxiosError(error)) {
      const errorMsg =
        error.response?.data?.error?.message ||
        error.response?.data?.error ||
        'Failed to generate image';
      return NextResponse.json(
        { error: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) },
        { status: error.response?.status || 500 },
      );
    }
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 },
    );
  }
}
