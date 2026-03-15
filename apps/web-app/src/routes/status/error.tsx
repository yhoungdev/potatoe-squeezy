import AuthErrorPage from "@/pages/status/error-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/status/error")({
  component: AuthErrorPage,
});
