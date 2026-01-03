'use client';

import { useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import type { Room } from 'livekit-client';
import {
  voiceProviderAtom,
  voiceSessionStateAtom,
  setVoiceSessionAtom,
} from '../model';
import type { VoiceProvider } from '@/shared/types';

interface UseVoiceControlsParams {
  room: Room | null;
}

export const useVoiceControls = ({ room }: UseVoiceControlsParams) => {
  const [voiceProvider, setVoiceProvider] = useAtom(voiceProviderAtom);
  const sessionState = useAtomValue(voiceSessionStateAtom);
  const setSessionState = useSetAtom(setVoiceSessionAtom);

  const toggleMute = useCallback(async () => {
    if (!room) return;

    const newMutedState = !sessionState.isMuted;
    await room.localParticipant.setMicrophoneEnabled(!newMutedState);
    setSessionState({ isMuted: newMutedState });
  }, [room, sessionState.isMuted, setSessionState]);

  const interruptAI = useCallback(async () => {
    if (!room || !sessionState.isAISpeaking) return;

    // Send interrupt signal via data channel
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify({ type: 'interrupt' }));
    await room.localParticipant.publishData(data, { reliable: true });
    setSessionState({ isAISpeaking: false });
  }, [room, sessionState.isAISpeaking, setSessionState]);

  const switchProvider = useCallback(
    (provider: VoiceProvider) => {
      if (sessionState.isActive) {
        // Cannot switch while session is active
        return false;
      }
      setVoiceProvider(provider);
      return true;
    },
    [sessionState.isActive, setVoiceProvider],
  );

  return {
    voiceProvider,
    isMuted: sessionState.isMuted,
    isAISpeaking: sessionState.isAISpeaking,
    toggleMute,
    interruptAI,
    switchProvider,
  };
};
