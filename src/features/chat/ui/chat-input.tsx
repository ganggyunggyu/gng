'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { Send, Square, RotateCcw, ImagePlus, X, Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { cn } from '@/shared/lib';
import { IMAGE_MODEL_CONFIG } from '@/shared/providers';
import { streamingStateByThreadAtom, useMessages } from '@/entities/message';
import { selectedProjectAtom } from '@/entities/project';
import { selectedThreadAtom } from '@/entities/thread';
import { isImageModeAtom } from '@/features/chat/model';
import { useImageAttachment, useChatSubmit, useImageGenerate } from '@/features/chat/lib';

export const ChatInput = () => {
  const [input, setInput] = useState('');
  const [isImageMode, setIsImageMode] = useAtom(isImageModeAtom);
  const streamingState = useAtomValue(streamingStateByThreadAtom);
  const selectedProject = useAtomValue(selectedProjectAtom);
  const selectedThread = useAtomValue(selectedThreadAtom);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { modelConfig } = selectedProject ?? {};
  const selectedModelName = modelConfig?.modelName;
  const isImageModel = Boolean(selectedModelName && IMAGE_MODEL_CONFIG[selectedModelName]);
  const isImageModeEnabled = isImageMode || isImageModel;

  const isStreaming = selectedThread
    ? streamingState[selectedThread.id]?.isStreaming ?? false
    : false;

  const { messages, addMessage } = useMessages();
  const { handleSubmit: submitChat, handleStop: stopChat } = useChatSubmit({ messages, addMessage });
  const { handleImageGenerate: generateImage, handleStop: stopImage } = useImageGenerate({ messages, addMessage });
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

  useEffect(() => {
    if (!selectedProject) return;
    setIsImageMode(isImageModel);
  }, [selectedProject, isImageModel, setIsImageMode]);

  const handleSubmit = useCallback(async () => {
    if (!input.trim()) return;

    const messageToSend = input;
    setInput('');

    if (isImageModeEnabled) {
      await generateImage(messageToSend);
    } else {
      await submitChat(messageToSend);
    }
  }, [input, isImageModeEnabled, generateImage, submitChat]);

  const handleStop = useCallback(() => {
    if (isImageModeEnabled) {
      stopImage();
    } else {
      stopChat();
    }
  }, [isImageModeEnabled, stopImage, stopChat]);

  const handleRetry = useCallback(async () => {
    if (messages.length < 2) return;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
    }
  }, [messages]);

  const canRetry = messages.length > 0 && messages[messages.length - 1]?.role === 'assistant';

  return (
    <div className={cn('shrink-0 border-t bg-background p-3 sm:p-4')}>
      <div className={cn('mx-auto max-w-3xl')}>
        {images.length > 0 && (
          <div className={cn('mb-3 flex flex-wrap gap-2')}>
            {images.map((img, index) => (
              <div key={img.url} className={cn('group relative')}>
                <img
                  src={img.url}
                  alt={`Attached ${index + 1}`}
                  className={cn('h-16 w-16 rounded-lg border object-cover')}
                />
                <button
                  type="button"
                  onClick={() => handleImageRemove(index)}
                  className={cn(
                    'absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100',
                  )}
                >
                  <X className={cn('h-3 w-3')} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          className={cn(
            'relative rounded-lg border',
            isDragging && 'border-primary border-dashed bg-primary/5',
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div
              className={cn(
                'absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-primary/10',
              )}
            >
              <p className={cn('text-sm font-medium text-primary')}>Drop images here</p>
            </div>
          )}

          <div className={cn('flex gap-2 p-2')}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className={cn('hidden')}
              onChange={(e) => handleImageAdd(e.target.files)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn('shrink-0')}
              onClick={() => fileInputRef.current?.click()}
              disabled={!selectedThread || isStreaming}
            >
              <ImagePlus className={cn('h-4 w-4')} />
            </Button>

            <Button
              type="button"
              variant={isImageModeEnabled ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                'shrink-0',
                isImageModeEnabled &&
                  'bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
              )}
              onClick={() => setIsImageMode(!isImageMode)}
              disabled={!selectedThread || isStreaming || isImageModel}
            >
              <Sparkles className={cn('h-4 w-4')} />
            </Button>

            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onEnterSubmit={handleSubmit}
              placeholder={
                !selectedThread
                  ? 'Select a project and thread to start'
                  : isImageModeEnabled
                    ? 'Describe the image you want to generate...'
                    : 'Type a message...'
              }
              disabled={!selectedThread || isStreaming}
              className={cn('min-h-10 resize-none border-0 focus-visible:ring-0')}
              rows={1}
            />

            <div className={cn('flex flex-col gap-1')}>
              {isStreaming ? (
                <Button variant="destructive" size="icon" onClick={handleStop}>
                  <Square className={cn('h-4 w-4')} />
                </Button>
              ) : (
                <Button
                  size="icon"
                  onClick={handleSubmit}
                  disabled={(!input.trim() && images.length === 0) || !selectedThread}
                >
                  <Send className={cn('h-4 w-4')} />
                </Button>
              )}
              {canRetry && !isStreaming && (
                <Button variant="outline" size="icon" onClick={handleRetry}>
                  <RotateCcw className={cn('h-4 w-4')} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
