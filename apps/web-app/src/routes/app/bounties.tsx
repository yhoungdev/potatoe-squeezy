import { createFileRoute } from '@tanstack/react-router';
import BountyExplorerPage from '@/pages/bounties';

export const Route = createFileRoute('/app/bounties')({
  component: BountyExplorerPage,
});
