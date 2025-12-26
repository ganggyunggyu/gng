'use client';

import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { projectsAtom, selectedProjectIdAtom, selectedThreadIdAtom } from '@/stores';
import { createId, type Project, type ModelConfig, type PromptVersion } from '@/types';

export function useProjects() {
  const [, setProjects] = useAtom(projectsAtom);
  const [selectedProjectId, setSelectedProjectId] = useAtom(selectedProjectIdAtom);
  const [, setSelectedThreadId] = useAtom(selectedThreadIdAtom);

  const projects = useLiveQuery(async () => {
    const data = await db.projects.orderBy('updatedAt').reverse().toArray();
    setProjects(data);
    return data;
  }, []);

  const createProject = useCallback(
    async (name: string, modelConfig?: Partial<ModelConfig>) => {
      const projectId = createId.project();
      const promptVersionId = createId.promptVersion();

      const promptVersion: PromptVersion = {
        id: promptVersionId,
        projectId,
        version: 1,
        layers: {
          systemBase: 'You are a helpful assistant.',
        },
        createdAt: new Date(),
      };

      const project: Project = {
        id: projectId,
        name,
        currentPromptVersionId: promptVersionId,
        modelConfig: {
          provider: modelConfig?.provider ?? 'openai',
          modelName: modelConfig?.modelName ?? 'gpt-4o',
          temperature: modelConfig?.temperature ?? 0.7,
          maxTokens: modelConfig?.maxTokens ?? 4096,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.transaction('rw', [db.projects, db.promptVersions], async () => {
        await db.promptVersions.add(promptVersion);
        await db.projects.add(project);
      });

      setSelectedProjectId(projectId);
      return project;
    },
    [setSelectedProjectId],
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      await db.transaction(
        'rw',
        [db.projects, db.promptVersions, db.threads, db.messages],
        async () => {
          const threads = await db.threads.where('projectId').equals(projectId).toArray();
          for (const thread of threads) {
            await db.messages.where('threadId').equals(thread.id).delete();
          }
          await db.threads.where('projectId').equals(projectId).delete();
          await db.promptVersions.where('projectId').equals(projectId).delete();
          await db.projects.delete(projectId);
        },
      );

      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
        setSelectedThreadId(null);
      }
    },
    [selectedProjectId, setSelectedProjectId, setSelectedThreadId],
  );

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    await db.projects.update(projectId, {
      ...updates,
      updatedAt: new Date(),
    });
  }, []);

  return {
    projects: projects ?? [],
    isLoading: projects === undefined,
    createProject,
    deleteProject,
    updateProject,
  };
}
