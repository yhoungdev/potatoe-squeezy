import "rpc-websockets/dist/lib/client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { toast } from "react-hot-toast";

interface CelebrateUserProps {
  username: string;
}

function CelebrateUser({ username }: CelebrateUserProps) {
  const { publicKey, sendTransaction } = useWallet();
  const [quantity, setQuantity] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const predefinedAmount = [5, 10, 15, 20];

  const handleZap = async () => {
    if (!publicKey || !quantity) {
      toast.error("Please connect your wallet and select an amount");
      return;
    }

    setLoading(true);
    try {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
          "https://api.devnet.solana.com",
        "confirmed",
      );

      //i would get receivers address and add here
      const recipientAddress = new PublicKey("");

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientAddress,
          lamports: quantity * LAMPORTS_PER_SOL,
        }),
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      toast.success(`Successfully tipped ${quantity} SOL to ${username}!`);
      setQuantity(0);
      setMessage("");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to send tip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 w-full lg:w-[450px] rounded-xl px-4 py-4">
      <div className="py-4">
        <h2 className="text-center font-semibold">Select amount to zap</h2>

        <div className="flex mx-4 items-center gap-4 my-4 justify-evenly">
          {predefinedAmount.map((amount) => {
            const isSelected = amount === quantity;
            return (
              <div
                key={amount}
                className={`bg-gray-600 cursor-pointer
                  rounded-xl w-10 h-10 
                  flex items-center justify-center
                  border-[1px] border-white/20 
                  ${isSelected && "!bg-[#fb8a2e]"}
                  ${!publicKey && "opacity-50 cursor-not-allowed"}`}
                onClick={() => publicKey && setQuantity(amount)}
              >
                {amount}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hey i just squashed potatoe to sol, enjoy"
          className="w-full p-2 text-sm bg-transparent border-2 border-white/20 rounded-xl"
          disabled={!publicKey}
        />
      </div>

      <Button
        className="w-full "
        onClick={handleZap}
        disabled={loading || !publicKey || !quantity}
      >
        {loading ? "Processing..." : "Zap"}
      </Button>

      {!publicKey && (
        <p className="text-center text-sm text-gray-400 mt-2">
          Connect your wallet to tip
        </p>
      )}
    </div>
  );
}

export default CelebrateUser;
