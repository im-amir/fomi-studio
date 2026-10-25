import { GenerateWorkspace } from '@/components/generate/GenerateWorkspace';
import { getHistoryPage } from '@/lib/mock/history';

export const metadata = { title: 'Create' };

const HISTORY_PAGE_SIZE = 16;
// A returning user lands on their two most recent runs, as in the mockup.
const INITIAL_FEED_SIZE = 2;

export default function CreatePage() {
  // Read on the server so the first paint already has history — no loading flash.
  const initialHistory = getHistoryPage({ cursor: null, limit: HISTORY_PAGE_SIZE }) ?? {
    items: [],
    nextCursor: null,
  };
  return <GenerateWorkspace initialHistory={initialHistory} initialFeedSize={INITIAL_FEED_SIZE} />;
}
