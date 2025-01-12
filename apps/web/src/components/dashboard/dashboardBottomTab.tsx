import React from "react";
import { DASHBOARDNAV } from "../../data/dashboardData.ts";
import GithubUsersCard from "../misc/github_users_card.tsx";

function DashboardBottomTab() {
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
        return (
          <div className={`flex items-center 
          cursor-pointer flex-col  px-[2em]`}>
              <h1 className={'text-2xl'}>{item.icon}</h1>
              <p className={"text-sm "}>{item.title}</p>
          </div>
        );
      })}
    </div>
  );GithubUsersCard
}

export default DashboardBottomTab;
