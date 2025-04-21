import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTipSol } from "@/hooks/useTipSol";
import { toast } from "sonner";
import TransactionService from "@/services/transaction.service";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface CelebrateUserProps {
  username: string;
  walletAddress: string;
}

const MIN_AMOUNT = 0.000001;
const MAX_AMOUNT = 1000;

function CelebrateUser({ username, walletAddress }: CelebrateUserProps) {
  const { publicKey, connected } = useWallet();
  const [quantity, setQuantity] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const predefinedAmount = useMemo(() => [0.5, 1, 1.5, 2], []);

  const { sendTip, loading } = useTipSol({
    recipientAddress: walletAddress,
    recipientName: username,
  });

  const hasValidAmount = useMemo(() => {
    const amount = customAmount ? parseFloat(customAmount) : quantity;
    return amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
  }, [quantity, customAmount]);

  const validateAmount = useCallback((amount: number): string | null => {
    if (amount <= 0) return "Amount must be greater than 0";
    if (amount < MIN_AMOUNT) return `Minimum amount is ${MIN_AMOUNT} SOL`;
    if (amount > MAX_AMOUNT) return `Maximum amount is ${MAX_AMOUNT} SOL`;
    return null;
  }, []);

  const handleZap = async () => {
    try {
      if (!connected) {
        toast.error("Please connect your wallet first");
        return;
      }

      const amountToSend = customAmount ? parseFloat(customAmount) : quantity;
      const validationError = validateAmount(amountToSend);

      if (validationError) {
        toast.error(validationError);
        return;
      }

      setIsProcessing(true);

      const success = await sendTip(amountToSend);

      if (success?.explorerUrl) {
        try {
          await TransactionService.createTransactionRecord({
            amount: amountToSend,
            senderAddress: publicKey?.toString() || "",
            senderId: null,
            recipientAddress: walletAddress,
            recipientId: null,
            txHash: success.explorerUrl,
            note: message || null,
          });

          setQuantity(0);
          setCustomAmount("");
          setMessage("");

          window.location.href = `/status/success?txnHash=${encodeURIComponent(
            success.explorerUrl,
          )}`;
        } catch (error) {
          console.error("Failed to create transaction record:", error);
          toast.error("Transaction sent but failed to save record");
        }
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send tip",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAmountSelect = useCallback(
    (selectedAmount: number) => {
      if (connected) {
        setQuantity(selectedAmount);
        setCustomAmount("");
      }
    },
    [connected],
  );

  const handleCustomAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (
        value === "" ||
        (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= MAX_AMOUNT)
      ) {
        setCustomAmount(value);
        setQuantity(0);
      }
    },
    [],
  );

  return (
    <div className="bg-gray-900 w-full lg:w-[450px] rounded-xl px-4 py-4">
      <div className="py-4">
        <h2 className="font-semibold text-center">
          Select or Enter Amount to Zap
        </h2>

        <div className="flex items-center gap-4 mx-4 my-4 justify-evenly">
          {predefinedAmount.map((amount) => (
            <button
              key={amount}
              className={`
                bg-gray-600 rounded-xl w-10 h-10 
                flex items-center justify-center
                border-[1px] border-white/20 
                transition-all duration-200
                ${amount === quantity ? "!bg-red-400 scale-105" : ""}
                ${!connected ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-500"}
              `}
              onClick={() => handleAmountSelect(amount)}
              disabled={!connected}
            >
              {amount}
            </button>
          ))}
        </div>
      </div>

      <div className="my-4">
        <input
          type="number"
          value={customAmount}
          onChange={handleCustomAmountChange}
          min={MIN_AMOUNT}
          max={MAX_AMOUNT}
          step="0.000001"
          placeholder={`Enter custom amount (${MIN_AMOUNT}-${MAX_AMOUNT} SOL)`}
          className="w-full p-2 text-sm bg-transparent border-2 border-white/20 rounded-xl
                    focus:border-red-400 outline-none transition-colors duration-200"
          disabled={!connected}
        />
      </div>

      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hey, I just squashed potato to SOL, enjoy!"
          maxLength={200}
          className="w-full p-2 text-sm bg-transparent border-2 border-white/20 rounded-xl
                    focus:border-red-400 outline-none transition-colors duration-200
                    resize-none h-24"
          disabled={!connected}
        />
      </div>

      <Button
        className={`
          w-full transition-all duration-200
          ${hasValidAmount && connected ? "bg-red-400 hover:bg-red-500" : "bg-gray-600"}
        `}
        onClick={handleZap}
        disabled={!hasValidAmount || !connected || loading || isProcessing}
      >
        {isProcessing || loading ? (
          <span className="flex items-center gap-2">
            Processing... <span className="animate-spin">⚡</span>
          </span>
        ) : (
          "Zap 🍟"
        )}
      </Button>

      {!connected && (
        <p className="text-sm text-center mt-2 text-gray-400">
          Connect your wallet to send tips
        </p>
      )}
    </div>
  );
}

export default CelebrateUser;
