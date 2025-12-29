'use client';

import { useEffect, useRef, useState, memo } from 'react';
import { useAtomValue } from 'jotai';
import { User, Bot, AlertCircle, Copy, Check, Loader2, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { cn, getModKey } from '@/shared/lib';
import { streamingStateByThreadAtom, useMessages } from '@/entities/message';
import { selectedThreadIdAtom } from '@/entities/thread';
import type { Message } from '@/shared/types';

interface MessageItemProps {
  message: Message;
}

interface CodeBlockProps {
  language: string;
  children: string;
}

function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-4">
      <div className="flex items-center justify-between rounded-t-lg bg-zinc-800 px-4 py-2">
        <span className="text-xs text-zinc-400">{language || 'code'}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-zinc-400 hover:text-white"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          fontSize: '0.875rem',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

const MarkdownContent = memo(function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match && !className;

          if (isInline) {
            return (
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono" {...props}>
                {children}
              </code>
            );
          }

          return (
            <CodeBlock language={match?.[1] || ''}>
              {String(children).replace(/\n$/, '')}
            </CodeBlock>
          );
        },
        pre({ children }) {
          return <>{children}</>;
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {children}
            </a>
          );
        },
        img({ src, alt }) {
          if (!src) return null;
          return (
            <img
              src={src}
              alt={alt || ''}
              className="my-4 max-w-full rounded-lg"
              loading="lazy"
            />
          );
        },
        table({ children }) {
          return (
            <div className="my-4 overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">{children}</table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="border-b bg-muted/50 px-4 py-2 text-left font-medium">
              {children}
            </th>
          );
        },
        td({ children }) {
          return <td className="border-b px-4 py-2">{children}</td>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="my-4 border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          );
        },
        ul({ children }) {
          return <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return (
            <ol className="my-2 ml-6 space-y-1 list-none [&>li]:before:content-[counter(list-counter)'.'] [&>li]:before:mr-2 [&>li]:before:font-medium [&>li]:[counter-increment:list-counter]">
              {children}
            </ol>
          );
        },
        hr() {
          return <hr className="my-6 border-border" />;
        },
        h1({ children }) {
          return <h1 className="mt-6 mb-4 text-2xl font-bold">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="mt-5 mb-3 text-xl font-bold">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="mt-4 mb-2 text-lg font-semibold">{children}</h3>;
        },
        h4({ children }) {
          return <h4 className="mt-3 mb-2 text-base font-semibold">{children}</h4>;
        },
        p({ children }) {
          return <p className="my-2 leading-relaxed">{children}</p>;
        },
        strong({ children }) {
          return <strong className="font-semibold">{children}</strong>;
        },
        em({ children }) {
          return <em className="italic">{children}</em>;
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

function MessageItem({ message }: MessageItemProps) {
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
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
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
        <div className="prose prose-sm dark:prose-invert max-w-none wrap-break-word [counter-reset:list-counter]">
          {isUser ? (
            <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
          ) : (
            <MarkdownContent content={message.content} />
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleDownload}
          >
            <Download className="h-3 w-3" />
            Download
          </Button>
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

function ThinkingIndicator() {
  return (
    <span className="inline-block h-5 w-0.5 animate-pulse bg-foreground" />
  );
}

function StreamingMessage() {
  const selectedThreadId = useAtomValue(selectedThreadIdAtom);
  const streamingState = useAtomValue(streamingStateByThreadAtom);

  const currentState = selectedThreadId ? streamingState[selectedThreadId] : null;
  const isStreaming = currentState?.isStreaming ?? false;
  const streamingContent = currentState?.content ?? '';

  if (!isStreaming) return null;

  return (
    <div className="flex gap-3 bg-muted/30 px-4 py-6">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
        <Bot className="h-4 w-4 animate-pulse" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Assistant</span>
          {!streamingContent && (
            <Badge variant="secondary" className="text-xs">
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Generating
            </Badge>
          )}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none [counter-reset:list-counter]">
          {streamingContent ? (
            <>
              <MarkdownContent content={streamingContent} />
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary" />
            </>
          ) : (
            <ThinkingIndicator />
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 py-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className={cn('flex gap-3 px-4', i % 2 === 0 && 'bg-muted/30 py-6')}>
          <div className="h-8 w-8 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-4/5 rounded bg-muted" />
              <div className="h-3 w-3/5 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageList() {
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
      return (
        <div className="flex h-full items-center justify-center py-20">
          <div className="flex flex-col items-center gap-8">
            {/* Logo */}
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-foreground/5 blur-2xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-foreground shadow-2xl">
                <span className="text-4xl font-bold text-background font-(family-name:--font-space-grotesk)">G</span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-3 text-center">
              <h1 className="text-4xl font-bold tracking-tight">
                Welcome to Gng
              </h1>
              <p className="text-lg text-muted-foreground">
                What can I help you with today?
              </p>
            </div>

            {/* Hint */}
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <p>Create a project to get started</p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground/60">
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  {getModKey()}
                </kbd>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  ⇧
                </kbd>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                  P
                </kbd>
                <span>new project</span>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return messages.map((message) => <MessageItem key={message.id} message={message} />);
  };

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="mx-auto max-w-3xl pb-4">
        {renderContent()}
        <StreamingMessage />
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
