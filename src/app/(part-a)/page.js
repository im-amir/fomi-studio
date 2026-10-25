import { GenerateWorkspace } from '@/components/generate/GenerateWorkspace';
import { getHistoryPage } from '@/lib/mock/history';

export const metadata = { title: 'Create' };

const HISTORY_PAGE_SIZE = 16;

export default function CreatePage() {
  // Read on the server so the first paint already has history — no loading flash.
  const initialHistory = getHistoryPage({ cursor: null, limit: HISTORY_PAGE_SIZE }) ?? {
    items: [],
    nextCursor: null,
  };
  return <GenerateWorkspace initialHistory={initialHistory} />;
}
