import { createFileRoute } from "@tanstack/react-router";
import Homepage from "@/components/pages/homepage";
import ProductHuntBadge from "@/components/misc/product-hunt-badge";

export const Route = createFileRoute("/")({
  component: IndexRoute,
});

function IndexRoute() {
  return (
    <>
      <Homepage />
      <ProductHuntBadge />
    </>
  );
}
