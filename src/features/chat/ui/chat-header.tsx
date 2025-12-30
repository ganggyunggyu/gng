'use client';

import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { PanelLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib';
import { selectedProjectAtom } from '@/entities/project';
import { selectedThreadAtom } from '@/entities/thread';
import { sidebarOpenAtom } from '@/features/sidebar/model';
import { ModelSelector } from '@/features/chat/ui/model-selector';

export const ChatHeader = () => {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
  const selectedProject = useAtomValue(selectedProjectAtom);
  const selectedThread = useAtomValue(selectedThreadAtom);

  return (
    <header className={cn('flex h-14 shrink-0 items-center justify-between border-b px-3 sm:px-4')}>
      <div className={cn('flex min-w-0 flex-1 items-center gap-2')}>
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className={cn('shrink-0')}
            onClick={() => setSidebarOpen(true)}
          >
            <PanelLeft className={cn('h-4 w-4')} />
          </Button>
        )}
        <nav className={cn('flex min-w-0 items-center gap-1 text-sm')}>
          <span className={cn('shrink-0 font-semibold font-(family-name:--font-space-grotesk)')}>
            Gng
          </span>
          {selectedProject && (
            <React.Fragment>
              <ChevronRight className={cn('h-4 w-4 shrink-0 text-muted-foreground')} />
              <span className={cn('truncate')}>{selectedProject.name}</span>
            </React.Fragment>
          )}
          {selectedThread && (
            <React.Fragment>
              <ChevronRight
                className={cn('hidden h-4 w-4 shrink-0 text-muted-foreground sm:block')}
              />
              <span className={cn('hidden truncate text-muted-foreground sm:block')}>
                {selectedThread.title}
              </span>
            </React.Fragment>
          )}
        </nav>
      </div>
      <div className={cn('shrink-0')}>
        <ModelSelector />
      </div>
    </header>
  );
};
