'use client';

import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { cn } from '@/shared/lib';
import { selectedProjectAtom, useProjects } from '@/entities/project';
import { MODELS_BY_PROVIDER } from '@/shared/api';
import type { Provider } from '@/shared/types';

const PROVIDER_LABELS: Record<Provider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  xai: 'xAI',
  gemini: 'Gemini',
  deepseek: 'DeepSeek',
  solar: 'Solar',
};

export function ModelSelector() {
  const [open, setOpen] = useState(false);
  const selectedProject = useAtomValue(selectedProjectAtom);
  const { updateProject } = useProjects();

  if (!selectedProject) return null;

  const { provider: currentProvider, modelName: currentModel } = selectedProject.modelConfig;

  const handleSelect = async (provider: Provider, modelName: string) => {
    await updateProject(selectedProject.id, {
      modelConfig: {
        ...selectedProject.modelConfig,
        provider,
        modelName,
      },
    });
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 gap-1.5 px-3 text-sm font-normal">
          <span className="max-w-[140px] truncate">{currentModel}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {(Object.keys(MODELS_BY_PROVIDER) as Provider[]).map((provider, idx) => (
          <DropdownMenuGroup key={provider}>
            {idx > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {PROVIDER_LABELS[provider]}
            </DropdownMenuLabel>
            {MODELS_BY_PROVIDER[provider].map((model) => {
              const isSelected = currentProvider === provider && currentModel === model;
              return (
                <DropdownMenuItem
                  key={`${provider}:${model}`}
                  onClick={() => handleSelect(provider, model)}
                  className={cn('justify-between', isSelected && 'bg-accent')}
                >
                  <span className="truncate">{model}</span>
                  {isSelected && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
