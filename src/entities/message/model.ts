import { atom } from 'jotai';
import type { Message } from '@/shared/types';

export const messagesAtom = atom<Message[]>([]);

export interface StreamingState {
  isStreaming: boolean;
  content: string;
}

export interface StreamingStateUpdate {
  threadId: string;
  isStreaming?: boolean;
  content?: string;
}

export const streamingStateByThreadAtom = atom<Record<string, StreamingState>>({});

export const setStreamingStateAtom = atom(
  null,
  (get, set, update: StreamingStateUpdate) => {
    const { threadId, isStreaming, content } = update;
    if (!threadId) return;

    const prev = get(streamingStateByThreadAtom);
    const current = prev[threadId] ?? { isStreaming: false, content: '' };

    const next: StreamingState = {
      ...current,
      ...(isStreaming !== undefined ? { isStreaming } : {}),
      ...(content !== undefined ? { content } : {}),
    };

    if (!next.isStreaming && !next.content) {
      const { [threadId]: _removed, ...rest } = prev;
      set(streamingStateByThreadAtom, rest);
      return;
    }

    set(streamingStateByThreadAtom, { ...prev, [threadId]: next });
  },
);
