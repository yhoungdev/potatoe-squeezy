import { createFileRoute } from '@tanstack/react-router';
import DeveloperProfilePage from '@/pages/developer/profile';

export const Route = createFileRoute('/app/dev/$username')({
  component: RouteComponent,
});

function RouteComponent() {
  const { username } = Route.useParams();
  return <DeveloperProfilePage username={username} />;
}
