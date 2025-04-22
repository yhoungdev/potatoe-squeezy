import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export const useWalletConnection = () => {
  const { setVisible } = useWalletModal();
  const { connected, connecting } = useWallet();

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const connectWallet = async () => {
    if (isMobile) {
      const isSolanaAvailable =
        !!(window as any).solana || !!(window as any).solflare;

      if (!isSolanaAvailable) {
        const universalLink = `https://solana.com/portal`;
        window.location.href = universalLink;
        return;
      }
    }

    setVisible(true);
  };

  return {
    connectWallet,
    connected,
    connecting,
  };
};
