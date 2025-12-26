import { atom } from 'jotai';
import type { Thread } from '@/shared/types';

export const threadsAtom = atom<Thread[]>([]);
export const selectedThreadIdAtom = atom<string | null>(null);

export const selectedThreadAtom = atom((get) => {
  const threadId = get(selectedThreadIdAtom);
  const threads = get(threadsAtom);
  return threads.find((t) => t.id === threadId) ?? null;
});
