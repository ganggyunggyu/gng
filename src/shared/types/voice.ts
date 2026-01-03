// 음성 프로바이더 타입
export type VoiceProvider = 'grok' | 'gemini';

// 음성 모델 설정
export interface VoiceModelConfig {
  provider: VoiceProvider;
  model: string;
  apiBase: string;
  apiKeyEnv: string;
  costPerMinute: number;
}

// 음성 세션 상태
export interface VoiceSessionState {
  isActive: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  isAISpeaking: boolean;
  error?: string;
}

// 음성 메시지 (실시간 트랜스크립트)
export interface VoiceMessage {
  id: string;
  role: 'user' | 'assistant';
  transcript: string;
  timestamp: Date;
  isFinal: boolean;
}

// LiveKit 토큰 응답
export interface LiveKitTokenResponse {
  token: string;
  roomName: string;
  participantName: string;
  wsUrl: string;
}

// 음성 세션 업데이트
export interface VoiceSessionUpdate {
  isActive?: boolean;
  isConnecting?: boolean;
  isMuted?: boolean;
  isSpeaking?: boolean;
  isAISpeaking?: boolean;
  error?: string;
}

// 음성 모델 상수
export const VoiceModel = {
  GROK_VOICE: 'grok-voice-agent',
  GEMINI_LIVE: 'gemini-2.0-flash-live',
} as const;

// 음성 모델 설정
export const VOICE_MODEL_CONFIG: Record<string, VoiceModelConfig> = {
  [VoiceModel.GROK_VOICE]: {
    provider: 'grok',
    model: 'grok-voice-agent',
    apiBase: 'wss://api.x.ai/v1/realtime',
    apiKeyEnv: 'XAI_API_KEY',
    costPerMinute: 0.05,
  },
  [VoiceModel.GEMINI_LIVE]: {
    provider: 'gemini',
    model: 'gemini-2.0-flash-live',
    apiBase: 'wss://generativelanguage.googleapis.com/v1beta',
    apiKeyEnv: 'GEMINI_API_KEY',
    costPerMinute: 0.02,
  },
};

// ID 생성
export const createVoiceId = {
  message: () => `vmsg_${crypto.randomUUID()}`,
  session: () => `vsess_${crypto.randomUUID()}`,
};
