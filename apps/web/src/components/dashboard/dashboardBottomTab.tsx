import React from "react";
import { DASHBOARDNAV } from "../../data/dashboardData.ts";

function DashboardBottomTab() {
  return (
    <div
      className={`
            flex items-center justify-center gap-4 w-full xl:w-fit px-4
             rounded-full py-4 mx-auto 
             bg-gradient-to-r 
             from-gray-600 to-[#2f8c3405]
             fixed bottom-8 left-0 right-0
        `}
    >
      {DASHBOARDNAV.map((item) => {
        return (
          <div className={`flex items-center cursor-pointer flex-col gap-4`}>
            <p className={"text-sm "}>{item.title}</p>
          </div>
        );
      })}
    </div>
  );
}

export default DashboardBottomTab;
