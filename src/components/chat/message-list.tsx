'use client';

import { useAtomValue } from 'jotai';
import { User, Bot, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { isStreamingAtom, streamingContentAtom } from '@/stores';
import { useMessages } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageItemProps {
  message: Message;
}

function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  const hasError = !!message.meta?.error;

  return (
    <div
      className={cn('flex gap-3 px-4 py-6', isUser ? 'bg-transparent' : 'bg-muted/30')}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{isUser ? 'You' : 'Assistant'}</span>
          {message.meta?.model && (
            <Badge variant="outline" className="text-xs">
              {message.meta.model}
            </Badge>
          )}
          {hasError && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="mr-1 h-3 w-3" />
              Error
            </Badge>
          )}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        {message.meta?.latencyMs && (
          <p className="text-xs text-muted-foreground">
            {(message.meta.latencyMs / 1000).toFixed(2)}s
            {message.meta.tokensOut && ` · ${message.meta.tokensOut} tokens`}
          </p>
        )}
      </div>
    </div>
  );
}

function StreamingMessage() {
  const isStreaming = useAtomValue(isStreamingAtom);
  const streamingContent = useAtomValue(streamingContentAtom);

  if (!isStreaming) return null;

  return (
    <div className="flex gap-3 bg-muted/30 px-4 py-6">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-2">
        <span className="text-sm font-medium">Assistant</span>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">
            {streamingContent || 'Thinking...'}
            <span className="inline-block h-4 w-1 animate-pulse bg-foreground" />
          </p>
        </div>
      </div>
    </div>
  );
}

export function MessageList() {
  const { messages, isLoading } = useMessages();

  return (
    <ScrollArea className="flex-1">
      <div className="mx-auto max-w-3xl">
        {messages.length === 0 && !isLoading ? (
          <div className="flex h-full items-center justify-center py-20">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Welcome to Gng</h2>
              <p className="mt-2 text-muted-foreground">
                Start a conversation or select a project
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => <MessageItem key={message.id} message={message} />)
        )}
        <StreamingMessage />
      </div>
    </ScrollArea>
  );
}
