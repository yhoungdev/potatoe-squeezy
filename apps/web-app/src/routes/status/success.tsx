import SuccessPage from "@/pages/status/success-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/status/success")({
  component: SuccessPage,
});
