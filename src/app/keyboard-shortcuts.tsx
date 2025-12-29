'use client';

import { useSetAtom, useAtomValue } from 'jotai';
import { useKeyboardShortcuts } from '@/shared/lib';
import {
  sidebarOpenAtom,
  projectDialogOpenAtom,
  settingsDialogOpenAtom,
} from '@/features/sidebar';
import { selectedProjectAtom } from '@/entities/project';
import { useThreads } from '@/entities/thread';

export function KeyboardShortcuts() {
  const setSidebarOpen = useSetAtom(sidebarOpenAtom);
  const setProjectDialogOpen = useSetAtom(projectDialogOpenAtom);
  const setSettingsDialogOpen = useSetAtom(settingsDialogOpenAtom);
  const selectedProject = useAtomValue(selectedProjectAtom);
  const { createThread } = useThreads();

  useKeyboardShortcuts([
    // ⌘⇧P / Ctrl+Shift+P - 새 프로젝트
    {
      key: 'p',
      mod: true,
      shift: true,
      action: () => setProjectDialogOpen(true),
    },
    // ⌘⇧N / Ctrl+Shift+N - 새 스레드 (프로젝트 선택 시)
    {
      key: 'n',
      mod: true,
      shift: true,
      action: () => {
        if (selectedProject) {
          createThread();
        } else {
          setProjectDialogOpen(true);
        }
      },
    },
    // ⌘⇧, / Ctrl+Shift+, - 설정 (프로젝트 선택 시)
    {
      key: ',',
      mod: true,
      shift: true,
      action: () => {
        if (selectedProject) {
          setSettingsDialogOpen(true);
        }
      },
    },
    // ⌘⇧B / Ctrl+Shift+B - 사이드바 토글
    {
      key: 'b',
      mod: true,
      shift: true,
      action: () => setSidebarOpen((prev) => !prev),
    },
  ]);

  return null;
}
