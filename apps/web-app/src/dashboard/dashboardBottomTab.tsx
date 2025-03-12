import { useState, useEffect } from "react";
import { DASHBOARDNAV } from "@/data/dashboardData.ts";
import { Link, useRouter } from "@tanstack/react-router";

function DashboardBottomTab() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  return (
    <nav className="fixed w-[180px] bottom-3 left-1/2 -translate-x-1/2 z-50">
      <div
        className="flex items-center justify-between gap-2 px-4  bg-black/40 backdrop-blur-xl 
        border border-white/10 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      >
        {DASHBOARDNAV.map((item) => {
          const isActive = currentPath === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center min-w-[64px] p-2
                rounded-xl transition-all duration-300 ease-out
                hover:bg-white/5
                ${
                  isActive
                    ? "bg-primary   text-red-400 border border-primary/20"
                    : "text-muted-foreground hover:text-primary"
                }
              `}
            >
              <span className={`text-xl mb-1 ${isActive ? "scale-110" : ""}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium tracking-wide">
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default DashboardBottomTab;
