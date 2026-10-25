'use client';

import { Button } from '@/components/ui/Button';

/** @param {{ error: Error & { digest?: string }, reset: () => void }} props */
export default function RouteError({ reset }) {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div role="alert" className="max-w-sm text-center">
        <h1 className="font-display text-xl text-ink-900">Something broke on our side</h1>
        <p className="mt-2 text-base text-ink-600">
          Your work is safe. Try loading the page again.
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
