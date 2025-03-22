import { createFileRoute } from "@tanstack/react-router";
import Homepage from "@/components/pages/homepage";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { useProfile } from "@/hooks/useProfile";

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

  return <Homepage />;
}
