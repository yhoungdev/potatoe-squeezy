import React from "react";
import Button from "../button";
import { motion } from "framer-motion";

function WalletProfilePanel() {
  return (
    <div
      className={
        "flex flex-col lg:flex-row-reverse" +
        " gap-2  items-center justify-center"
      }
    >
      <div
        className={`w-full bg-gradient-to-r
       from-[#0b1551]
        via-[#0b1551]
        to-[#00000026] border-4 border-white/30
         rounded-xl p-4`}
      >
        <h2 className={"my-1 font-semibold"}> Balance</h2>
        <div>
          <h1 className={"text-2xl font-bold text-white"}> 4 Sols</h1>
        </div>
      </div>
      <div className="w-full max-w-md  rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center"></div>
            <h1 className="text-xl font-semibold">Hi, Obiabo 👋</h1>
          </div>
          <button className="text-gray-500 hover:text-gray-700 transition-colors"></button>
        </div>

        <div className="bg-amber-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-amber-700">
              Total Visitors
            </span>
          </div>
          <div className="text-4xl font-bold text-amber-800">4</div>
        </div>
      </div>
    </div>
  );
}

export default WalletProfilePanel;
