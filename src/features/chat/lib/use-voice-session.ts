'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Room, RoomEvent, Track, RemoteTrack, RemoteTrackPublication } from 'livekit-client';
import { toast } from 'sonner';
import {
  isVoiceModeAtom,
  voiceProviderAtom,
  voiceSessionStateAtom,
  setVoiceSessionAtom,
  voiceTranscriptsAtom,
  addVoiceTranscriptAtom,
  clearVoiceTranscriptsAtom,
  liveKitRoomAtom,
} from '../model';
import { selectedThreadAtom } from '@/entities/thread';
import { usePromptVersion } from '@/entities/prompt-version';
import { useMessages } from '@/entities/message';
import type { LiveKitTokenResponse, VoiceMessage } from '@/shared/types';

export const useVoiceSession = () => {
  const [isVoiceMode, setIsVoiceMode] = useAtom(isVoiceModeAtom);
  const voiceProvider = useAtomValue(voiceProviderAtom);
  const sessionState = useAtomValue(voiceSessionStateAtom);
  const setSessionState = useSetAtom(setVoiceSessionAtom);
  const transcripts = useAtomValue(voiceTranscriptsAtom);
  const addTranscript = useSetAtom(addVoiceTranscriptAtom);
  const clearTranscripts = useSetAtom(clearVoiceTranscriptsAtom);
  const [roomName, setRoomName] = useAtom(liveKitRoomAtom);

  const selectedThread = useAtomValue(selectedThreadAtom);
  const { getSystemPrompt } = usePromptVersion();
  const { addMessage } = useMessages();

  const roomRef = useRef<Room | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const connectToRoom = useCallback(async () => {
    if (!selectedThread) {
      toast.error('Please select a thread first');
      return;
    }

    setSessionState({ isConnecting: true, error: undefined });

    try {
      const response = await fetch('/api/voice/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceProvider,
          threadId: selectedThread.id,
          systemPrompt: getSystemPrompt(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get voice token');
      }

      const { token, roomName: newRoomName, wsUrl } = (await response.json()) as LiveKitTokenResponse;

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      room.on(RoomEvent.Connected, () => {
        setSessionState({ isActive: true, isConnecting: false });
        toast.success('Voice session connected');
      });

      room.on(RoomEvent.Disconnected, () => {
        setSessionState({ isActive: false, isConnecting: false });
        toast.info('Voice session disconnected');
      });

      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: RemoteTrackPublication) => {
        if (track.kind === Track.Kind.Audio) {
          if (!audioElementRef.current) {
            audioElementRef.current = document.createElement('audio');
            audioElementRef.current.autoplay = true;
            document.body.appendChild(audioElementRef.current);
          }
          track.attach(audioElementRef.current);
          setSessionState({ isAISpeaking: true });
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio) {
          track.detach();
          setSessionState({ isAISpeaking: false });
        }
      });

      room.on(RoomEvent.DataReceived, (data: Uint8Array) => {
        try {
          const message = JSON.parse(new TextDecoder().decode(data));
          if (message.type === 'transcript') {
            const voiceMsg: VoiceMessage = {
              id: `vmsg_${Date.now()}`,
              role: message.role,
              transcript: message.text,
              timestamp: new Date(),
              isFinal: message.isFinal,
            };
            addTranscript(voiceMsg);
          }
        } catch {
          // Ignore parse errors
        }
      });

      await room.connect(wsUrl, token);

      // Enable microphone
      await room.localParticipant.setMicrophoneEnabled(true);

      roomRef.current = room;
      setRoomName(newRoomName);
    } catch (error) {
      console.error('Voice connection error:', error);
      setSessionState({
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      });
      toast.error('Failed to connect voice session');
    }
  }, [selectedThread, voiceProvider, getSystemPrompt, setSessionState, setRoomName, addTranscript]);

  const disconnectFromRoom = useCallback(async () => {
    if (roomRef.current) {
      // Save transcripts as messages before disconnecting
      if (transcripts.length > 0) {
        const userMessages = transcripts
          .filter((t) => t.role === 'user' && t.isFinal)
          .map((t) => t.transcript)
          .join('\n');
        const assistantMessages = transcripts
          .filter((t) => t.role === 'assistant' && t.isFinal)
          .map((t) => t.transcript)
          .join('\n');

        if (selectedThread && userMessages) {
          await addMessage({
            threadId: selectedThread.id,
            role: 'user',
            content: `🎤 ${userMessages}`,
          });
        }

        if (selectedThread && assistantMessages) {
          await addMessage({
            threadId: selectedThread.id,
            role: 'assistant',
            content: assistantMessages,
            meta: { provider: voiceProvider === 'grok' ? 'xai' : 'gemini' },
          });
        }
      }

      await roomRef.current.disconnect();
      roomRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.remove();
      audioElementRef.current = null;
    }

    clearTranscripts();
    setRoomName(null);
    setSessionState({
      isActive: false,
      isConnecting: false,
      isMuted: false,
      isSpeaking: false,
      isAISpeaking: false,
    });
  }, [transcripts, selectedThread, voiceProvider, addMessage, clearTranscripts, setRoomName, setSessionState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  const openVoiceMode = useCallback(() => {
    setIsVoiceMode(true);
  }, [setIsVoiceMode]);

  const closeVoiceMode = useCallback(async () => {
    await disconnectFromRoom();
    setIsVoiceMode(false);
  }, [disconnectFromRoom, setIsVoiceMode]);

  return {
    isVoiceMode,
    sessionState,
    transcripts,
    roomName,
    openVoiceMode,
    closeVoiceMode,
    connectToRoom,
    disconnectFromRoom,
    room: roomRef.current,
  };
};
