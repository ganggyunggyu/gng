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
    <header className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        {!sidebarOpen && (
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}
        <nav className="flex items-center gap-1 text-sm">
          <span className="font-semibold">Gng</span>
          {selectedProject && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span>{selectedProject.name}</span>
            </>
          )}
          {selectedThread && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{selectedThread.title}</span>
            </>
          )}
        </nav>
      </div>
      <ModelSelector />
    </header>
  );
}
