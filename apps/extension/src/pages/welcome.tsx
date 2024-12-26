import React from "react";
import Button from "../components/ui/button";

function Welcome() {
  return (
    <div
      className={`
            container flex flex-col items-center justify-center h-[100vh]
            bg-gradient-to-b  px-[2em]from-black to-orange-600/10
        `}
    >
      <div className={"mb-4"}>
        <h1 className={"text-6xl text-center animate-pulse"}>🥔</h1>
        <p className={"mt-2 text-center text-white"}>
          Your GitHub just got crispy. When life hands you potatoes, squeeze out
          Bitcoin instead! 🎉🥔.
        </p>
      </div>
      <Button className={"w-[90%] px-4 rounded-none"}>Get Started</Button>
    </div>
  );
}

export default Welcome;
