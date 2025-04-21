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
import {RPC_URL} from "@/constant";

interface TipSolParams {
  recipientAddress: string;
  recipientName: string;
}

const FEE_PERCENTAGE = 0.005;
const FEE_WALLET = new PublicKey(
  "FFenFaL1e88RLGiG1AgSPuHDBGDPj4rqvtCNb6xrEwtY",
);

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

    const feeAmount = amount * FEE_PERCENTAGE;
    const recipientAmount = amount - feeAmount;
    toast.info(
      `A 0.5% platform fee (${feeAmount.toFixed(4)} SOL) will be deducted. Recipient will receive ${recipientAmount.toFixed(4)} SOL.`,
      { duration: 5000 },
    );

    setLoading(true);
    try {
      const connection = new Connection(
        RPC_URL,
        "confirmed",
      );

      const recipient = new PublicKey(recipientAddress);
      const recipientLamports = Math.round(recipientAmount * LAMPORTS_PER_SOL);
      const feeLamports = Math.round(feeAmount * LAMPORTS_PER_SOL);

      if (recipientLamports <= 0) {
        throw new Error("Amount too small");
      }

      const transaction = new Transaction();

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports: recipientLamports,
        }),
      );

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: FEE_WALLET,
          lamports: feeLamports,
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
