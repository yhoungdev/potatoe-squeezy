import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTipSol } from "@/hooks/useTipSol";
import { toast } from "sonner";

interface CelebrateUserProps {
  username: string;
  walletAddress: string;
}

function CelebrateUser({ username, walletAddress }: CelebrateUserProps) {
  const { publicKey } = useWallet();
  const [quantity, setQuantity] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [message, setMessage] = useState("");
  const predefinedAmount = [0.5, 1, 1.5, 2];

  const { sendTip, loading } = useTipSol({
    recipientAddress: walletAddress,
    recipientName: username,
  });

  const hasValidAmount =
    quantity > 0 ||
    (customAmount !== "" &&
      !isNaN(parseFloat(customAmount)) &&
      parseFloat(customAmount) > 0);

  const handleZap = async () => {
    try {
      const amountToSend = customAmount ? parseFloat(customAmount) : quantity;
      if (!amountToSend || amountToSend <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      const success = await sendTip(amountToSend);
      if (success) {
        toast.success("Successfully sent tip!");
        setQuantity(0);
        setCustomAmount("");
        setMessage("");

        const txnHash = success.explorerUrl;
        window.location.href = `/status/success?txnHash=${txnHash}`;
      }
    } catch (error) {
      toast.error("Failed to send tip");
      console.error(error);
    }
  };

  const handleAmountSelect = (selectedAmount: number) => {
    if (publicKey) {
      setQuantity(selectedAmount);
      setCustomAmount("");
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
                  ${isSelected ? "!bg-red-400" : ""}
                  ${!publicKey ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => handleAmountSelect(amount)}
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
          min="0"
          step="0.1"
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
        className={`w-full ${hasValidAmount && publicKey ? "bg-red-400 hover:bg-red-500" : "bg-gray-600"}`}
        onClick={() => handleZap()}
        disabled={!hasValidAmount || !publicKey || loading}
      >
        {loading ? "Processing..." : "Zap 🍟"}
      </Button>
    </div>
  );
}

export default CelebrateUser;
