'use client';

import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModelSelector } from './model-selector';
import { selectedProjectAtom } from '@/stores';
import { useProjects } from '@/lib/hooks';
import type { Provider } from '@/types';

interface ProjectSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectSettings({ open, onOpenChange }: ProjectSettingsProps) {
  const selectedProject = useAtomValue(selectedProjectAtom);
  const { updateProject } = useProjects();

  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [provider, setProvider] = useState<Provider>('openai');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [systemPrompt, setSystemPrompt] = useState('');

  useEffect(() => {
    if (selectedProject) {
      setName(selectedProject.name);
      setModel(selectedProject.modelConfig.modelName);
      setProvider(selectedProject.modelConfig.provider);
      setTemperature(selectedProject.modelConfig.temperature ?? 0.7);
      setMaxTokens(selectedProject.modelConfig.maxTokens ?? 4096);
    }
  }, [selectedProject]);

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

    onOpenChange(false);
  };

  if (!selectedProject) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="general" className="mt-4">
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
                <label className="text-sm font-medium">Max Tokens</label>
                <Input
                  type="number"
                  min={1}
                  max={128000}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prompt" className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">System Prompt</label>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are a helpful assistant..."
                className="min-h-[300px] font-mono text-sm"
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
}
