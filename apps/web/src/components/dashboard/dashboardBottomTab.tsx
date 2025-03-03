import React, { useState, useEffect } from "react";
import { DASHBOARDNAV } from "../../data/dashboardData.ts";

function DashboardBottomTab() {
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  return (
    <div
      className={`
            flex items-center justify-center gap-4 w-fit px-4
             rounded-full py-2 mx-auto 
             bg-gradient-to-r 
             from-[#2f8c3405] to-white/40
             fixed bottom-8 left-0 right-0
        `}
    >
      {DASHBOARDNAV.map((item) => {
        const isActive = currentPath === item.path;

        return (
          <a
            key={item.path}
            href={item.path}
            className={`flex items-center 
              cursor-pointer flex-col px-[2em]
              transition-all duration-200
              ${isActive ? "text-red-500 scale-110" : "text-white hover:text-red-300"}`}
          >
            <h1 className={"text-2xl"}>{item.icon}</h1>
            <p className={"text-sm "}>{item.title}</p>
          </a>
        );
      })}
    </div>
  );
}

export default DashboardBottomTab;
