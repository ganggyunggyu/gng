'use client';

import { useEffect } from 'react';
import { Mic, MicOff, PhoneOff, Hand, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { useVoiceSession, useVoiceControls } from '../lib';
import { VoiceVisualizer } from './voice-visualizer';
import { cn } from '@/shared/lib/utils';
import type { VoiceProvider } from '@/shared/types';

export const VoiceModal = () => {
  const {
    isVoiceMode,
    sessionState,
    transcripts,
    closeVoiceMode,
    connectToRoom,
    disconnectFromRoom,
    room,
  } = useVoiceSession();

  const {
    voiceProvider,
    isMuted,
    isAISpeaking,
    toggleMute,
    interruptAI,
    switchProvider,
  } = useVoiceControls({ room });

  const { isActive, isConnecting } = sessionState;

  // Auto-connect when modal opens (optional - can remove if you want manual connect)
  useEffect(() => {
    if (isVoiceMode && !isActive && !isConnecting) {
      // Don't auto-connect, let user click Start
    }
  }, [isVoiceMode, isActive, isConnecting]);

  const handleClose = async () => {
    if (isActive) {
      await disconnectFromRoom();
    }
    closeVoiceMode();
  };

  const handleProviderChange = (value: string) => {
    switchProvider(value as VoiceProvider);
  };

  return (
    <Dialog open={isVoiceMode} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice Chat
            </DialogTitle>

            <Select
              value={voiceProvider}
              onValueChange={handleProviderChange}
              disabled={isActive}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grok">
                  <div className="flex items-center gap-2">
                    <span>Grok Voice</span>
                    <span className="text-xs text-muted-foreground">$0.05/min</span>
                  </div>
                </SelectItem>
                <SelectItem value="gemini">
                  <div className="flex items-center gap-2">
                    <span>Gemini Live</span>
                    <span className="text-xs text-muted-foreground">~$0.02/min</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isActive && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">Connected</span>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Visualizer */}
          <div className="flex-shrink-0 py-8">
            <VoiceVisualizer />
          </div>

          {/* Transcripts */}
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-3 pb-4">
              {transcripts.map((transcript) => (
                <div
                  key={transcript.id}
                  className={cn(
                    'p-3 rounded-lg text-sm',
                    transcript.role === 'user'
                      ? 'bg-primary/10 ml-8'
                      : 'bg-muted mr-8',
                    !transcript.isFinal && 'opacity-60',
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {transcript.role === 'user' ? 'You' : 'AI'}
                    </span>
                    {!transcript.isFinal && (
                      <span className="text-xs text-muted-foreground">(speaking...)</span>
                    )}
                  </div>
                  <p>{transcript.transcript}</p>
                </div>
              ))}

              {transcripts.length === 0 && isActive && (
                <p className="text-center text-muted-foreground text-sm py-8">
                  Start speaking to begin the conversation...
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Controls */}
        <div className="p-6 border-t bg-muted/30">
          <div className="flex items-center justify-center gap-4">
            {!isActive ? (
              <Button
                onClick={connectToRoom}
                disabled={isConnecting}
                size="lg"
                className="gap-2"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    Start Voice Chat
                  </>
                )}
              </Button>
            ) : (
              <>
                {/* Mute Button */}
                <Button
                  variant={isMuted ? 'destructive' : 'secondary'}
                  size="lg"
                  onClick={toggleMute}
                  className="gap-2"
                >
                  {isMuted ? (
                    <>
                      <MicOff className="h-5 w-5" />
                      Unmute
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5" />
                      Mute
                    </>
                  )}
                </Button>

                {/* Interrupt Button */}
                {isAISpeaking && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={interruptAI}
                    className="gap-2"
                  >
                    <Hand className="h-5 w-5" />
                    Interrupt
                  </Button>
                )}

                {/* End Call Button */}
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={disconnectFromRoom}
                  className="gap-2"
                >
                  <PhoneOff className="h-5 w-5" />
                  End
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
