'use client';

import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { useAtomValue } from 'jotai';
import { voiceSessionStateAtom } from '../model';
import { cn } from '@/shared/lib/utils';

interface VoiceButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const VoiceButton = ({ onClick, disabled, className }: VoiceButtonProps) => {
  const sessionState = useAtomValue(voiceSessionStateAtom);
  const { isActive, isConnecting } = sessionState;

  const getIcon = () => {
    if (isConnecting) {
      return <Loader2 className="h-5 w-5 animate-spin" />;
    }
    if (isActive) {
      return <MicOff className="h-5 w-5" />;
    }
    return <Mic className="h-5 w-5" />;
  };

  const getTooltip = () => {
    if (isConnecting) return 'Connecting...';
    if (isActive) return 'End voice chat';
    return 'Start voice chat';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={disabled || isConnecting}
          className={cn(
            'h-9 w-9 transition-colors',
            isActive && 'text-red-500 hover:text-red-600 hover:bg-red-500/10',
            !isActive && 'text-muted-foreground hover:text-foreground',
            className,
          )}
        >
          {getIcon()}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{getTooltip()}</p>
      </TooltipContent>
    </Tooltip>
  );
};
