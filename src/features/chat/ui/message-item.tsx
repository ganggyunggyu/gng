'use client';

import { useMemo, useState } from 'react';
import { User, Bot, AlertCircle, Copy, Check, Download, ImageDown } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib';
import { MarkdownContent } from '@/features/chat/ui/markdown-content';
import type { Message } from '@/shared/types';

interface MessageItemProps {
  message: Message;
}

const IMAGE_MARKDOWN_PATTERN = /!\[[^\]]*]\(([^)]+)\)/g;
const LINK_MARKDOWN_PATTERN = /\[[^\]]*]\(([^)]+)\)/g;
const IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i;

const normalizeMarkdownUrl = (rawUrl: string) => {
  const [url] = rawUrl.trim().split(/\s+/);
  return url.replace(/^<|>$/g, '');
};

const getImageUrlList = (content: string) => {
  const markdownImageUrlList = Array.from(content.matchAll(IMAGE_MARKDOWN_PATTERN))
    .map((match) => {
      const [, urlCandidate] = match;
      return urlCandidate ? normalizeMarkdownUrl(urlCandidate) : '';
    })
    .filter((url) => !!url);

  if (markdownImageUrlList.length > 0) {
    return Array.from(new Set(markdownImageUrlList));
  }

  const markdownLinkUrlList = Array.from(content.matchAll(LINK_MARKDOWN_PATTERN))
    .map((match) => {
      const [, urlCandidate] = match;
      return urlCandidate ? normalizeMarkdownUrl(urlCandidate) : '';
    })
    .filter((url) => !!url)
    .filter((url) => url.startsWith('data:image/') || IMAGE_EXTENSION_PATTERN.test(url));

  return Array.from(new Set(markdownLinkUrlList));
};

const getImageExtension = (imageUrl: string) => {
  if (imageUrl.startsWith('data:image/')) {
    const mimeMatch = imageUrl.match(/^data:image\/([^;]+);/i);
    const mimeType = mimeMatch?.[1]?.toLowerCase();

    if (!mimeType) return 'png';
    if (mimeType === 'jpeg') return 'jpg';
    if (mimeType === 'svg+xml') return 'svg';
    return mimeType;
  }

  try {
    const { pathname } = new URL(imageUrl, window.location.origin);
    const extension = pathname.split('.').pop();
    return extension ? extension.toLowerCase() : 'png';
  } catch {
    return 'png';
  }
};

const downloadImage = async (imageUrl: string, fileName: string) => {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error('Failed to download image');
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    const anchor = document.createElement('a');
    anchor.href = imageUrl;
    anchor.download = fileName;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
};

export const MessageItem = ({ message }: MessageItemProps) => {
  const { content, role, meta, id } = message;
  const [copied, setCopied] = useState(false);
  const isUser = role === 'user';
  const hasError = !!meta?.error;
  const imageUrlList = useMemo(() => getImageUrlList(content), [content]);
  const [primaryImageUrl] = imageUrlList;
  const hasImage = imageUrlList.length > 0;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTextDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-${id.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImageDownload = async () => {
    if (!primaryImageUrl) return;
    const extension = getImageExtension(primaryImageUrl);
    const fileName = `generated-image-${id.slice(0, 8)}.${extension}`;
    await downloadImage(primaryImageUrl, fileName);
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
          {meta?.model && (
            <Badge variant="outline" className={cn('text-xs')}>
              {meta.model}
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
          {hasImage && (
            <Button
              variant="ghost"
              size="sm"
              className={cn('h-7 gap-1 text-xs text-muted-foreground hover:text-foreground')}
              onClick={handleImageDownload}
            >
              <ImageDown className={cn('h-3 w-3')} />
              Download Image
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-7 gap-1 text-xs text-muted-foreground hover:text-foreground')}
            onClick={handleTextDownload}
          >
            <Download className={cn('h-3 w-3')} />
            Download Text
          </Button>
        </div>
        {meta?.latencyMs && (
          <p className={cn('text-xs text-muted-foreground')}>
            {(meta.latencyMs / 1000).toFixed(2)}s
            {meta.tokensOut && ` · ${meta.tokensOut} tokens`}
          </p>
        )}
      </div>
    </div>
  );
};
