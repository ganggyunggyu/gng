'use client';

import { useCallback, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { db } from '@/shared/db';
import { currentPromptVersionAtom } from './model';
import { selectedProjectAtom } from '@/entities/project';
import { createId, type PromptVersion, type PromptLayers } from '@/shared/types';

export function usePromptVersion() {
  const selectedProject = useAtomValue(selectedProjectAtom);
  const [currentPromptVersion, setCurrentPromptVersion] = useAtom(currentPromptVersionAtom);

  // 프로젝트가 변경되면 현재 프롬프트 버전 로드
  useEffect(() => {
    const loadPromptVersion = async () => {
      if (!selectedProject?.currentPromptVersionId) {
        setCurrentPromptVersion(null);
        return;
      }

      const promptVersion = await db.promptVersions.get(selectedProject.currentPromptVersionId);
      setCurrentPromptVersion(promptVersion ?? null);
    };

    loadPromptVersion();
  }, [selectedProject?.currentPromptVersionId, setCurrentPromptVersion]);

  // 시스템 프롬프트 조합 (모든 레이어 결합)
  const getSystemPrompt = useCallback((): string => {
    if (!currentPromptVersion) return '';

    const { layers } = currentPromptVersion;
    const parts: string[] = [];

    if (layers.systemBase) parts.push(layers.systemBase);
    if (layers.persona) parts.push(`\n\n## Persona\n${layers.persona}`);
    if (layers.constraints) parts.push(`\n\n## Constraints\n${layers.constraints}`);
    if (layers.toolsPolicy) parts.push(`\n\n## Tools Policy\n${layers.toolsPolicy}`);

    return parts.join('');
  }, [currentPromptVersion]);

  // 프롬프트 레이어 업데이트 (새 버전 생성)
  const updatePromptLayers = useCallback(
    async (layers: Partial<PromptLayers>): Promise<PromptVersion | null> => {
      if (!selectedProject) return null;

      const currentVersion = currentPromptVersion?.version ?? 0;
      const newVersionId = createId.promptVersion();

      const newPromptVersion: PromptVersion = {
        id: newVersionId,
        projectId: selectedProject.id,
        version: currentVersion + 1,
        layers: {
          systemBase: layers.systemBase ?? currentPromptVersion?.layers.systemBase ?? '',
          persona: layers.persona ?? currentPromptVersion?.layers.persona,
          constraints: layers.constraints ?? currentPromptVersion?.layers.constraints,
          toolsPolicy: layers.toolsPolicy ?? currentPromptVersion?.layers.toolsPolicy,
        },
        createdAt: new Date(),
      };

      await db.transaction('rw', [db.promptVersions, db.projects], async () => {
        await db.promptVersions.add(newPromptVersion);
        await db.projects.update(selectedProject.id, {
          currentPromptVersionId: newVersionId,
          updatedAt: new Date(),
        });
      });

      setCurrentPromptVersion(newPromptVersion);
      return newPromptVersion;
    },
    [selectedProject, currentPromptVersion, setCurrentPromptVersion],
  );

  // 프롬프트 버전 히스토리 가져오기
  const getVersionHistory = useCallback(async (): Promise<PromptVersion[]> => {
    if (!selectedProject) return [];

    return db.promptVersions
      .where('projectId')
      .equals(selectedProject.id)
      .reverse()
      .sortBy('version');
  }, [selectedProject]);

  return {
    currentPromptVersion,
    getSystemPrompt,
    updatePromptLayers,
    getVersionHistory,
  };
}
