import { ReactNode } from "react";
import WalletConnectProvider from "./walletConnectProvider";
import { QueryClient , QueryClientProvider } from "@tanstack/react-query"

const IndexProdivder = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient()
  return (
    <>
      <WalletConnectProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WalletConnectProvider>
    </>
  );
};
export default IndexProdivder;
