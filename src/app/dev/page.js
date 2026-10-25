import { notFound } from 'next/navigation';
import { getHistoryPage } from '@/lib/mock/history';
import { ApiPlayground } from './_showcase/ApiPlayground';
import { PrimitivesShowcase } from './_showcase/PrimitivesShowcase';

export const metadata = { title: 'Foundation', robots: { index: false } };

/** Development-only reference of the design system and mock API; 404s in production. */
export default function DevPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const initialHistory = getHistoryPage({ cursor: null, limit: 6 });
  if (!initialHistory) notFound();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-12">
      <header>
        <p className="text-sm font-medium text-accent-600">Phase 1 · Foundation</p>
        <h1 className="mt-1 font-display text-2xl text-ink-900">Design system & mock API</h1>
      </header>
      <PrimitivesShowcase />
      <ApiPlayground initialHistory={initialHistory} />
    </main>
  );
}
