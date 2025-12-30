'use client';

import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { ModelSelector } from './model-selector';
import { selectedProjectAtom, useProjects } from '@/entities/project';
import { usePromptVersion } from '@/entities/prompt-version';
import type { Provider } from '@/shared/types';

interface ProjectSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectSettings = ({ open, onOpenChange }: ProjectSettingsProps) => {
  const selectedProject = useAtomValue(selectedProjectAtom);
  const { updateProject } = useProjects();
  const { currentPromptVersion, updatePromptLayers } = usePromptVersion();

  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [provider, setProvider] = useState<Provider>('openai');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState<number | undefined>(undefined);
  const [systemPrompt, setSystemPrompt] = useState('');

  useEffect(() => {
    if (selectedProject) {
      setName(selectedProject.name);
      setModel(selectedProject.modelConfig.modelName);
      setProvider(selectedProject.modelConfig.provider);
      setTemperature(selectedProject.modelConfig.temperature ?? 0.7);
      setMaxTokens(selectedProject.modelConfig.maxTokens);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (currentPromptVersion) {
      setSystemPrompt(currentPromptVersion.layers.systemBase || '');
    }
  }, [currentPromptVersion]);

  const handleModelChange = (newModel: string, newProvider: Provider) => {
    setModel(newModel);
    setProvider(newProvider);
  };

  const handleSave = async () => {
    if (!selectedProject) return;

    await updateProject(selectedProject.id, {
      name,
      modelConfig: {
        provider,
        modelName: model,
        temperature,
        maxTokens,
      },
    });

    // systemPrompt가 변경되었으면 새 버전 생성
    const currentSystemBase = currentPromptVersion?.layers.systemBase || '';
    if (systemPrompt !== currentSystemBase) {
      await updatePromptLayers({ systemBase: systemPrompt });
    }

    onOpenChange(false);
  };

  if (!selectedProject) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="general" className="mt-4 flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="prompt">System Prompt</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <ModelSelector value={model} onChange={handleModelChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Temperature</label>
                <Input
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Tokens (비우면 무제한)</label>
                <Input
                  type="number"
                  min={1}
                  max={128000}
                  value={maxTokens ?? ''}
                  placeholder="Unlimited"
                  onChange={(e) => setMaxTokens(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prompt" className="space-y-4 pt-4 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <label className="text-sm font-medium">System Prompt</label>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are a helpful assistant..."
                className="min-h-[300px] max-h-[50vh] font-mono text-sm"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
