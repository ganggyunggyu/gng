'use client';

import { Sidebar, Chat } from '@/features';

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <Chat />
    </div>
  );
}
