import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster, toast } from "sonner";
import TipGithubUser from "./components/Views/tipGithubUser";

const ID = ".user-profile-bio";

console.log("Potatoe squeezed communicating successfully with Github");
if (document.location.hostname === "github.com") {
  const formElement = document.querySelector(ID);
  if (formElement) {
    const App = () => {
      return <TipGithubUser />;
    };

    const container = document.createElement("div");
    formElement.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(
      <>
        <App />
        <Toaster position="top-center" expand={true} richColors={true} />
      </>,
    );
  } else {
    console.error(`Element with ID "${ID}" not found.`);
  }
}
