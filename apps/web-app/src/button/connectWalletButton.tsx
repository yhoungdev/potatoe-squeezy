import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ReactNode } from "react";


const ConnectWalletButton = ({
    children,
  }: {
    children: ReactNode;
  }) => {
    return (
      <WalletMultiButton
        style={{
          backgroundColor: "",
         
          padding: "1em",
        }}
      >
        {children}
      </WalletMultiButton>
    );
  };
  
  export default ConnectWalletButton;