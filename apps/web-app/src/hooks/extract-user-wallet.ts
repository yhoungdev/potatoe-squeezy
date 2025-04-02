import { useState, useEffect } from "react";
import { UserService } from "@/services";

const useExtractUserWallet = (userName: string) => {
  const [wallet, setWallet] = useState<string | null>(null);
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
        setWallet(user?.wallets || null);
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
