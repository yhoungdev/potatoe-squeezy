import { createFileRoute } from "@tanstack/react-router";
import Homepage from "@/components/pages/homepage";

export const Route = createFileRoute("/")({
  component: () => <Homepage />,
});
