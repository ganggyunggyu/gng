import { atom } from 'jotai';
import type { Thread } from '@/shared/types';

export const threadsAtom = atom<Thread[]>([]);
export const selectedThreadIdAtom = atom<string | null>(null);

export const selectedThreadAtom = atom((get) => {
  const threadId = get(selectedThreadIdAtom);
  const threads = get(threadsAtom);
  return threads.find((t) => t.id === threadId) ?? null;
});

export interface ThreadReadAtUpdate {
  threadId: string;
  readAt: number;
}

export const threadReadAtAtom = atom<Record<string, number>>({});

export const setThreadReadAtAtom = atom(
  null,
  (get, set, update: ThreadReadAtUpdate) => {
    const { threadId, readAt } = update;
    if (!threadId) return;

    const prev = get(threadReadAtAtom);
    const currentReadAt = prev[threadId];
    if (currentReadAt !== undefined && readAt <= currentReadAt) return;

    set(threadReadAtAtom, { ...prev, [threadId]: readAt });
  },
);
