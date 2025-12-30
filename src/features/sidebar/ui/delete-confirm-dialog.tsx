'use client';

import { cn } from '@/shared/lib';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  onConfirm: () => void;
}

export const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  count,
  onConfirm,
}: DeleteConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Selected Chats</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {count} selected chat
            {count > 1 ? 's' : ''}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn('bg-destructive text-destructive-foreground hover:bg-destructive/90')}
            onClick={onConfirm}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
