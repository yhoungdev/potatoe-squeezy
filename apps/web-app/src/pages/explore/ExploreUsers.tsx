import React, { useState } from "react";
import Button from "../../button";
import { useWallet } from "@solana/wallet-adapter-react";
import { SearchIcon } from "lucide-react";

interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
}

export default function ExploreUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(false);

  const searchGithubUser = async () => {
    if (!searchQuery) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.github.com/users/${searchQuery}`,
      );
      const data = await response.json();

      if (response.ok) {
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching GitHub user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Find GitHub Users</h1>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search GitHub username..."
              className="w-full p-3 bg-gray-900 rounded-xl pl-10"
            />
            <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
          <Button
            variant="default"
            onClick={searchGithubUser}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {user && (
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-20 h-20 rounded-xl"
            />
            <div>
              <h2 className="text-xl font-semibold">
                {user.name || user.login}
              </h2>
              <p className="text-gray-400">@{user.login}</p>
              {user.bio && <p className="text-gray-300 mt-2">{user.bio}</p>}
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="danger"
              className="w-full"
              onClick={() => {
                // Navigate to tip page or open tip modal
                window.location.href = `/tip/${user.login}`;
              }}
            >
              Tip User
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
