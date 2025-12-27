'use client';

import { useMemo } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { ChevronDown, Sparkles, Zap, Brain, Bot, Atom, Sun } from 'lucide-react';
import { Model, MODELS_BY_PROVIDER, getProviderFromModel } from '@/shared/providers';
import type { Provider } from '@/shared/types';

interface ModelSelectorProps {
  value: string;
  onChange: (model: string, provider: Provider) => void;
  disabled?: boolean;
}

const PROVIDER_INFO: Record<Provider, { label: string; icon: typeof Sparkles; color: string }> = {
  openai: { label: 'OpenAI', icon: Sparkles, color: 'bg-green-500' },
  anthropic: { label: 'Anthropic', icon: Brain, color: 'bg-orange-500' },
  gemini: { label: 'Google', icon: Atom, color: 'bg-blue-500' },
  xai: { label: 'xAI', icon: Zap, color: 'bg-gray-500' },
  deepseek: { label: 'DeepSeek', icon: Bot, color: 'bg-indigo-500' },
  solar: { label: 'Upstage', icon: Sun, color: 'bg-yellow-500' },
};

const MODEL_DISPLAY_NAMES: Record<string, string> = {
  [Model.GPT4O]: 'GPT-4o',
  [Model.GPT4O_MINI]: 'GPT-4o Mini',
  [Model.GPT4_TURBO]: 'GPT-4 Turbo',
  [Model.CLAUDE_SONNET_4_5]: 'Claude Sonnet 4.5',
  [Model.CLAUDE_OPUS_4_5]: 'Claude Opus 4.5',
  [Model.CLAUDE_SONNET_3_5]: 'Claude Sonnet 3.5',
  [Model.CLAUDE_HAIKU_3_5]: 'Claude Haiku 3.5',
  [Model.CLAUDE_OPUS_3]: 'Claude Opus 3',
  [Model.GEMINI_3_PRO]: 'Gemini 3 Pro',
  [Model.GEMINI_3_FLASH]: 'Gemini 3 Flash',
  [Model.GROK_4]: 'Grok-4',
  [Model.GROK_4_FAST]: 'Grok-4 Fast',
  [Model.GROK_4_RES]: 'Grok-4 Reasoning',
  [Model.GROK_4_NON_RES]: 'Grok-4 Non-Reasoning',
  [Model.GROK_4_1_RES]: 'Grok-4.1 Reasoning',
  [Model.GROK_4_1_NON_RES]: 'Grok-4.1 Non-Reasoning',
  [Model.GROK_CODE]: 'Grok Code',
  [Model.GROK_IMAGE]: 'Grok Image',
  [Model.DEEPSEEK_CHAT]: 'DeepSeek Chat',
  [Model.DEEPSEEK_RES]: 'DeepSeek Reasoner',
  [Model.SOLAR_PRO]: 'Solar Pro',
  [Model.SOLAR_PRO2]: 'Solar Pro 2',
};

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const currentProvider = useMemo(() => {
    try {
      return getProviderFromModel(value);
    } catch {
      return 'openai';
    }
  }, [value]);

  const providerInfo = PROVIDER_INFO[currentProvider];
  const displayName = MODEL_DISPLAY_NAMES[value] || value;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between" disabled={disabled}>
          <div className="flex items-center gap-2">
            <providerInfo.icon className="h-4 w-4" />
            <span>{displayName}</span>
            <Badge variant="secondary" className="text-xs">
              {providerInfo.label}
            </Badge>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 max-h-96 overflow-y-auto" align="start">
        {(Object.entries(MODELS_BY_PROVIDER) as [Provider, string[]][]).map(
          ([provider, models], idx) => {
            const info = PROVIDER_INFO[provider];
            const Icon = info.icon;
            return (
              <DropdownMenuGroup key={provider}>
                {idx > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${info.color}`} />
                  {info.label}
                </DropdownMenuLabel>
                {models.map((model) => (
                  <DropdownMenuItem
                    key={model}
                    onClick={() => onChange(model, provider)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{MODEL_DISPLAY_NAMES[model] || model}</span>
                    {model === value && (
                      <Badge variant="default" className="ml-auto text-xs">
                        Selected
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            );
          },
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
