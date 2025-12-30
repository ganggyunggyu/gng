'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib';

interface EditModeFooterProps {
  totalCount: number;
  selectedCount: number;
  onToggleSelectAll: () => void;
  onDeleteClick: () => void;
}

export function EditModeFooter({
  totalCount,
  selectedCount,
  onToggleSelectAll,
  onDeleteClick,
}: EditModeFooterProps) {
  if (totalCount === 0) return null;

  return (
    <div className={cn('border-t p-3')}>
      <div className={cn('flex items-center justify-between gap-2')}>
        <Button
          variant="outline"
          size="sm"
          className={cn('flex-1')}
          onClick={onToggleSelectAll}
        >
          {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className={cn('flex-1')}
          disabled={selectedCount === 0}
          onClick={onDeleteClick}
        >
          <Trash2 className={cn('mr-1 h-3 w-3')} />
          Delete ({selectedCount})
        </Button>
      </div>
    </div>
  );
}
