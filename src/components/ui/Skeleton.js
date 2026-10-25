import { cn } from '@/lib/format';
import styles from './Skeleton.module.css';

/**
 * Placeholder that holds the exact space of the content it stands in for,
 * so nothing shifts when the real thing arrives.
 * @param {{ className?: string, aspectRatio?: string, style?: React.CSSProperties }} props
 */
export function Skeleton({ className, aspectRatio, style }) {
  return (
    <div
      aria-hidden="true"
      className={cn(styles.skeleton, className)}
      style={aspectRatio ? { aspectRatio, ...style } : style}
    />
  );
}
