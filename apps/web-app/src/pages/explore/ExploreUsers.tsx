import React, { useState } from "react";
import Button from "../../button";
import { GithubIcon, ExternalLinkIcon } from "lucide-react";
import DefaultDashboard from "@/layouts/dashboard";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GithubUserSearch } from "@/components/search/GithubUserSearch";

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
    if (!searchQuery) {
      toast.error("Please enter a GitHub username");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.github.com/users/${searchQuery}`,
      );
      const data = await response.json();

      if (response.ok) {
        setUser(data);
        toast.success("User found!");
      } else {
        setUser(null);
        toast.error("User not found");
      }
    } catch (error) {
      toast.error("Error fetching GitHub user");
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

          {user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-start gap-6">
                <img
                  src={user?.avatar_url || ""}
                  alt={user?.login || ""}
                  className="w-24 h-24 rounded-2xl ring-2 ring-purple-500/20"
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {user.name || user.login}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-400">
                      <GithubIcon size={16} />
                      <a
                        href={`https://github.com/${user.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-purple-400 transition-colors flex items-center gap-1"
                      >
                        @{user.login}
                        <ExternalLinkIcon size={12} />
                      </a>
                    </div>
                  </div>
                  {user.bio && (
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {user.bio}
                    </p>
                  )}
                  <Button
                    variant="default"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 
                      hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                    onClick={() => {
                      window.location.href = `/tip/${user.login}`;
                    }}
                  >
                    Tip User
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </DefaultDashboard>
  );
}
