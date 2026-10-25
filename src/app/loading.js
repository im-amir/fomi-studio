import { Spinner } from '@/components/ui/Spinner';

export default function Loading() {
  return (
    <div role="status" className="grid min-h-dvh place-items-center text-accent-600">
      <Spinner size={20} />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
