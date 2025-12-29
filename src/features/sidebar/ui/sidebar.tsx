'use client';

import { useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
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
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Separator } from '@/shared/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { cn, formatShortcut } from '@/shared/lib';
import { Model } from '@/shared/providers';
import type { Provider } from '@/shared/types';
import {
  selectedProjectIdAtom,
  selectedProjectAtom,
  useProjects,
} from '@/entities/project';
import { selectedThreadIdAtom, useThreads } from '@/entities/thread';
import { sidebarOpenAtom, projectDialogOpenAtom, settingsDialogOpenAtom } from '../model';
import { ModelSelector, ProjectSettings } from '@/features/settings';

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
  const [selectedProjectId, setSelectedProjectId] = useAtom(selectedProjectIdAtom);
  const [selectedThreadId, setSelectedThreadId] = useAtom(selectedThreadIdAtom);
  const selectedProject = useAtomValue(selectedProjectAtom);

  const { projects, createProject, deleteProject } = useProjects();
  const { threads, createThread, deleteThread } = useThreads();

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectModel, setNewProjectModel] = useState<string>(Model.GPT4O);
  const [newProjectProvider, setNewProjectProvider] = useState<Provider>('openai');
  const [projectDialogOpen, setProjectDialogOpen] = useAtom(projectDialogOpenAtom);
  const [settingsOpen, setSettingsOpen] = useAtom(settingsDialogOpenAtom);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await createProject(newProjectName.trim(), {
      provider: newProjectProvider,
      modelName: newProjectModel,
    });
    setNewProjectName('');
    setNewProjectModel(Model.GPT4O);
    setNewProjectProvider('openai');
    setProjectDialogOpen(false);
  };

  const handleModelChange = (model: string, provider: Provider) => {
    setNewProjectModel(model);
    setNewProjectProvider(provider);
  };

  const handleCreateThread = async () => {
    await createThread();
  };

  return (
    <aside
      className={cn(
        'h-full border-r bg-sidebar transition-all duration-300 ease-in-out overflow-hidden',
        sidebarOpen ? 'w-72' : 'w-0 border-r-0',
      )}
    >
      <div className="flex h-full w-72 flex-col">
        <div className="flex h-14 items-center justify-between border-b px-4">
        <h1 className="text-xl font-bold font-(family-name:--font-space-grotesk)">Gng</h1>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Projects</span>
          <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Project</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Name</label>
                  <Input
                    placeholder="My awesome project"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.nativeEvent.isComposing) return;
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateProject();
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model</label>
                  <ModelSelector
                    value={newProjectModel}
                    onChange={handleModelChange}
                  />
                </div>
                <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="h-8 pl-7 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {filteredProjects.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
            </p>
          ) : (
            filteredProjects.map((project) => {
              const isSelected = selectedProjectId === project.id;
              return (
                <div key={project.id} className="space-y-0.5">
                  {/* Project Item */}
                  <div
                    className={cn(
                      'group/project flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-sidebar-accent',
                      isSelected && 'bg-sidebar-accent',
                    )}
                  >
                    <button
                      onClick={() => setSelectedProjectId(isSelected ? null : project.id)}
                      className="flex flex-1 min-w-0 items-center gap-2 text-sm font-medium"
                    >
                      <ChevronRight
                        className={cn(
                          'h-3 w-3 text-muted-foreground transition-transform duration-200',
                          isSelected && 'rotate-90',
                        )}
                      />
                      {isSelected ? (
                        <FolderOpen className="h-4 w-4 text-primary" />
                      ) : (
                        <FolderClosed className="h-4 w-4" />
                      )}
                      <span className="truncate">{project.name}</span>
                    </button>
                    <div className="flex shrink-0 items-center gap-1">
                      {isSelected && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateThread();
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover/project:opacity-100"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isSelected && (
                            <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteProject(project.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Threads (Accordion Content) */}
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-200 ease-in-out',
                      isSelected ? 'max-h-125 opacity-100' : 'max-h-0 opacity-0',
                    )}
                  >
                    <div className="ml-4 space-y-0.5 border-l border-border pl-2">
                      {threads.length === 0 ? (
                        <p className="py-2 text-xs text-muted-foreground">
                          No chats yet
                        </p>
                      ) : (
                        threads.map((thread) => (
                          <div
                            key={thread.id}
                            className={cn(
                              'group/thread flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent',
                              selectedThreadId === thread.id && 'bg-sidebar-accent',
                            )}
                          >
                            <button
                              onClick={() => setSelectedThreadId(thread.id)}
                              className="flex flex-1 min-w-0 items-center gap-2 text-sm"
                            >
                              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                              <span className="min-w-0 line-clamp-1">{thread.title}</span>
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 opacity-0 group-hover/thread:opacity-100"
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => deleteThread(thread.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))
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
      </div>
    </aside>
  );
}
