'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Send, Square, RotateCcw, ImagePlus, X, Sparkles } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { cn } from '@/shared/lib';
import {
  streamingStateByThreadAtom,
  setStreamingStateAtom,
  useMessages,
} from '@/entities/message';
import { selectedThreadAtom, useThreads } from '@/entities/thread';
import { selectedProjectAtom } from '@/entities/project';
import { usePromptVersion } from '@/entities/prompt-version';
import { isImageModeAtom } from '../model';
import { useImageAttachment } from '../lib';

export function ChatInput() {
  const [input, setInput] = useState('');
  const [isImageMode, setIsImageMode] = useAtom(isImageModeAtom);
  const streamingState = useAtomValue(streamingStateByThreadAtom);
  const setStreamingState = useSetAtom(setStreamingStateAtom);
  const selectedThread = useAtomValue(selectedThreadAtom);
  const selectedProject = useAtomValue(selectedProjectAtom);
  const abortControllersRef = useRef<Record<string, AbortController>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isStreaming = selectedThread
    ? streamingState[selectedThread.id]?.isStreaming ?? false
    : false;

  const { messages, addMessage } = useMessages();
  const { updateThread } = useThreads();
  const { getSystemPrompt } = usePromptVersion();
  const {
    images,
    isDragging,
    fileInputRef,
    handleImageAdd,
    handleImageRemove,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useImageAttachment();

  useEffect(() => {
    if (!isStreaming && selectedThread) {
      textareaRef.current?.focus();
    }
  }, [isStreaming, selectedThread]);

  const handleImageGenerate = useCallback(async () => {
    if (!input.trim() || isStreaming || !selectedThread) return;

    const { id: threadId } = selectedThread;

    await addMessage({
      threadId,
      role: 'user',
      content: `🎨 ${input.trim()}`,
    });

    if (messages.length === 0) {
      const title = `🎨 ${input.trim().slice(0, 25)}...`;
      await updateThread(threadId, { title });
    }

    setInput('');
    setStreamingState({ threadId, isStreaming: true, content: 'Generating image...' });

    const controller = new AbortController();
    abortControllersRef.current[threadId] = controller;
    const startTime = Date.now();

    try {
      const { data } = await axios.post<{ imageUrl: string; revisedPrompt?: string }>(
        '/api/image',
        { prompt: input.trim(), systemPrompt: getSystemPrompt() },
        { signal: controller.signal },
      );

      const { imageUrl, revisedPrompt } = data;

      const content = `![Generated Image](${imageUrl})\n\n*${revisedPrompt || input.trim()}*`;

      await addMessage({
        threadId,
        role: 'assistant',
        content,
        meta: {
          provider: 'openai',
          model: 'dall-e-3',
          latencyMs: Date.now() - startTime,
        },
      });
    } catch (error) {
      if (axios.isCancel(error)) {
        await addMessage({
          threadId,
          role: 'assistant',
          content: 'Image generation stopped by user.',
          meta: { error: 'Stopped by user' },
        });
      } else {
        console.error('Image generation error:', error);
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.error || error.message
          : (error as Error).message;
        await addMessage({
          threadId,
          role: 'assistant',
          content: `Error: ${errorMessage}`,
          meta: { error: errorMessage },
        });
      }
    } finally {
      setStreamingState({ threadId, isStreaming: false, content: '' });
      delete abortControllersRef.current[threadId];
    }
  }, [input, isStreaming, selectedThread, messages, addMessage, updateThread, setStreamingState, getSystemPrompt]);

  const handleSubmit = useCallback(async () => {
    if (isImageMode) {
      return handleImageGenerate();
    }

    if (!input.trim() || isStreaming || !selectedThread || !selectedProject) return;

    const { id: threadId } = selectedThread;
    const { modelConfig } = selectedProject;
    const { provider } = modelConfig;

    const userMessage = await addMessage({
      threadId,
      role: 'user',
      content: input.trim(),
    });

    if (messages.length === 0) {
      const title = input.trim().slice(0, 30) + (input.trim().length > 30 ? '...' : '');
      await updateThread(threadId, { title });
    }

    setInput('');
    setStreamingState({ threadId, isStreaming: true, content: '' });

    const controller = new AbortController();
    abortControllersRef.current[threadId] = controller;

    const allMessages = [...messages, userMessage];
    let content = '';
    const startTime = Date.now();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          modelConfig,
          systemPrompt: getSystemPrompt(),
        }),
        signal: controller.signal,
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
              setStreamingState({ threadId, content });
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
        threadId,
        role: 'assistant',
        content,
        meta: {
          provider,
          model: modelConfig.modelName,
          latencyMs: Date.now() - startTime,
        },
      });
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        if (content) {
          await addMessage({
            threadId,
            role: 'assistant',
            content,
            meta: {
              provider,
              model: modelConfig.modelName,
              latencyMs: Date.now() - startTime,
              error: 'Stopped by user',
            },
          });
        }
      } else {
        console.error('Chat error:', error);
        await addMessage({
          threadId,
          role: 'assistant',
          content: `Error: ${(error as Error).message}`,
          meta: {
            error: (error as Error).message,
          },
        });
      }
    } finally {
      setStreamingState({ threadId, isStreaming: false, content: '' });
      delete abortControllersRef.current[threadId];
    }
  }, [
    input,
    isStreaming,
    isImageMode,
    selectedThread,
    selectedProject,
    messages,
    addMessage,
    updateThread,
    setStreamingState,
    handleImageGenerate,
    getSystemPrompt,
  ]);

  const handleStop = useCallback(() => {
    const threadId = selectedThread?.id;
    if (!threadId) return;
    const controller = abortControllersRef.current[threadId];
    if (controller) {
      controller.abort();
    }
  }, [selectedThread]);

  const handleRetry = useCallback(async () => {
    if (messages.length < 2) return;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
    }
  }, [messages]);

  const canRetry = messages.length > 0 && messages[messages.length - 1]?.role === 'assistant';

  return (
    <div className="shrink-0 border-t bg-background p-3 sm:p-4">
      <div className="mx-auto max-w-3xl">
        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {images.map((img, index) => (
              <div key={img.url} className="group relative">
                <img
                  src={img.url}
                  alt={`Attached ${index + 1}`}
                  className="h-16 w-16 rounded-lg object-cover border"
                />
                <button
                  type="button"
                  onClick={() => handleImageRemove(index)}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          className={`relative rounded-lg border ${isDragging ? 'border-primary border-dashed bg-primary/5' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-primary/10">
              <p className="text-sm font-medium text-primary">Drop images here</p>
            </div>
          )}

          <div className="flex gap-2 p-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleImageAdd(e.target.files)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedThread || isStreaming}
            >
              <ImagePlus className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={isImageMode ? 'default' : 'ghost'}
              size="icon"
              className={cn('shrink-0', isImageMode && 'bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600')}
              onClick={() => setIsImageMode(!isImageMode)}
              disabled={!selectedThread || isStreaming}
            >
              <Sparkles className="h-4 w-4" />
            </Button>

            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onEnterSubmit={handleSubmit}
              placeholder={
                !selectedThread
                  ? 'Select a project and thread to start'
                  : isImageMode
                    ? 'Describe the image you want to generate...'
                    : 'Type a message...'
              }
              disabled={!selectedThread || isStreaming}
              className="min-h-10 resize-none border-0 focus-visible:ring-0"
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
                  disabled={(!input.trim() && images.length === 0) || !selectedThread}
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
    </div>
  );
}
