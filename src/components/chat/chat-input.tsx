'use client';

import { useState, useRef, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Send, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  isStreamingAtom,
  streamingContentAtom,
  selectedThreadAtom,
  selectedProjectAtom,
} from '@/stores';
import { useMessages, useThreads } from '@/lib/hooks';
import type { Message } from '@/types';
import { createId } from '@/types';

export function ChatInput() {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useAtom(isStreamingAtom);
  const setStreamingContent = useSetAtom(streamingContentAtom);
  const selectedThread = useAtomValue(selectedThreadAtom);
  const selectedProject = useAtomValue(selectedProjectAtom);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { messages, addMessage } = useMessages();
  const { updateThread } = useThreads();

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isStreaming || !selectedThread || !selectedProject) return;

    const userMessage = await addMessage({
      threadId: selectedThread.id,
      role: 'user',
      content: input.trim(),
    });

    if (messages.length === 0) {
      const title = input.trim().slice(0, 30) + (input.trim().length > 30 ? '...' : '');
      await updateThread(selectedThread.id, { title });
    }

    setInput('');
    setIsStreaming(true);
    setStreamingContent('');

    abortControllerRef.current = new AbortController();

    const allMessages = [...messages, userMessage];
    let content = '';
    const startTime = Date.now();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          threadId: selectedThread.id,
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (!data) continue;

          try {
            const event = JSON.parse(data);
            if (event.type === 'delta') {
              content += event.data;
              setStreamingContent(content);
            } else if (event.type === 'error') {
              throw new Error(event.data.error);
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }

      await addMessage({
        threadId: selectedThread.id,
        role: 'assistant',
        content,
        meta: {
          provider: selectedProject.modelConfig.provider,
          model: selectedProject.modelConfig.modelName,
          latencyMs: Date.now() - startTime,
        },
      });
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        if (content) {
          await addMessage({
            threadId: selectedThread.id,
            role: 'assistant',
            content,
            meta: {
              provider: selectedProject.modelConfig.provider,
              model: selectedProject.modelConfig.modelName,
              latencyMs: Date.now() - startTime,
              error: 'Stopped by user',
            },
          });
        }
      } else {
        console.error('Chat error:', error);
        await addMessage({
          threadId: selectedThread.id,
          role: 'assistant',
          content: `Error: ${(error as Error).message}`,
          meta: {
            error: (error as Error).message,
          },
        });
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  }, [
    input,
    isStreaming,
    selectedThread,
    selectedProject,
    messages,
    addMessage,
    updateThread,
    setIsStreaming,
    setStreamingContent,
  ]);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const handleRetry = useCallback(async () => {
    if (messages.length < 2) return;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canRetry = messages.length > 0 && messages[messages.length - 1]?.role === 'assistant';

  return (
    <div className="border-t bg-background p-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedThread ? 'Type a message...' : 'Select a project and thread to start'
            }
            disabled={!selectedThread || isStreaming}
            className="min-h-[60px] resize-none"
            rows={1}
          />
          <div className="flex flex-col gap-1">
            {isStreaming ? (
              <Button variant="destructive" size="icon" onClick={handleStop}>
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={!input.trim() || !selectedThread}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
            {canRetry && !isStreaming && (
              <Button variant="outline" size="icon" onClick={handleRetry}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
