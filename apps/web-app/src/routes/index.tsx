import { createFileRoute } from "@tanstack/react-router";
import Homepage from "@/components/pages/homepage";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { useProfile } from "@/hooks/useProfile";
import ProductHuntBadge from "@/components/misc/product-hunt-badge";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: search.token as string | undefined,
    };
  },
  component: IndexRoute,
});

function IndexRoute() {
  const { token } = Route.useSearch();
  useProfile();

  useEffect(() => {
    if (token) {
      Cookies.set("auth-token", token, {
        secure: true,
        sameSite: "lax",
        expires: 7,
      });
    }
  }, [token]);

  return (
    <>
      <Homepage />
      <ProductHuntBadge />
      <div className={'flex items-center justify-center'}>
        <a href="https://startupfa.me/s/potatoe?utm_source=www.potatoesqueezy.xyz" target="_blank"><img src="https://startupfa.me/badges/featured-badge.webp" alt="Featured on Startup Fame" width="171" height="54" /></a>
      </div>
    </>
  );
}
