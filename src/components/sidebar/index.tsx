'use client';

import { useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import {
  Plus,
  Settings,
  MessageSquare,
  FolderOpen,
  Search,
  PanelLeftClose,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  selectedProjectIdAtom,
  selectedThreadIdAtom,
  sidebarOpenAtom,
  selectedProjectAtom,
} from '@/stores';
import { useProjects, useThreads } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { ModelSelector } from '@/components/settings/model-selector';
import { ProjectSettings } from '@/components/settings/project-settings';
import { Model } from '@/lib/providers';
import type { Provider } from '@/types';

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
  const [selectedProjectId, setSelectedProjectId] = useAtom(selectedProjectIdAtom);
  const [selectedThreadId, setSelectedThreadId] = useAtom(selectedThreadIdAtom);
  const selectedProject = useAtomValue(selectedProjectAtom);

  const { projects, createProject, deleteProject } = useProjects();
  const { threads, createThread, deleteThread } = useThreads();

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectModel, setNewProjectModel] = useState<string>(Model.GPT4O_API);
  const [newProjectProvider, setNewProjectProvider] = useState<Provider>('openai');
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
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
    setNewProjectModel(Model.GPT4O_API);
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
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b px-4">
        <h1 className="text-xl font-bold">Gng</h1>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      {/* Projects Section */}
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
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
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

      {/* Project List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1">
          {filteredProjects.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
            </p>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className={cn(
                  'group flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-sidebar-accent',
                  selectedProjectId === project.id && 'bg-sidebar-accent',
                )}
              >
                <button
                  onClick={() => setSelectedProjectId(project.id)}
                  className="flex flex-1 items-center gap-2 text-sm"
                >
                  <FolderOpen className="h-4 w-4" />
                  <span className="truncate">{project.name}</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
            ))
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* Threads Section (when project is selected) */}
      {selectedProject && (
        <>
          <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {selectedProject.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCreateThread}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1">
              {threads.length === 0 ? (
                <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No chats yet
                </p>
              ) : (
                threads.map((thread) => (
                  <div
                    key={thread.id}
                    className={cn(
                      'group flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-sidebar-accent',
                      selectedThreadId === thread.id && 'bg-sidebar-accent',
                    )}
                  >
                    <button
                      onClick={() => setSelectedThreadId(thread.id)}
                      className="flex flex-1 items-center gap-2 text-sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="truncate">{thread.title}</span>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
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
          </ScrollArea>

          <Separator />

          {/* Project Settings */}
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-4 w-4" />
              <span>Project Settings</span>
            </Button>
          </div>

          <ProjectSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
        </>
      )}
      </div>
    </aside>
  );
}
