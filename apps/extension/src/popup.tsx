import React from "react";
import ReactDOM from "react-dom/client";
import Welcome from "./pages/welcome";
import SignIn from "./pages";

ReactDOM.createRoot(document.body).render(
  <React.StrictMode>
    {/*<Welcome />*/}
    <SignIn />
  </React.StrictMode>
);
