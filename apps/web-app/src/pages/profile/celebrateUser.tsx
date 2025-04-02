import { useState } from "react";
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
  walletAddress: string;
}

function CelebrateUser({ username, walletAddress }: CelebrateUserProps) {
  const { publicKey, sendTransaction } = useWallet();
  const [quantity, setQuantity] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const predefinedAmount = [5, 10, 15, 20];

  const handleZap = async () => {
    const amountToSend = customAmount ? parseFloat(customAmount) : quantity;

    if (!publicKey || !amountToSend || isNaN(amountToSend)) {
      toast.error("Please connect your wallet and select or enter an amount");
      return;
    }

    setLoading(true);
    try {
      const connection = new Connection(
        import.meta.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
          "https://api.devnet.solana.com",
        "confirmed",
      );

      // Replace with the recipient's address
      const recipientAddress = new PublicKey(walletAddress);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientAddress,
          lamports: amountToSend * LAMPORTS_PER_SOL,
        }),
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      toast.success(`Successfully tipped ${amountToSend} SOL to ${username}!`);
      setQuantity(0);
      setCustomAmount("");
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
        <h2 className="font-semibold text-center">
          Select or Enter Amount to Zap
        </h2>

        <div className="flex items-center gap-4 mx-4 my-4 justify-evenly">
          {predefinedAmount.map((amount) => {
            const isSelected = amount === quantity;
            return (
              <div
                key={amount}
                className={`bg-gray-600 cursor-pointer
                  rounded-xl w-10 h-10 
                  flex items-center justify-center
                  border-[1px] border-white/20 
                  ${isSelected && "!bg-red-400"}
                  ${!publicKey && "opacity-50 cursor-not-allowed"}`}
                onClick={() => {
                  if (publicKey) {
                    setQuantity(amount);
                    setCustomAmount("");
                  }
                }}
              >
                {amount}
              </div>
            );
          })}
        </div>
      </div>

      <div className="my-4">
        <input
          type="number"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            setQuantity(0);
          }}
          placeholder="Enter custom amount (SOL)"
          className="w-full p-2 text-sm bg-transparent border-2 border-white/20 rounded-xl"
          disabled={!publicKey}
        />
      </div>

      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hey, I just squashed potato to SOL, enjoy!"
          className="w-full p-2 text-sm bg-transparent border-2 border-white/20 rounded-xl"
          disabled={!publicKey}
        />
      </div>

      <Button
        className="w-full bg-red-400"
        onClick={handleZap}
        disabled={loading || !publicKey || (!quantity && !customAmount)}
      >
        {loading ? "Processing..." : "Zap"}
      </Button>

      {!publicKey && (
        <p className="mt-2 text-sm text-center text-gray-400">
          Connect your wallet to tip
        </p>
      )}
    </div>
  );
}

export default CelebrateUser;
