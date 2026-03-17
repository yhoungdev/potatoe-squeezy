import "./App.css";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { Analytics } from "@vercel/analytics/react";

if (typeof window !== "undefined") {
  try {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    if (token) {
      localStorage.setItem("bearer_token", token);
      url.searchParams.delete("token");
      window.history.replaceState(
        {},
        document.title,
        url.pathname + url.search + url.hash,
      );
    }
  } catch {}
}

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
function App() {
  return (
    <>
      <Analytics />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
