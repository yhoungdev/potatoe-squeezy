import { useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { useState } from "react";
import { toast } from "sonner";

export function useSolanaTip() {
  const { publicKey, sendTransaction } = useWallet();
  const [isSending, setIsSending] = useState(false);

  const sendTip = async (recipientWalletAddress: string) => {
    if (!publicKey || !recipientWalletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setIsSending(true);
      const recipientAddress = new PublicKey(recipientWalletAddress);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientAddress,
          lamports: 0.1 * LAMPORTS_PER_SOL,
        }),
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      toast.success("Tip sent successfully! 🎉");
    } catch (error) {
      console.error("Error sending tip:", error);
      toast.error("Failed to send tip");
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendTip,
    isSending,
    isWalletConnected: !!publicKey,
  };
}
