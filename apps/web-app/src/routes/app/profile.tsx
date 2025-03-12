import DefaultDashboard from "@/layouts/dashboard";
import UserProfileCard from "@/pages/profile/userProfileCard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DefaultDashboard>
      <UserProfileCard />
    </DefaultDashboard>
  );
}
