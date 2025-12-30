'use client';

import { useState } from 'react';
import { User, Bot, AlertCircle, Copy, Check, Download } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib';
import { MarkdownContent } from '@/features/chat/ui/markdown-content';
import type { Message } from '@/shared/types';

interface MessageItemProps {
  message: Message;
}

export const MessageItem = ({ message }: MessageItemProps) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const hasError = !!message.meta?.error;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([message.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-${message.id.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn(
        'group flex gap-3 px-3 py-4 sm:px-4 sm:py-6',
        isUser ? 'bg-transparent' : 'bg-muted/30',
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary',
        )}
      >
        {isUser ? <User className={cn('h-4 w-4')} /> : <Bot className={cn('h-4 w-4')} />}
      </div>
      <div className={cn('min-w-0 flex-1 space-y-2')}>
        <div className={cn('flex items-center gap-2')}>
          <span className={cn('text-sm font-medium')}>{isUser ? 'You' : 'Assistant'}</span>
          {message.meta?.model && (
            <Badge variant="outline" className={cn('text-xs')}>
              {message.meta.model}
            </Badge>
          )}
          {hasError && (
            <Badge variant="destructive" className={cn('text-xs')}>
              <AlertCircle className={cn('mr-1 h-3 w-3')} />
              Error
            </Badge>
          )}
        </div>
        <div
          className={cn(
            'prose prose-sm dark:prose-invert max-w-none wrap-break-word [counter-reset:list-counter]',
          )}
        >
          {isUser ? (
            <p className={cn('whitespace-pre-wrap wrap-break-word')}>{message.content}</p>
          ) : (
            <MarkdownContent content={message.content} />
          )}
        </div>
        <div
          className={cn(
            'flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100',
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 gap-1 text-xs text-muted-foreground hover:text-foreground')}
            onClick={handleCopy}
          >
            {copied ? (
              <Check className={cn('h-3 w-3 text-green-500')} />
            ) : (
              <Copy className={cn('h-3 w-3')} />
            )}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 gap-1 text-xs text-muted-foreground hover:text-foreground')}
            onClick={handleDownload}
          >
            <Download className={cn('h-3 w-3')} />
            Download
          </Button>
        </div>
        {message.meta?.latencyMs && (
          <p className={cn('text-xs text-muted-foreground')}>
            {(message.meta.latencyMs / 1000).toFixed(2)}s
            {message.meta.tokensOut && ` · ${message.meta.tokensOut} tokens`}
          </p>
        )}
      </div>
    </div>
  );
};
