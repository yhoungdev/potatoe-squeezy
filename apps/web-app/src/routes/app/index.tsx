import IndexDashboardPage from "@/pages/main";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
  component: IndexDashboardPage,
});
