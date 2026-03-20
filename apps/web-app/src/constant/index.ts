import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
export const TAB_STATE = `cursor-pointer !rounded-none
                      data-[state=active]:bg-transparent
                      data-[state=active]:border-b-2
                     data-[state=active]:text-red-400`;

export const RPC_KEY = import.meta.env.VITE_RPC_KEY;
export const SOLANA_NETWORK = import.meta.env.PROD
  ? WalletAdapterNetwork.Mainnet
  : WalletAdapterNetwork.Testnet;
const RPC_ENDPOINT = `https://mainnet.helius-rpc.com/?api-key=${RPC_KEY}`;
export const RPC_URL =
  import.meta.env.PROD
    ? RPC_ENDPOINT
    : "https://api.devnet.solana.com";
export const SOLANA_EXPLORER_CLUSTER = import.meta.env.PROD
  ? "mainnet-beta"
  : "testnet";
