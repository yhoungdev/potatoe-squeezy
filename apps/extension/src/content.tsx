import React from "react";
import ReactDOM from "react-dom/client";
const ID = ".user-profile-bio";

if (document.location.hostname === "github.com") {
  const formElement = document.querySelector(ID);
  if (formElement) {
    const App = () => {
      return (
        <button
          style={{
            padding: "5px 16px",
            margin: "0.5rem",
            backgroundColor: "#212830",
            color: "#F0F6FC",
            borderRadius: "10px",
            width: "97%",
            cursor: "pointer",
            border: ".5px solid #80808054",
          }}
        >
          🍟 Zap User ⚡
        </button>
      );
    };

    const container = document.createElement("div");
    formElement.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(<App />);
  } else {
    console.error(`Element with ID "${ID}" not found.`);
  }
}
