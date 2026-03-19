import { useState, useEffect } from "react";
import { UserService } from "@/services";

type WalletRow = {
  id: number;
  userId: number;
  chain: string;
  address: string;
  createdAt: string;
  updatedAt: string;
} | null;

const useExtractUserWallet = (userName: string) => {
  const [wallet, setWallet] = useState<WalletRow>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserWallet = async () => {
      try {
        const users = await UserService.fetchAllPotatoeUsers();
        const user = users?.find((data: any) => {
          const userData = data?.users;

          return userData?.username === userName;
        });
        setWallet(user?.wallets ?? user?.addresses ?? null);
      } catch (err) {
        setError("Failed to fetch user wallet");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserWallet();
  }, [userName]);

  return { wallet, isLoading, error };
};

export default useExtractUserWallet;
