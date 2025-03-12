import { Button } from "../ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import ConnectWalletButton from "@/button/connectWalletButton";

function AuthComponent() {
  const { publicKey, connect, disconnect } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleWalletAction = async () => {
    try {
      setIsLoading(true);
      if (publicKey) {
        await disconnect();
      } else {
        await connect();
      }
    } catch (error) {
      console.error("Wallet action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="text-center space-y-8 lg:max-w-xl w-full px-4">
        <div className="space-y-4">
          <span className="text-6xl block">🍟</span>
          <h1 className="text-4xl font-bold">Continue with Github</h1>
          <p className="text-gray-400 ">
            When life gives you potatoes, don't make chips—squeeze out Bitcoin
            instead! With PotatoSqueezy, get zapped for your awesome projects
            and make your birthdays even cooler!
          </p>
        </div>

        <div className="!my-4">
          <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
        </div>
      </div>
    </div>
  );
}

export default AuthComponent;
