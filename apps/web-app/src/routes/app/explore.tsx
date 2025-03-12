import ExploreUsers from "@/pages/explore/ExploreUsers";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/explore")({
  component: ExploreUsers,
});
