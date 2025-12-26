import { atom } from 'jotai';
import type { Message } from '@/shared/types';

export const messagesAtom = atom<Message[]>([]);
export const isStreamingAtom = atom<boolean>(false);
export const streamingContentAtom = atom<string>('');
