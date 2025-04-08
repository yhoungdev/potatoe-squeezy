import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { toast } from "sonner";

interface TipSolParams {
  recipientAddress: string;
  recipientName: string;
}

export function useTipSol({ recipientAddress, recipientName }: TipSolParams) {
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  const sendTip = async (amount: number) => {
    if (!publicKey || amount <= 0 || isNaN(amount)) {
      toast.error(
        "Please connect your wallet and select or enter a valid amount",
      );
      return false;
    }

    if (!recipientAddress) {
      toast.error("Invalid recipient address");
      return false;
    }

    setLoading(true);
    try {
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed",
      );

      const recipient = new PublicKey(recipientAddress);
      const lamports = Math.round(amount * LAMPORTS_PER_SOL);

      if (lamports <= 0) {
        throw new Error("Amount too small");
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports,
        }),
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

      return { success: true, transactionHash: signature, explorerUrl };
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to send tip");
      return { success: false, transactionHash: null, explorerUrl: null };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendTip,
    loading,
  };
}
