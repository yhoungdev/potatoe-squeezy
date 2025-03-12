import React from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  ClockIcon,
} from "@/assets/svg.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="border-white/10 bg-black/20 backdrop-blur-xl">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <h2 className="text-lg font-semibold text-white">
            Recent Transactions
          </h2>
          <Badge
            variant="secondary"
            className="bg-purple-500/20 text-purple-300 border-purple-500/30"
          >
            Last 24h
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Amount</TableHead>
                <TableHead className="text-gray-400">From</TableHead>
                <TableHead className="text-gray-400">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-white/10 transition-colors hover:bg-white/5"
                >
                  <TableCell className="flex items-center gap-2 font-medium">
                    <span
                      className={`p-1.5 rounded-full ${
                        tx.type === "Received"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}
                    >
                      {tx.type === "Received" ? (
                        <ArrowDownRightIcon className="w-4 h-4" />
                      ) : (
                        <ArrowUpRightIcon className="w-4 h-4" />
                      )}
                    </span>
                    <span className="text-gray-300">{tx.type}</span>
                  </TableCell>
                  <TableCell
                    className={`font-mono font-medium ${
                      tx.type === "Received"
                        ? "text-green-400"
                        : "text-purple-400"
                    }`}
                  >
                    {tx.type === "Received" ? "+" : "-"}
                    {tx.amount} SOL
                  </TableCell>
                  <TableCell className="text-gray-400">{tx.from}</TableCell>
                  <TableCell className="text-gray-400">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-gray-500" />
                      {tx.time}
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default WalletTransactionTable;
