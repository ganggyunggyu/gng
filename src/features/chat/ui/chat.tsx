'use client';

import { cn } from '@/shared/lib';
import { ChatHeader } from '@/features/chat/ui/chat-header';
import { MessageList } from '@/features/chat/ui/message-list';
import { ChatInput } from '@/features/chat/ui/chat-input';

export const Chat = () => {
  return (
    <main className={cn('flex h-full flex-1 flex-col overflow-hidden')}>
      <ChatHeader />
      <MessageList />
      <ChatInput />
    </main>
  );
};
