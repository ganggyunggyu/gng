import { atom } from 'jotai';

export const sidebarOpenAtom = atom<boolean>(true);
export const projectDialogOpenAtom = atom<boolean>(false);
export const settingsDialogOpenAtom = atom<boolean>(false);
export const searchFocusAtom = atom<boolean>(false);
