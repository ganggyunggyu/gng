'use client';

import { useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/shared/db';
import { threadsAtom, selectedThreadIdAtom } from './model';
import { selectedProjectIdAtom, selectedProjectAtom } from '@/entities/project/model';
import { createId, type Thread } from '@/shared/types';

export const useThreads = () => {
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

  const deleteThreads = useCallback(
    async (threadIds: string[]) => {
      if (threadIds.length === 0) return;

      await db.transaction('rw', [db.threads, db.messages], async () => {
        for (const threadId of threadIds) {
          await db.messages.where('threadId').equals(threadId).delete();
          await db.threads.delete(threadId);
        }
      });

      if (selectedThreadId && threadIds.includes(selectedThreadId)) {
        setSelectedThreadId(null);
      }
    },
    [selectedThreadId, setSelectedThreadId],
  );

  const deleteAllThreads = useCallback(async () => {
    if (!selectedProjectId) return;

    const threadIds = await db.threads
      .where('projectId')
      .equals(selectedProjectId)
      .primaryKeys();

    await deleteThreads(threadIds);
  }, [selectedProjectId, deleteThreads]);

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
    deleteThreads,
    deleteAllThreads,
    updateThread,
  };
}
