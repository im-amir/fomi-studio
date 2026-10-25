import { StudioWorkspace } from '@/components/studio/StudioWorkspace';
import { getStudioProject } from '@/lib/mock/studio-project';

export const metadata = { title: 'Studio — Autumn Campaign' };

export default function StudioPage() {
  return <StudioWorkspace project={getStudioProject()} />;
}
