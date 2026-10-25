import { cn } from '@/lib/format';

/** @param {{ children: React.ReactNode, className?: string }} props */
export function Kbd({ children, className }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-current/20 px-1 font-sans text-2xs font-medium opacity-80',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
