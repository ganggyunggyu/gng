'use client';

import { Sidebar } from '@/components/sidebar';
import { Chat } from '@/components/chat';

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <Chat />
    </div>
  );
}
