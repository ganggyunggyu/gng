'use client';

import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { Check, ChevronDown } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
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
import { IMAGE_MODEL_CONFIG, MODELS_BY_PROVIDER } from '@/shared/providers';
import type { Provider } from '@/shared/types';

const PROVIDER_LABELS: Record<Provider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  xai: 'xAI',
  gemini: 'Gemini',
  deepseek: 'DeepSeek',
  solar: 'Solar',
};

export const ModelSelector = () => {
  const [open, setOpen] = useState(false);
  const selectedProject = useAtomValue(selectedProjectAtom);
  const { updateProject } = useProjects();

  if (!selectedProject) return null;

  const { provider: currentProvider, modelName: currentModel } = selectedProject.modelConfig;
  const isImageModel = Boolean(IMAGE_MODEL_CONFIG[currentModel]);

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
        <Button variant="outline" className={cn("h-8 gap-1.5 px-3 text-sm font-normal")}>
          <span className={cn("max-w-[140px] truncate")}>{currentModel}</span>
          {isImageModel && (
            <Badge variant="outline" className={cn("text-[10px] leading-3")}>
              이미지 생성
            </Badge>
          )}
          <ChevronDown className={cn("h-3.5 w-3.5 opacity-50")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("w-[200px]")}>
        {(Object.keys(MODELS_BY_PROVIDER) as Provider[]).map((provider, idx) => (
          <DropdownMenuGroup key={provider}>
            {idx > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className={cn("text-xs text-muted-foreground")}>
              {PROVIDER_LABELS[provider]}
            </DropdownMenuLabel>
            {MODELS_BY_PROVIDER[provider].map((model) => {
              const isSelected = currentProvider === provider && currentModel === model;
              const isModelImage = Boolean(IMAGE_MODEL_CONFIG[model]);
              return (
                <DropdownMenuItem
                  key={`${provider}:${model}`}
                  onClick={() => handleSelect(provider, model)}
                  className={cn('justify-between', isSelected && 'bg-accent')}
                >
                  <span className={cn("truncate")}>{model}</span>
                  <div className={cn('flex items-center gap-1')}>
                    {isModelImage && (
                      <Badge variant="outline" className={cn("text-[10px] leading-3")}>
                        이미지 생성
                      </Badge>
                    )}
                    {isSelected && <Check className={cn("h-4 w-4")} />}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
