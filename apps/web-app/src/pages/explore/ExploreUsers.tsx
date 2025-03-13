import React, { useState } from "react";
import DefaultDashboard from "@/layouts/dashboard";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GithubUserSearch } from "@/components/search/GithubUserSearch";
import { GithubUserCard } from "@/components/github/GithubUserCard";
import { GithubUserCardSkeleton } from "@/components/github/GithubUserCardSkeleton";

interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
}

export default function ExploreUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<GitHubUser[]>([]);
  const [loading, setLoading] = useState(false);

  const searchGithubUser = async () => {
    if (!searchQuery) {
      toast.error("Please enter a GitHub username");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.github.com/search/users?q=${searchQuery}&per_page=10`,
      );
      const data = await response.json();

      if (response.ok) {
        // Fetch detailed information for each user
        const detailedUsers = await Promise.all(
          data.items.map(async (user: any) => {
            const userResponse = await fetch(
              `https://api.github.com/users/${user.login}`,
            );
            return userResponse.json();
          }),
        );

        setUsers(detailedUsers);
        toast.success(`Found ${detailedUsers.length} users!`);
      } else {
        setUsers([]);
        toast.error("No users found");
      }
    } catch (error) {
      toast.error("Error fetching GitHub users");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultDashboard>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto p-4"
      >
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Find GitHub Users
            </h1>
            <p className="text-gray-400">
              Search and tip your favorite GitHub contributors
            </p>
          </div>

          <GithubUserSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={searchGithubUser}
            loading={loading}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {loading ? (
              <>
                {Array.from({ length: 6 }).map((_, index) => (
                  <GithubUserCardSkeleton key={index} />
                ))}
              </>
            ) : (
              users?.map((user) => (
                <GithubUserCard key={user.login} user={user} />
              ))
            )}
          </div>
        </div>
      </motion.div>
    </DefaultDashboard>
  );
}
