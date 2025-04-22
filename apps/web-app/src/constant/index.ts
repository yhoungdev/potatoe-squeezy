export const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
export const TAB_STATE = `cursor-pointer !rounded-none
                      data-[state=active]:bg-transparent
                      data-[state=active]:border-b-2
                     data-[state=active]:text-red-400`;

export const RPC_KEY = import.meta.env.VITE_RPC_KEY;
const RPC_ENDPOINT = `https://mainnet.helius-rpc.com/?api-key=${RPC_KEY}`;
export const RPC_URL =
  import.meta.env.MODE === "development"
    ? "https://api.devnet.solana.com"
    : RPC_ENDPOINT;
