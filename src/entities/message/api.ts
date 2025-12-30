'use client';

import { useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/shared/db';
import { messagesAtom } from './model';
import { selectedThreadIdAtom } from '@/entities/thread/model';
import { createId, type Message } from '@/shared/types';

export const useMessages = () => {
  const [, setMessages] = useAtom(messagesAtom);
  const selectedThreadId = useAtomValue(selectedThreadIdAtom);

  const messages = useLiveQuery(
    async () => {
      if (!selectedThreadId) {
        setMessages([]);
        return [];
      }
      const data = await db.messages
        .where('threadId')
        .equals(selectedThreadId)
        .sortBy('createdAt');
      setMessages(data);
      return data;
    },
    [selectedThreadId],
  );

  const addMessage = useCallback(
    async (message: Omit<Message, 'id' | 'createdAt'>) => {
      const newMessage: Message = {
        ...message,
        id: createId.message(),
        createdAt: new Date(),
      };
      await db.messages.add(newMessage);

      if (message.threadId) {
        await db.threads.update(message.threadId, { updatedAt: new Date() });
      }

      return newMessage;
    },
    [],
  );

  const updateMessage = useCallback(async (messageId: string, updates: Partial<Message>) => {
    await db.messages.update(messageId, updates);
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    await db.messages.delete(messageId);
  }, []);

  return {
    messages: messages ?? [],
    isLoading: messages === undefined,
    addMessage,
    updateMessage,
    deleteMessage,
  };
}
