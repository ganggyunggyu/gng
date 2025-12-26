import { atom } from 'jotai';
import type { Project } from '@/shared/types';

export const projectsAtom = atom<Project[]>([]);
export const selectedProjectIdAtom = atom<string | null>(null);

export const selectedProjectAtom = atom((get) => {
  const projectId = get(selectedProjectIdAtom);
  const projects = get(projectsAtom);
  return projects.find((p) => p.id === projectId) ?? null;
});
