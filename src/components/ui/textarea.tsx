import * as React from 'react';
import { cn } from '@/lib/utils/cn';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[100px] w-full rounded-lg border border-ink-300 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:border-bronze-400 focus:outline-none focus:ring-2 focus:ring-bronze-100 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export { Textarea };
