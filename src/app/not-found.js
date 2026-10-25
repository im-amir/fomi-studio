import Link from 'next/link';

export const metadata = { title: 'Not found' };

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-sm text-center">
        <p className="text-sm font-medium text-accent-600">404</p>
        <h1 className="mt-2 font-display text-xl text-ink-900">This canvas is empty</h1>
        <p className="mt-2 text-base text-ink-600">
          The page you’re looking for doesn’t exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center rounded-control bg-accent-600 px-4 text-base font-medium text-on-accent focus-ring transition-colors duration-fast hover:bg-accent-700"
        >
          Back to Create
        </Link>
      </div>
    </main>
  );
}
