import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import IndexProdivder from "./providers/indexProvider.tsx";
import { RouterProvider, createRouter } from "@tanstack/react-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IndexProdivder>
      <App />
    </IndexProdivder>
  </StrictMode>,
);
