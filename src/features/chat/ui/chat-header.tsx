'use client';

import { useAtom, useAtomValue } from 'jotai';
import { PanelLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { selectedProjectAtom } from '@/entities/project';
import { selectedThreadAtom } from '@/entities/thread';
import { sidebarOpenAtom } from '@/features/sidebar/model';
import { ModelSelector } from './model-selector';

export function ChatHeader() {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
  const selectedProject = useAtomValue(selectedProjectAtom);
  const selectedThread = useAtomValue(selectedThreadAtom);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-3 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {!sidebarOpen && (
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setSidebarOpen(true)}>
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}
        <nav className="flex min-w-0 items-center gap-1 text-sm">
          <span className="shrink-0 font-semibold font-(family-name:--font-space-grotesk)">Gng</span>
          {selectedProject && (
            <>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{selectedProject.name}</span>
            </>
          )}
          {selectedThread && (
            <>
              <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
              <span className="hidden truncate text-muted-foreground sm:block">{selectedThread.title}</span>
            </>
          )}
        </nav>
      </div>
      <div className="shrink-0">
        <ModelSelector />
      </div>
    </header>
  );
}
