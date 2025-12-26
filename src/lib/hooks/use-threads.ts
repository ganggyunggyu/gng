'use client';

import { useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import {
  threadsAtom,
  selectedProjectIdAtom,
  selectedThreadIdAtom,
  selectedProjectAtom,
} from '@/stores';
import { createId, type Thread } from '@/types';

export function useThreads() {
  const [, setThreads] = useAtom(threadsAtom);
  const selectedProjectId = useAtomValue(selectedProjectIdAtom);
  const selectedProject = useAtomValue(selectedProjectAtom);
  const [selectedThreadId, setSelectedThreadId] = useAtom(selectedThreadIdAtom);

  const threads = useLiveQuery(
    async () => {
      if (!selectedProjectId) {
        setThreads([]);
        return [];
      }
      const data = await db.threads
        .where('projectId')
        .equals(selectedProjectId)
        .reverse()
        .sortBy('updatedAt');
      setThreads(data);
      return data;
    },
    [selectedProjectId],
  );

  const createThread = useCallback(
    async (title?: string) => {
      if (!selectedProjectId || !selectedProject) return null;

      const thread: Thread = {
        id: createId.thread(),
        projectId: selectedProjectId,
        title: title ?? 'New Chat',
        snapshot: selectedProject.currentPromptVersionId
          ? {
              promptVersionId: selectedProject.currentPromptVersionId,
              modelConfig: selectedProject.modelConfig,
            }
          : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.threads.add(thread);
      setSelectedThreadId(thread.id);
      return thread;
    },
    [selectedProjectId, selectedProject, setSelectedThreadId],
  );

  const deleteThread = useCallback(
    async (threadId: string) => {
      await db.transaction('rw', [db.threads, db.messages], async () => {
        await db.messages.where('threadId').equals(threadId).delete();
        await db.threads.delete(threadId);
      });

      if (selectedThreadId === threadId) {
        setSelectedThreadId(null);
      }
    },
    [selectedThreadId, setSelectedThreadId],
  );

  const updateThread = useCallback(async (threadId: string, updates: Partial<Thread>) => {
    await db.threads.update(threadId, {
      ...updates,
      updatedAt: new Date(),
    });
  }, []);

  return {
    threads: threads ?? [],
    isLoading: threads === undefined,
    createThread,
    deleteThread,
    updateThread,
  };
}
