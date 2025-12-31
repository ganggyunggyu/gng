import { useCallback, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import axios from 'axios';
import { toast } from 'sonner';
import { setStreamingStateAtom } from '@/entities/message';
import { selectedThreadAtom, useThreads } from '@/entities/thread';
import { selectedProjectAtom } from '@/entities/project';
import { usePromptVersion } from '@/entities/prompt-version';
import { IMAGE_MODEL_CONFIG } from '@/shared/providers';
import type { Message, Provider } from '@/shared/types';

interface UseImageGenerateParams {
  messages: Message[];
  addMessage: (msg: Omit<Message, 'id' | 'createdAt'>) => Promise<Message>;
}

export const useImageGenerate = ({ messages, addMessage }: UseImageGenerateParams) => {
  const setStreamingState = useSetAtom(setStreamingStateAtom);
  const selectedThread = useAtomValue(selectedThreadAtom);
  const selectedProject = useAtomValue(selectedProjectAtom);
  const abortControllersRef = useRef<Record<string, AbortController>>({});
  const { updateThread } = useThreads();
  const { getSystemPrompt } = usePromptVersion();

  const handleImageGenerate = useCallback(
    async (input: string) => {
      if (!input.trim() || !selectedThread) return;

      const { id: threadId } = selectedThread;
      const selectedModel = selectedProject?.modelConfig.modelName;
      const imageModel = selectedModel && IMAGE_MODEL_CONFIG[selectedModel] ? selectedModel : undefined;

      await addMessage({
        threadId,
        role: 'user',
        content: `🎨 ${input.trim()}`,
      });

      if (messages.length === 0) {
        const title = `🎨 ${input.trim().slice(0, 25)}...`;
        await updateThread(threadId, { title });
      }

      setStreamingState({ threadId, isStreaming: true, content: 'Generating image...' });

      const controller = new AbortController();
      abortControllersRef.current[threadId] = controller;
      const startTime = Date.now();

      try {
        const { data } = await axios.post<{
          imageUrl: string;
          revisedPrompt?: string;
          model: string;
        }>(
          '/api/image',
          {
            prompt: input.trim(),
            systemPrompt: getSystemPrompt(),
            ...(imageModel && { model: imageModel }),
          },
          { signal: controller.signal },
        );

        const { imageUrl, revisedPrompt, model } = data;
        const provider = IMAGE_MODEL_CONFIG[model]?.provider;
        const normalizedProvider: Provider | undefined =
          provider === 'gemini-flash' ? 'gemini' : provider;

        const content = `![Generated Image](${imageUrl})\n\n*${revisedPrompt || input.trim()}*`;

        await addMessage({
          threadId,
          role: 'assistant',
          content,
          meta: {
            ...(normalizedProvider && { provider: normalizedProvider }),
            model,
            latencyMs: Date.now() - startTime,
          },
        });
      } catch (error) {
        if (axios.isCancel(error)) {
          toast.info('Image generation stopped');
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
          toast.error(`Image generation failed: ${errorMessage}`);
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
    },
    [
      selectedThread,
      selectedProject,
      messages,
      addMessage,
      updateThread,
      setStreamingState,
      getSystemPrompt,
    ],
  );

  const handleStop = useCallback(() => {
    const threadId = selectedThread?.id;
    if (!threadId) return;
    const controller = abortControllersRef.current[threadId];
    if (controller) {
      controller.abort();
    }
  }, [selectedThread]);

  return { handleImageGenerate, handleStop };
}
