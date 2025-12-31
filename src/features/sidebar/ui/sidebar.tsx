'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Plus,
  Settings,
  MessageSquare,
  FolderOpen,
  FolderClosed,
  Search,
  PanelLeftClose,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  Pencil,
  X,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { ScrollArea } from '@/shared/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { cn } from '@/shared/lib';
import { db } from '@/shared/db';
import { selectedProjectIdAtom, useProjects } from '@/entities/project';
import {
  selectedThreadIdAtom,
  threadReadAtAtom,
  setThreadReadAtAtom,
  useThreads,
} from '@/entities/thread';
import { sidebarOpenAtom, settingsDialogOpenAtom } from '@/features/sidebar/model';
import { ProjectSettings } from '@/features/settings';
import { NewProjectDialog } from '@/features/sidebar/ui/new-project-dialog';
import { DeleteConfirmDialog } from '@/features/sidebar/ui/delete-confirm-dialog';

export const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
  const [selectedProjectId, setSelectedProjectId] = useAtom(selectedProjectIdAtom);
  const [selectedThreadId, setSelectedThreadId] = useAtom(selectedThreadIdAtom);
  const threadReadAtById = useAtomValue(threadReadAtAtom);
  const setThreadReadAt = useSetAtom(setThreadReadAtAtom);

  const { projects, deleteProject } = useProjects();
  const { threads, createThread, deleteThread, deleteThreads } = useThreads();

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedThreadIds, setSelectedThreadIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useAtom(settingsDialogOpenAtom);
  const [searchQuery, setSearchQuery] = useState('');

  // 전체 스레드 검색 (제목 + 메시지 내용)
  const allThreads = useLiveQuery(
    async () => {
      if (!searchQuery.trim()) return [];
      const query = searchQuery.toLowerCase();

      // 제목 검색
      const titleMatches = await db.threads.filter((thread) =>
        thread.title.toLowerCase().includes(query),
      ).toArray();

      // 메시지 내용 검색
      const messageMatches = await db.messages.filter((msg) =>
        msg.content.toLowerCase().includes(query),
      ).toArray();

      // 메시지가 매칭된 스레드 ID 수집
      const messageThreadIds = new Set(messageMatches.map((m) => m.threadId));

      // 제목 매칭된 스레드 ID
      const titleThreadIds = new Set(titleMatches.map((t) => t.id));

      // 메시지에서만 매칭된 스레드 추가 로드
      const additionalThreadIds = [...messageThreadIds].filter((id) => !titleThreadIds.has(id));
      const additionalThreads = additionalThreadIds.length > 0
        ? await db.threads.where('id').anyOf(additionalThreadIds).toArray()
        : [];

      return [...titleMatches, ...additionalThreads];
    },
    [searchQuery],
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !allThreads?.length) return null;
    const grouped = new Map<string, typeof allThreads>();
    for (const thread of allThreads) {
      const projectThreads = grouped.get(thread.projectId) ?? [];
      projectThreads.push(thread);
      grouped.set(thread.projectId, projectThreads);
    }
    return grouped;
  }, [searchQuery, allThreads]);

  const isSearchMode = searchQuery.trim().length > 0;

  const filteredProjects = projects.filter((p) => {
    if (!isSearchMode) return true;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchResults?.has(p.id);
  });

  const handleCreateThread = async () => {
    await createThread();
  };

  useEffect(() => {
    if (threads.length === 0) return;

    threads.forEach((thread) => {
      const { id, updatedAt } = thread;
      if (threadReadAtById[id] !== undefined) return;
      const readAt = new Date(updatedAt).getTime();
      setThreadReadAt({ threadId: id, readAt });
    });
  }, [threads, threadReadAtById, setThreadReadAt]);

  useEffect(() => {
    if (!selectedThreadId) return;
    const selected = threads.find((thread) => thread.id === selectedThreadId);
    if (!selected) return;
    const updatedAt = new Date(selected.updatedAt).getTime();
    const lastReadAt = threadReadAtById[selectedThreadId];
    if (lastReadAt !== undefined && updatedAt <= lastReadAt) return;
    setThreadReadAt({ threadId: selectedThreadId, readAt: updatedAt });
  }, [selectedThreadId, threads, threadReadAtById, setThreadReadAt]);

  const handleSelectThread = (threadId: string) => {
    const selected = threads.find((thread) => thread.id === threadId);
    if (selected) {
      const updatedAt = new Date(selected.updatedAt).getTime();
      const lastReadAt = threadReadAtById[threadId];
      if (lastReadAt === undefined || updatedAt > lastReadAt) {
        setThreadReadAt({ threadId, readAt: updatedAt });
      }
    }
    setSelectedThreadId(threadId);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const toggleThreadSelection = (threadId: string) => {
    setSelectedThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(threadId)) {
        next.delete(threadId);
      } else {
        next.add(threadId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedThreadIds.size === threads.length) {
      setSelectedThreadIds(new Set());
    } else {
      setSelectedThreadIds(new Set(threads.map((t) => t.id)));
    }
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setSelectedThreadIds(new Set());
  };

  const handleDeleteSelected = async () => {
    await deleteThreads(Array.from(selectedThreadIds));
    exitEditMode();
  };

  return (
    <React.Fragment>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className={cn("fixed inset-0 z-40 bg-black/50 md:hidden")}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          'h-full bg-sidebar transition-all duration-300 ease-in-out overflow-hidden',
          // Mobile: fixed overlay
          'fixed inset-y-0 left-0 z-50 md:relative md:z-auto',
          // Width & visibility
          sidebarOpen ? 'w-72 border-r' : 'w-0 border-r-0',
        )}
      >
        <div className={cn('flex h-full w-72 flex-col')}>
          <div className={cn('flex h-14 items-center justify-between border-b px-4')}>
            <h1 className={cn('text-xl font-bold font-(family-name:--font-space-grotesk)')}>
              Gng
            </h1>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <PanelLeftClose className={cn('h-4 w-4')} />
            </Button>
          </div>

          <div className={cn('flex flex-col gap-2 p-4')}>
            <div className={cn('flex items-center justify-between')}>
              <span className={cn('text-sm font-medium text-muted-foreground')}>Projects</span>
              <NewProjectDialog />
            </div>
            <div className={cn('relative')}>
              <Search
                className={cn(
                  'absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground',
                )}
              />
              <Input
                placeholder="Search projects & chats..."
                className={cn('h-8 pl-7 text-sm')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className={cn('flex-1 px-2')}>
            <div className={cn('space-y-1 pb-4')}>
              {filteredProjects.length === 0 ? (
                <p className={cn('px-2 py-4 text-center text-sm text-muted-foreground')}>
                  {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
                </p>
              ) : (
                filteredProjects.map((project) => {
                  const isSelected = selectedProjectId === project.id;
                  const isExpanded = isSelected || (isSearchMode && searchResults?.has(project.id));
                  const displayThreads = isSearchMode && searchResults?.has(project.id)
                    ? searchResults.get(project.id) ?? []
                    : threads;
                  return (
                    <div key={project.id} className={cn('space-y-0.5')}>
                      <div
                        className={cn(
                          'group/project flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-sidebar-accent',
                          isSelected && 'bg-sidebar-accent',
                        )}
                      >
                        <button
                          onClick={() => setSelectedProjectId(isSelected ? null : project.id)}
                          className={cn(
                            'flex flex-1 min-w-0 items-center gap-2 text-sm font-medium',
                          )}
                        >
                          <ChevronRight
                            className={cn(
                              'h-3 w-3 text-muted-foreground transition-transform duration-200',
                              isSelected && 'rotate-90',
                            )}
                          />
                          {isSelected ? (
                            <FolderOpen className={cn('h-4 w-4 text-primary')} />
                          ) : (
                            <FolderClosed className={cn('h-4 w-4')} />
                          )}
                          <span className={cn('truncate')}>{project.name}</span>
                        </button>
                        <div className={cn('flex shrink-0 items-center gap-1')}>
                          {isSelected && !isEditMode && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn('h-6 w-6')}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateThread();
                                }}
                              >
                                <Plus className={cn('h-3 w-3')} />
                              </Button>
                              {threads.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn('h-6 w-6')}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditMode(true);
                                  }}
                                >
                                  <Pencil className={cn('h-3 w-3')} />
                                </Button>
                              )}
                            </>
                          )}
                          {isSelected && isEditMode && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn('h-6 w-6')}
                              onClick={(e) => {
                                e.stopPropagation();
                                exitEditMode();
                              }}
                            >
                              <X className={cn('h-3 w-3')} />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  'h-6 w-6 opacity-0 group-hover/project:opacity-100',
                                )}
                              >
                                <MoreHorizontal className={cn('h-3 w-3')} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {isSelected && (
                                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                                  <Settings className={cn('mr-2 h-4 w-4')} />
                                  Settings
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className={cn('text-destructive')}
                                onClick={() => deleteProject(project.id)}
                              >
                                <Trash2 className={cn('mr-2 h-4 w-4')} />
                                Delete Project
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div
                        className={cn(
                          'overflow-hidden transition-all duration-200 ease-in-out',
                          isExpanded ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0',
                        )}
                      >
                        <div className={cn('ml-4 space-y-0.5 border-l border-border pl-2 max-h-[55vh] overflow-y-auto scrollbar-hide')}>
                          {displayThreads.length === 0 ? (
                            <p className={cn('py-2 text-xs text-muted-foreground')}>
                              No chats yet
                            </p>
                          ) : (
                            displayThreads.map((thread) => {
                              const { id, title, updatedAt } = thread;
                              const isThreadSelected = selectedThreadId === id;
                              const isChecked = selectedThreadIds.has(id);
                              const lastReadAt = threadReadAtById[id];
                              const updatedAtMs = new Date(updatedAt).getTime();
                              const hasUnread =
                                !isThreadSelected &&
                                lastReadAt !== undefined &&
                                updatedAtMs > lastReadAt;

                              return (
                                <div
                                  key={id}
                                  className={cn(
                                    'group/thread flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent',
                                    isThreadSelected && !isEditMode && 'bg-sidebar-accent',
                                    isEditMode && isChecked && 'bg-destructive/10',
                                  )}
                                >
                                  {isEditMode ? (
                                    <div
                                      onClick={() => toggleThreadSelection(id)}
                                      className={cn(
                                        'flex flex-1 min-w-0 cursor-pointer items-center gap-2 text-sm',
                                      )}
                                    >
                                      <Checkbox
                                        checked={isChecked}
                                        className={cn('h-3.5 w-3.5')}
                                        onClick={(e) => e.stopPropagation()}
                                        onCheckedChange={() => toggleThreadSelection(id)}
                                      />
                                      <span className={cn('min-w-0 line-clamp-1')}>{title}</span>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleSelectThread(id)}
                                        className={cn(
                                          'flex flex-1 min-w-0 items-center gap-2 text-sm',
                                        )}
                                      >
                                        <MessageSquare className={cn('h-3.5 w-3.5 shrink-0')} />
                                        <span className={cn('min-w-0 line-clamp-1')}>{title}</span>
                                      </button>
                                      <div className={cn('flex items-center gap-1')}>
                                        {hasUnread && (
                                          <span
                                            className={cn('h-4 w-1 rounded-full bg-blue-500')}
                                            aria-hidden="true"
                                          />
                                        )}
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className={cn(
                                                'h-5 w-5 opacity-0 group-hover/thread:opacity-100',
                                              )}
                                            >
                                              <MoreHorizontal className={cn('h-3 w-3')} />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                              className={cn('text-destructive')}
                                              onClick={() => deleteThread(id)}
                                            >
                                              <Trash2 className={cn('mr-2 h-4 w-4')} />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <ProjectSettings open={settingsOpen} onOpenChange={setSettingsOpen} />

          {isEditMode && threads.length > 0 && (
            <div className={cn('border-t p-3')}>
              <div className={cn('flex items-center justify-between gap-2')}>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn('flex-1')}
                  onClick={toggleSelectAll}
                >
                  {selectedThreadIds.size === threads.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className={cn('flex-1')}
                  disabled={selectedThreadIds.size === 0}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className={cn('mr-1 h-3 w-3')} />
                  Delete ({selectedThreadIds.size})
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>

    <DeleteConfirmDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      count={selectedThreadIds.size}
      onConfirm={handleDeleteSelected}
    />
    </React.Fragment>
  );
};
