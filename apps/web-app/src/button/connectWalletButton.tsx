import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Wallet2 } from "lucide-react";
import { ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const ConnectWalletButton = ({ children }: { children: ReactNode }) => {
  
  const { connected } = useWallet();
  return (
    <WalletMultiButton
      style={{
        background: "linear-gradient(51deg, #ee4543 0%, #e58786 100%)",
        color: "#fff",
        padding: "1em 2em",
        borderRadius: "12px",
        fontSize: ".8rem",
        fontWeight: "bold",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.4em",
      }}
    >
      {
        !connected ? <><Wallet2 />  Connect Wallet</>: "Connected"
      }
    </WalletMultiButton>
  );
};

export default ConnectWalletButton;
