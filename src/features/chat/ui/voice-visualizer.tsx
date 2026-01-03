'use client';

import { useAtomValue } from 'jotai';
import { voiceSessionStateAtom } from '../model';
import { cn } from '@/shared/lib/utils';

interface VoiceVisualizerProps {
  className?: string;
}

export const VoiceVisualizer = ({ className }: VoiceVisualizerProps) => {
  const { isSpeaking, isAISpeaking, isActive } = useAtomValue(voiceSessionStateAtom);

  if (!isActive) {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
        <div className="w-32 h-32 rounded-full bg-muted/50 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <span className="text-4xl">🎤</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">Press Start to begin voice chat</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-6', className)}>
      {/* AI Speaking Indicator */}
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            'w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300',
            isAISpeaking
              ? 'bg-gradient-to-br from-purple-500/30 to-blue-500/30 animate-pulse'
              : 'bg-muted/30',
          )}
        >
          <div
            className={cn(
              'w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300',
              isAISpeaking
                ? 'bg-gradient-to-br from-purple-500/50 to-blue-500/50'
                : 'bg-muted/50',
            )}
          >
            <div
              className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300',
                isAISpeaking
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500'
                  : 'bg-muted',
              )}
            >
              <span className="text-3xl">{isAISpeaking ? '🤖' : '💬'}</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {isAISpeaking ? 'AI is speaking...' : 'AI is listening'}
        </p>
      </div>

      {/* User Speaking Indicator */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-1.5 rounded-full transition-all duration-150',
                isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30',
              )}
              style={{
                height: isSpeaking ? `${Math.random() * 20 + 10}px` : '8px',
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-2">
          {isSpeaking ? 'You are speaking' : 'Listening...'}
        </span>
      </div>
    </div>
  );
};
