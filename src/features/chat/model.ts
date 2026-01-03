import { atom } from 'jotai';
import type { VoiceProvider, VoiceSessionState, VoiceMessage, VoiceSessionUpdate } from '@/shared/types';

export const isImageModeAtom = atom<boolean>(false);

// 음성 모드 활성화
export const isVoiceModeAtom = atom<boolean>(false);

// 선택된 음성 프로바이더
export const voiceProviderAtom = atom<VoiceProvider>('grok');

// 음성 세션 상태
export const voiceSessionStateAtom = atom<VoiceSessionState>({
  isActive: false,
  isConnecting: false,
  isMuted: false,
  isSpeaking: false,
  isAISpeaking: false,
});

// 음성 트랜스크립트
export const voiceTranscriptsAtom = atom<VoiceMessage[]>([]);

// LiveKit 룸 이름
export const liveKitRoomAtom = atom<string | null>(null);

// 음성 세션 상태 업데이트 atom
export const setVoiceSessionAtom = atom(
  null,
  (get, set, update: VoiceSessionUpdate) => {
    const current = get(voiceSessionStateAtom);
    set(voiceSessionStateAtom, { ...current, ...update });
  },
);

// 트랜스크립트 추가 atom
export const addVoiceTranscriptAtom = atom(
  null,
  (get, set, message: VoiceMessage) => {
    const transcripts = get(voiceTranscriptsAtom);
    set(voiceTranscriptsAtom, [...transcripts, message]);
  },
);

// 트랜스크립트 초기화 atom
export const clearVoiceTranscriptsAtom = atom(null, (_, set) => {
  set(voiceTranscriptsAtom, []);
});
