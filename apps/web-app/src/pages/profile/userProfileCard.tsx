import { useState, useEffect } from "react";
import CelebrateUser from "./celebrateUser";
import { Skeleton } from "@/components/ui/skeleton";
import mockUsers from "@/data/mockGithubUsers.json";
import ProfilePanel from "@/components/profile/profilePanel";

function UserProfileCard() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const username = searchParams.get("user");

      if (!username) return;

      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const user = mockUsers.data.find(
          (user) => user.login.toLowerCase() === username.toLowerCase(),
        );

        if (user) {
          setUserData(user);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
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
      <div className="text-center mt-8 text-muted-foreground">
        User not found
      </div>
    );
  }

  return (
    <div className="flex gap-6 mt-8 justify-center flex-col lg:flex-row">
      <ProfilePanel
        name={userData.name || userData.login}
        username={userData.login}
        avatarSeed={userData.login}
        userBio={userData.bio}
        withAction={false}
      />
      <CelebrateUser username={userData.login} />
    </div>
  );
}

export default UserProfileCard;
