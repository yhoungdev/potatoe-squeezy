import { useState } from "react";
import { toast } from "sonner";
import { GithubUserCardSkeleton } from "@/components/github/GithubUserCardSkeleton";
import { GithubUserCard } from "@/components/github/GithubUserCard";
import { GithubUserSearch } from "@/components/search/GithubUserSearch";

interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
}

const GeneralGithubUsers = () => {
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
    <div>
      <GithubUserSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={searchGithubUser}
        loading={loading}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {loading ? (
          <>
            {Array.from({ length: 6 }).map((_, index) => (
              <GithubUserCardSkeleton key={index} />
            ))}
          </>
        ) : (
          users?.map((user) => <GithubUserCard key={user.login} user={user} />)
        )}
      </div>
    </div>
  );
};

export default GeneralGithubUsers;
