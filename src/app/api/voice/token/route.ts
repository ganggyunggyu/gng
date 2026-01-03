import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import type { VoiceProvider } from '@/shared/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface TokenRequest {
  voiceProvider: VoiceProvider;
  threadId: string;
  systemPrompt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { voiceProvider, threadId, systemPrompt } = (await request.json()) as TokenRequest;

    if (!threadId) {
      return NextResponse.json({ error: 'threadId is required' }, { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json(
        { error: 'LiveKit credentials not configured' },
        { status: 500 },
      );
    }

    const roomName = `voice-${threadId}`;
    const participantName = `user-${crypto.randomUUID().slice(0, 8)}`;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: 'User',
      metadata: JSON.stringify({
        voiceProvider,
        systemPrompt: systemPrompt || '',
      }),
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      token,
      roomName,
      participantName,
      wsUrl,
    });
  } catch (error) {
    console.error('Voice token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate voice token' },
      { status: 500 },
    );
  }
}
