import { atom } from 'jotai';
import type { PromptVersion } from '@/shared/types';

export const currentPromptVersionAtom = atom<PromptVersion | null>(null);
