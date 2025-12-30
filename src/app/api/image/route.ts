import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { callImageAI } from '@/shared/providers';

export const POST = async (req: NextRequest) => {
  try {
    const { prompt, size = '1024x1024', systemPrompt, model } = await req.json();
    const trimmedPrompt = typeof prompt === 'string' ? prompt.trim() : '';

    if (!trimmedPrompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await callImageAI({
      prompt: trimmedPrompt,
      size,
      systemPrompt,
      model,
    });

    return NextResponse.json({
      imageUrl: result.imageUrl,
      revisedPrompt: result.revisedPrompt,
      model: result.model,
      costUsd: result.costUsd,
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
};
