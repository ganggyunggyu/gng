'use client';

import { MessageSquare, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { cn } from '@/shared/lib';
import type { Thread } from '@/shared/types';

interface ThreadItemProps {
  thread: Thread;
  isSelected: boolean;
  isChecked: boolean;
  hasUnread: boolean;
  isEditMode: boolean;
  onSelect: (threadId: string) => void;
  onToggleSelection: (threadId: string) => void;
  onDelete: (threadId: string) => void;
}

export function ThreadItem({
  thread,
  isSelected,
  isChecked,
  hasUnread,
  isEditMode,
  onSelect,
  onToggleSelection,
  onDelete,
}: ThreadItemProps) {
  const { id, title } = thread;

  return (
    <div
      className={cn(
        'group/thread flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-sidebar-accent',
        isSelected && !isEditMode && 'bg-sidebar-accent',
        isEditMode && isChecked && 'bg-destructive/10',
      )}
    >
      {isEditMode ? (
        <div
          onClick={() => onToggleSelection(id)}
          className={cn('flex flex-1 min-w-0 cursor-pointer items-center gap-2 text-sm')}
        >
          <Checkbox
            checked={isChecked}
            className={cn('h-3.5 w-3.5')}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={() => onToggleSelection(id)}
          />
          <span className={cn('min-w-0 line-clamp-1')}>{title}</span>
        </div>
      ) : (
        <>
          <button
            onClick={() => onSelect(id)}
            className={cn('flex flex-1 min-w-0 items-center gap-2 text-sm')}
          >
            <MessageSquare className={cn('h-3.5 w-3.5 shrink-0')} />
            <span className={cn('min-w-0 line-clamp-1')}>{title}</span>
          </button>
          <div className={cn('flex items-center gap-1')}>
            {hasUnread && (
              <span className={cn('h-4 w-1 rounded-full bg-blue-500')} aria-hidden="true" />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-5 w-5 opacity-0 group-hover/thread:opacity-100')}
                >
                  <MoreHorizontal className={cn('h-3 w-3')} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className={cn('text-destructive')}
                  onClick={() => onDelete(id)}
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
}
