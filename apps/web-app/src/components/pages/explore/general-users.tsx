import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { GithubUserCardSkeleton } from "@/components/github/GithubUserCardSkeleton";
import { GithubUserCard } from "@/components/github/GithubUserCard";
import { GithubUserSearch } from "@/components/search/GithubUserSearch";
import GithubService, { type GitHubUser } from "@/services/github.service";

const GeneralGithubUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const {
    data: users = [],
    isFetching,
    error,
  } = useQuery<GitHubUser[]>({
    queryKey: ["githubUsersSearch", submittedQuery],
    queryFn: () => GithubService.searchUsers(submittedQuery, 10),
    enabled: true,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const searchGithubUser = async () => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setSubmittedQuery("");
      return;
    }

    setSubmittedQuery(trimmedQuery);
  };

  useEffect(() => {
    if (isFetching) {
      return;
    }

    if (error) {
      toast.error("Failed to fetch GitHub users");
      return;
    }

    if (!submittedQuery) {
      return;
    }

    if (users.length > 0) {
      toast.success(`Found ${users.length} users!`);
      return;
    }

    toast.error("No users found");
  }, [submittedQuery, users, isFetching, error]);

  return (
    <div>
      <GithubUserSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={searchGithubUser}
        loading={isFetching}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {isFetching ? (
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
