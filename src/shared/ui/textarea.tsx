import * as React from 'react';
import { useState, useCallback, forwardRef } from 'react';
import { cn } from '@/shared/lib';

interface TextareaProps extends React.ComponentProps<'textarea'> {
  onEnterSubmit?: () => void;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onEnterSubmit, onKeyDown, ...props }, ref) => {
    const [isComposing, setIsComposing] = useState(false);

    const handleCompositionStart = useCallback(() => {
      setIsComposing(true);
    }, []);

    const handleCompositionEnd = useCallback(() => {
      setIsComposing(false);
    }, []);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (isComposing) return;

        if (e.key === 'Enter' && !e.shiftKey && onEnterSubmit) {
          e.preventDefault();
          onEnterSubmit();
          return;
        }

        onKeyDown?.(e);
      },
      [isComposing, onEnterSubmit, onKeyDown],
    );

    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea };
