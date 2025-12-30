'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib';

interface CodeBlockProps {
  language: string;
  children: string;
}

export const CodeBlock = ({ language, children }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('group relative my-4')}>
      <div
        className={cn('flex items-center justify-between rounded-t-lg bg-zinc-800 px-4 py-2')}
      >
        <span className={cn('text-xs text-zinc-400')}>{language || 'code'}</span>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-6 w-6 text-zinc-400 hover:text-white')}
          onClick={handleCopy}
        >
          {copied ? <Check className={cn('h-3 w-3')} /> : <Copy className={cn('h-3 w-3')} />}
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
};
