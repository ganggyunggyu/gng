'use client';

import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { cn } from '@/shared/lib';
import { CodeBlock } from '@/features/chat/ui/code-block';

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent = memo(function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match && !className;

          if (isInline) {
            return (
              <code
                className={cn('rounded bg-muted px-1.5 py-0.5 text-sm font-mono')}
                {...props}
              >
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
          return <React.Fragment>{children}</React.Fragment>;
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn('text-primary underline underline-offset-4 hover:text-primary/80')}
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
              className={cn('my-4 max-w-full rounded-lg')}
              loading="lazy"
            />
          );
        },
        table({ children }) {
          return (
            <div className={cn('my-4 overflow-x-auto rounded-lg border')}>
              <table className={cn('w-full text-sm')}>{children}</table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className={cn('border-b bg-muted/50 px-4 py-2 text-left font-medium')}>
              {children}
            </th>
          );
        },
        td({ children }) {
          return <td className={cn('border-b px-4 py-2')}>{children}</td>;
        },
        blockquote({ children }) {
          return (
            <blockquote
              className={cn('my-4 border-l-4 border-primary/50 pl-4 italic text-muted-foreground')}
            >
              {children}
            </blockquote>
          );
        },
        ul({ children }) {
          return <ul className={cn('my-2 ml-4 list-disc space-y-1')}>{children}</ul>;
        },
        ol({ children }) {
          return (
            <ol
              className={cn(
                "my-2 ml-6 space-y-1 list-none [&>li]:before:content-[counter(list-counter)'.'] [&>li]:before:mr-2 [&>li]:before:font-medium [&>li]:[counter-increment:list-counter]",
              )}
            >
              {children}
            </ol>
          );
        },
        hr() {
          return <hr className={cn('my-6 border-border')} />;
        },
        h1({ children }) {
          return <h1 className={cn('mt-6 mb-4 text-2xl font-bold')}>{children}</h1>;
        },
        h2({ children }) {
          return <h2 className={cn('mt-5 mb-3 text-xl font-bold')}>{children}</h2>;
        },
        h3({ children }) {
          return <h3 className={cn('mt-4 mb-2 text-lg font-semibold')}>{children}</h3>;
        },
        h4({ children }) {
          return <h4 className={cn('mt-3 mb-2 text-base font-semibold')}>{children}</h4>;
        },
        p({ children }) {
          return <p className={cn('my-2 leading-relaxed')}>{children}</p>;
        },
        strong({ children }) {
          return <strong className={cn('font-semibold')}>{children}</strong>;
        },
        em({ children }) {
          return <em className={cn('italic')}>{children}</em>;
        },
        li({ children }) {
          return <li className={cn('leading-relaxed')}>{children}</li>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
});
