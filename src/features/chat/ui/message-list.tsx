'use client';

import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { cn, getModKey } from '@/shared/lib';
import { streamingStateByThreadAtom, useMessages } from '@/entities/message';
import { selectedThreadIdAtom } from '@/entities/thread';
import { MessageItem } from '@/features/chat/ui/message-item';
import { StreamingMessage } from '@/features/chat/ui/streaming-message';
import { LoadingSkeleton } from '@/features/chat/ui/loading-skeleton';

const EmptyState = () => {
  return (
    <div className={cn('flex h-full items-center justify-center py-20')}>
      <div className={cn('flex flex-col items-center gap-8')}>
        <div className={cn('relative')}>
          <div
            className={cn('absolute inset-0 animate-pulse rounded-full bg-foreground/5 blur-2xl')}
          />
          <div
            className={cn(
              'relative flex h-20 w-20 items-center justify-center rounded-2xl bg-foreground shadow-2xl',
            )}
          >
            <span
              className={cn(
                'text-4xl font-bold text-background font-(family-name:--font-space-grotesk)',
              )}
            >
              G
            </span>
          </div>
        </div>

        <div className={cn('space-y-3 text-center')}>
          <h1 className={cn('text-4xl font-bold tracking-tight')}>Welcome to Gng</h1>
          <p className={cn('text-lg text-muted-foreground')}>What can I help you with today?</p>
        </div>

        <div className={cn('flex flex-col items-center gap-2 text-sm text-muted-foreground')}>
          <p>Create a project to get started</p>
          <p className={cn('flex items-center gap-2 text-xs text-muted-foreground/60')}>
            <kbd
              className={cn(
                'rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]',
              )}
            >
              {getModKey()}
            </kbd>
            <kbd
              className={cn(
                'rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]',
              )}
            >
              ⇧
            </kbd>
            <kbd
              className={cn(
                'rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]',
              )}
            >
              P
            </kbd>
            <span>new project</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const MessageList = () => {
  const { messages, isLoading } = useMessages();
  const selectedThreadId = useAtomValue(selectedThreadIdAtom);
  const streamingState = useAtomValue(streamingStateByThreadAtom);
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentState = selectedThreadId ? streamingState[selectedThreadId] : null;
  const isStreaming = currentState?.isStreaming ?? false;
  const streamingContent = currentState?.content ?? '';

  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, [messages, streamingContent, isStreaming]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    if (messages.length === 0) {
      return <EmptyState />;
    }

    return messages.map((message) => <MessageItem key={message.id} message={message} />);
  };

  return (
    <ScrollArea className={cn('min-h-0 flex-1')}>
      <div className={cn('mx-auto max-w-3xl pb-4')}>
        {renderContent()}
        <StreamingMessage />
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};
