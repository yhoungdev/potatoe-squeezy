import React from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  ClockIcon,
} from "@/assets/svg.tsx";

function WalletTransactionTable() {
  const transactions = [
    {
      id: 1,
      type: "Received",
      amount: 2.5,
      from: "Anonymous",
      time: "2 hours ago",
      status: "completed",
    },
    {
      id: 2,
      type: "Sent",
      amount: 1.0,
      from: "Tip",
      time: "5 hours ago",
      status: "completed",
    },
    {
      id: 3,
      type: "Received",
      amount: 0.5,
      from: "Anonymous",
      time: "1 day ago",
      status: "completed",
    },
  ];

  return (
    <div>
      <div className="rounded-2xl bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Recent Transactions
        </h2>
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left text-zinc-400">Type</th>
                <th className="px-4 py-3 text-left text-zinc-400">Amount</th>
                <th className="px-4 py-3 text-left text-zinc-400">From</th>
                <th className="px-4 py-3 text-left text-zinc-400">Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-zinc-800 transition-colors hover:bg-zinc-900/50"
                >
                  <td className="flex items-center gap-2 px-4 py-3 font-medium text-white">
                    {tx.type === "Received" ? (
                      <ArrowDownRightIcon />
                    ) : (
                      <ArrowUpRightIcon />
                    )}
                    {tx.type}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-white">
                    {tx.type === "Received" ? "+" : "-"}
                    {tx.amount} SOL
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{tx.from}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    <div className="flex items-center gap-1">
                      <ClockIcon />
                      {tx.time}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default WalletTransactionTable;
