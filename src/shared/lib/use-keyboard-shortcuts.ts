'use client';

import { useEffect, useCallback } from 'react';

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

interface ShortcutConfig {
  key: string;
  mod?: boolean; // 플랫폼 독립적: Mac = ⌘, Windows/Linux = Ctrl
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        // mod 옵션: Mac에서는 metaKey, Windows에서는 ctrlKey
        let modMatch = true;
        if (shortcut.mod) {
          modMatch = isMac ? e.metaKey : e.ctrlKey;
        }

        // 명시적 meta/ctrl 지정 시 (mod와 함께 사용하면 안 됨)
        const metaMatch = shortcut.mod
          ? true
          : shortcut.meta
            ? e.metaKey
            : !e.metaKey;
        const ctrlMatch = shortcut.mod
          ? (isMac ? true : true) // mod 사용 시 ctrl 체크 스킵
          : shortcut.ctrl
            ? e.ctrlKey
            : !e.ctrlKey;

        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (keyMatch && modMatch && metaMatch && ctrlMatch && shiftMatch && altMatch) {
          // mod/meta/ctrl 키 조합은 입력 필드에서도 동작
          if (isInputField && !shortcut.mod && !shortcut.meta && !shortcut.ctrl) {
            continue;
          }

          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// 단축키 표시용 헬퍼 (UI에서 사용)
export function getModKey(): string {
  return isMac ? '⌘' : 'Ctrl';
}

export function formatShortcut(shortcut: { mod?: boolean; shift?: boolean; key: string }): string {
  const parts: string[] = [];
  if (shortcut.mod) parts.push(getModKey());
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  parts.push(shortcut.key.toUpperCase());
  return parts.join(isMac ? '' : '+');
}
