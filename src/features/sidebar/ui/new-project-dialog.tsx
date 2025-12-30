'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Model } from '@/shared/providers';
import type { Provider } from '@/shared/types';
import { useProjects } from '@/entities/project';
import { projectDialogOpenAtom } from '@/features/sidebar/model';
import { ModelSelector } from '@/features/settings';

export const NewProjectDialog = () => {
  const [projectDialogOpen, setProjectDialogOpen] = useAtom(projectDialogOpenAtom);
  const { createProject } = useProjects();

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectModel, setNewProjectModel] = useState<string>(Model.GPT4O);
  const [newProjectProvider, setNewProjectProvider] = useState<Provider>('openai');

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await createProject(newProjectName.trim(), {
      provider: newProjectProvider,
      modelName: newProjectModel,
    });
    setNewProjectName('');
    setNewProjectModel(Model.GPT4O);
    setNewProjectProvider('openai');
    setProjectDialogOpen(false);
  };

  const handleModelChange = (model: string, provider: Provider) => {
    setNewProjectModel(model);
    setNewProjectProvider(provider);
  };

  return (
    <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('h-6 w-6')}>
          <Plus className={cn('h-3 w-3')} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>
        <div className={cn('flex flex-col gap-4 pt-4')}>
          <div className={cn('space-y-2')}>
            <label className={cn('text-sm font-medium')}>Project Name</label>
            <Input
              placeholder="My awesome project"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateProject();
                }
              }}
            />
          </div>
          <div className={cn('space-y-2')}>
            <label className={cn('text-sm font-medium')}>Model</label>
            <ModelSelector value={newProjectModel} onChange={handleModelChange} />
          </div>
          <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
            Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
