import { atom } from 'jotai';
import type { Project, Thread, Message } from '@/types';

// 현재 선택된 프로젝트
export const selectedProjectIdAtom = atom<string | null>(null);

// 현재 선택된 스레드
export const selectedThreadIdAtom = atom<string | null>(null);

// 프로젝트 목록
export const projectsAtom = atom<Project[]>([]);

// 현재 프로젝트의 스레드 목록
export const threadsAtom = atom<Thread[]>([]);

// 현재 스레드의 메시지 목록
export const messagesAtom = atom<Message[]>([]);

// 스트리밍 상태
export const isStreamingAtom = atom<boolean>(false);

// 스트리밍 중인 컨텐츠
export const streamingContentAtom = atom<string>('');

// 사이드바 열림 상태
export const sidebarOpenAtom = atom<boolean>(true);

// 이미지 생성 모드
export const isImageModeAtom = atom<boolean>(false);

// 현재 선택된 프로젝트 (derived)
export const selectedProjectAtom = atom((get) => {
  const projectId = get(selectedProjectIdAtom);
  const projects = get(projectsAtom);
  return projects.find((p) => p.id === projectId) ?? null;
});

// 현재 선택된 스레드 (derived)
export const selectedThreadAtom = atom((get) => {
  const threadId = get(selectedThreadIdAtom);
  const threads = get(threadsAtom);
  return threads.find((t) => t.id === threadId) ?? null;
});
