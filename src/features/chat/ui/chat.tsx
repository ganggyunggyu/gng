'use client';

import { ChatHeader } from './chat-header';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';

export function Chat() {
  return (
    <main className="flex h-full flex-1 flex-col overflow-hidden">
      <ChatHeader />
      <MessageList />
      <ChatInput />
    </main>
  );
}
