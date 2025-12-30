import { useCallback, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { setStreamingStateAtom } from '@/entities/message';
import { selectedThreadAtom, useThreads } from '@/entities/thread';
import { selectedProjectAtom } from '@/entities/project';
import { usePromptVersion } from '@/entities/prompt-version';
import type { Message } from '@/shared/types';

interface UseChatSubmitParams {
  messages: Message[];
  addMessage: (msg: Omit<Message, 'id' | 'createdAt'>) => Promise<Message>;
}

export const useChatSubmit = ({ messages, addMessage }: UseChatSubmitParams) => {
  const setStreamingState = useSetAtom(setStreamingStateAtom);
  const selectedThread = useAtomValue(selectedThreadAtom);
  const selectedProject = useAtomValue(selectedProjectAtom);
  const abortControllersRef = useRef<Record<string, AbortController>>({});
  const { updateThread } = useThreads();
  const { getSystemPrompt } = usePromptVersion();

  const handleSubmit = useCallback(
    async (input: string) => {
      if (!input.trim() || !selectedThread || !selectedProject) return;

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
    },
    [selectedThread, selectedProject, messages, addMessage, updateThread, setStreamingState, getSystemPrompt],
  );

  const handleStop = useCallback(() => {
    const threadId = selectedThread?.id;
    if (!threadId) return;
    const controller = abortControllersRef.current[threadId];
    if (controller) {
      controller.abort();
    }
  }, [selectedThread]);

  return { handleSubmit, handleStop };
}
