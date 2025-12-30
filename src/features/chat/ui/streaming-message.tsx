'use client';

import React from 'react';
import { useAtomValue } from 'jotai';
import { Bot, Loader2 } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib';
import { streamingStateByThreadAtom } from '@/entities/message';
import { selectedThreadIdAtom } from '@/entities/thread';
import { MarkdownContent } from '@/features/chat/ui/markdown-content';

const ThinkingIndicator = () => {
  return <span className={cn('inline-block h-5 w-0.5 animate-pulse bg-foreground')} />;
};

export const StreamingMessage = () => {
  const selectedThreadId = useAtomValue(selectedThreadIdAtom);
  const streamingState = useAtomValue(streamingStateByThreadAtom);

  const currentState = selectedThreadId ? streamingState[selectedThreadId] : null;
  const isStreaming = currentState?.isStreaming ?? false;
  const streamingContent = currentState?.content ?? '';

  if (!isStreaming) return null;

  return (
    <div className={cn('flex gap-3 bg-muted/30 px-4 py-6')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary',
        )}
      >
        <Bot className={cn('h-4 w-4 animate-pulse')} />
      </div>
      <div className={cn('flex-1 space-y-2')}>
        <div className={cn('flex items-center gap-2')}>
          <span className={cn('text-sm font-medium')}>Assistant</span>
          {!streamingContent && (
            <Badge variant="secondary" className={cn('text-xs')}>
              <Loader2 className={cn('mr-1 h-3 w-3 animate-spin')} />
              Generating
            </Badge>
          )}
        </div>
        <div
          className={cn('prose prose-sm dark:prose-invert max-w-none [counter-reset:list-counter]')}
        >
          {streamingContent ? (
            <React.Fragment>
              <MarkdownContent content={streamingContent} />
              <span className={cn('ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary')} />
            </React.Fragment>
          ) : (
            <ThinkingIndicator />
          )}
        </div>
      </div>
    </div>
  );
};
