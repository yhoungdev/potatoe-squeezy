import React, { useState, useEffect } from "react";
import Button from "../../button";
import CelebrateUser from "./celebrateUser";

function UserProfileCard() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const username = searchParams.get("user");

      if (!username) return;

      try {
        const response = await fetch(
          `https://api.github.com/users/${username}`,
        );
        const data = await response.json();
        if (response.ok) {
          setUserData(data);
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
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (!userData) {
    return <div className="text-center mt-8">User not found</div>;
  }

  const openGithubProfile = () => {
    window.open(userData.html_url, "_blank");
  };

  return (
    <div className={"flex gap-4 mt-[2em] justify-center flex-col lg:flex-row"}>
      <div className="h-fit text-center w-full justify-center lg:w-[300px] rounded-xl px-4 py-4">
        <img
          src={userData.avatar_url}
          alt={userData.name}
          className="w-20 h-20 mx-auto rounded-xl object-cover"
        />
        <div>
          <h2 className="text-center font-semibold">
            {userData.name || userData.login}
          </h2>
          <small className="text-gray-600">@{userData.login}</small>
          {userData.bio && (
            <p className="text-sm text-gray-400 mt-2">{userData.bio}</p>
          )}
        </div>

        <Button variant="default" onClick={openGithubProfile}>
          Github Profile
        </Button>
      </div>

      <CelebrateUser username={userData.login} />
    </div>
  );
}

export default UserProfileCard;
