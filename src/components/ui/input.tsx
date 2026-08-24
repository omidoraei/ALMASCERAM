import * as React from 'react';
import { cn } from '@/lib/utils/cn';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-lg border border-ink-300 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:border-bronze-400 focus:outline-none focus:ring-2 focus:ring-bronze-100 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
