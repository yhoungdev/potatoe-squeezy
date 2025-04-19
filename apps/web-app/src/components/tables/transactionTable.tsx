import React, { useEffect, useState } from "react";
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
import { NoDataFound } from "../fallbacks/noDataFound";
import TransactionService, { TransactionRecord } from "@/services/transaction.service";
import { format, formatDistanceToNow } from "date-fns";
import { useUserStore } from "@/store/user.store";

function WalletTransactionTable() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { wallet } = useUserStore();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const records = await TransactionService.getTransactionRecords();
        setTransactions(records);
        setError(null);
      } catch (err) {
        setError("Failed to load transactions");
        console.error("Error fetching transactions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getTransactionType = (tx: TransactionRecord) => {
    if (!wallet) return "Unknown";
    return tx.recipientAddress === wallet.address ? "Received" : "Sent";
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className="border-white/10 bg-black/20 backdrop-blur-xl">
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-gray-400 animate-pulse">Loading transactions...</div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className="border-white/10 bg-black/20 backdrop-blur-xl">
          <CardContent className="flex items-center justify-center h-48 text-red-400">
            {error}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="border-white/10 bg-black/20 backdrop-blur-xl">
        <CardHeader className="flex-row items-center justify-between pb-4 space-y-0">
          <h2 className="text-lg font-semibold text-white">
            Recent Transactions
          </h2>
          <Badge
            variant="secondary"
            className="text-purple-300 bg-purple-500/20 border-purple-500/30"
          >
            Last 24h
          </Badge>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <NoDataFound />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-gray-400">Type</TableHead>
                  <TableHead className="text-gray-400">Amount</TableHead>
                  <TableHead className="text-gray-400">From/To</TableHead>
                  <TableHead className="text-gray-400">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const type = getTransactionType(tx);
                  const displayAddress = type === "Received" ? tx.senderAddress : tx.recipientAddress;
                  return (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="transition-colors border-white/10 hover:bg-white/5"
                    >
                      <TableCell className="flex items-center gap-2 font-medium">
                        <span
                          className={`p-1.5 rounded-full ${
                            type === "Received"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-purple-500/20 text-purple-400"
                          }`}
                        >
                          {type === "Received" ? (
                            <ArrowDownRightIcon className="w-4 h-4" />
                          ) : (
                            <ArrowUpRightIcon className="w-4 h-4" />
                          )}
                        </span>
                        <span className="text-gray-300">{type}</span>
                      </TableCell>
                      <TableCell
                        className={`font-mono font-medium ${
                          type === "Received"
                            ? "text-green-400"
                            : "text-purple-400"
                        }`}
                      >
                        {type === "Received" ? "+" : "-"}
                        {tx.amount} SOL
                      </TableCell>
                      <TableCell className="font-mono text-gray-400">
                        {displayAddress.slice(0, 4)}...{displayAddress.slice(-4)}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        <div className="flex items-center gap-2" title={format(new Date(tx.createdAt), 'PPpp')}>
                          <ClockIcon className="w-4 h-4 text-gray-500" />
                          {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default WalletTransactionTable;
