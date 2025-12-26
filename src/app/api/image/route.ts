import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface DallEResponse {
  data: Array<{
    url: string;
    revised_prompt?: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, size = '1024x1024' } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const { data } = await axios.post<DallEResponse>(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3',
        prompt,
        n: 1,
        size,
        quality: 'standard',
      },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      },
    );

    const imageUrl = data.data[0]?.url;
    const revisedPrompt = data.data[0]?.revised_prompt;

    return NextResponse.json({ imageUrl, revisedPrompt });
  } catch (error) {
    console.error('Image generation error:', error);
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data?.error?.message || 'Failed to generate image' },
        { status: error.response?.status || 500 },
      );
    }
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 },
    );
  }
}
