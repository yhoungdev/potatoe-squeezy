import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import IndexProdivder from "./providers/indexProvider.tsx";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IndexProdivder>
      <App />
      <Toaster richColors position="top-center" />
    </IndexProdivder>
  </StrictMode>,
);
