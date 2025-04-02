import { useState, useEffect } from "react";
import CelebrateUser from "./celebrateUser";
import { Skeleton } from "@/components/ui/skeleton";
import ProfilePanel from "@/components/profile/profilePanel";
import WalletNotConnected from "@/components/fallbacks/wallet-no-connect";
import { useWallet } from "@solana/wallet-adapter-react";

interface GitHubUser {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
}

function UserProfileCard() {
  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);

  const { wallet, connected } = useWallet();

  useEffect(() => {
    const fetchUserData = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const username = searchParams.get("user");

      if (!username) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.github.com/users/${username}`,
        );
        const data = await response.json();

        if (response.ok) {
          setUserData(data);
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center mt-8">
        <Skeleton className="w-[300px] h-[200px] rounded-xl" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="mt-8 text-center text-muted-foreground">
        User not found
      </div>
    );
  }

  if (!connected) {
    return <WalletNotConnected />;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 mt-8 lg:flex-row">
      <ProfilePanel
        name={userData.name || userData.login}
        username={userData.login}
        avatar={userData.avatar_url}
        userBio={userData.bio}
        withAction={false}
      />
      <CelebrateUser
        username={userData.login}
        walletAddress={"HNtw7sn2taK8mUzyV5Bt1yoPU4nPjxFUuHBnZZPNLivR"}
      />
    </div>
  );
}

export default UserProfileCard;
