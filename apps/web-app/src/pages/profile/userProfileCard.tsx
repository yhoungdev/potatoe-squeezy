import { useState, useEffect } from "react";
import CelebrateUser from "./celebrateUser";
import { Skeleton } from "@/components/ui/skeleton";
import ProfilePanel from "@/components/profile/profilePanel";
import { useWallet } from "@solana/wallet-adapter-react";
import useExtractUserWallet from "@/hooks/extract-user-wallet";
import { useUserStore } from "@/store/user.store";

interface GitHubUser {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
}

function UserProfileCard() {
  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(window.location.search);
  const username = searchParams.get("user");

  const { wallet } = useExtractUserWallet(username || "");
  const { address } = wallet || {};
  const authUser = useUserStore((state) => state.authUser);
  const isOwnProfile =
    authUser?.username?.toLowerCase() === username?.toLowerCase();

  const { connected } = useWallet();

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

  return (
    <div className="  flex flex-col items-center gap-6 mt-8">
      <ProfilePanel
        name={userData.name || userData.login}
        username={userData.login}
        avatar={userData.avatar_url}
        userBio={userData.bio}
        withAction={false}
      />
      {!isOwnProfile ? (
        <CelebrateUser
          username={userData.login}
          walletAddress={address}
          isOwnProfile={isOwnProfile}
        />
      ) : (
        <div className="w-full rounded-xl border border-white/10 bg-gray-900 px-6 py-8 text-center text-gray-300 lg:w-[450px]">
          You are viewing your own profile. Zapping yourself is disabled.
        </div>
      )}
    </div>
  );
}

export default UserProfileCard;
