import { ReactNode } from "react";
import WalletConnectProvider from "./walletConnectProvider";

const IndexProdivder =({children}: {children: ReactNode}) => {
    return <>
        <WalletConnectProvider>
            {children}
        </WalletConnectProvider>
    </>
}
export default IndexProdivder;