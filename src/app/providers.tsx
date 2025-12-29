'use client';

import { Provider as JotaiProvider } from 'jotai';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { KeyboardShortcuts } from './keyboard-shortcuts';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <JotaiProvider>
      <TooltipProvider delayDuration={300}>
        <KeyboardShortcuts />
        {children}
      </TooltipProvider>
    </JotaiProvider>
  );
}
