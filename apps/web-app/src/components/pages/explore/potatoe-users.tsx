import { useState } from "react";
import { UserService } from "@/services";
import { GithubUserCardSkeleton } from "@/components/github/GithubUserCardSkeleton";
import { GithubUserCard } from "@/components/github/GithubUserCard";
import { GithubUserSearch } from "@/components/search/GithubUserSearch";
import { useQuery } from "@tanstack/react-query";
import { IPotatoeUserData } from "@/interface/users.interface";

const fetchPotatoeUsers = async () => {
  const response = await UserService.fetchAllPotatoeUsers();
  return response;
};

const PotatoeUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["potatoe-users"],
    queryFn: fetchPotatoeUsers,
    staleTime: 1000 * 60 * 5,
  });

  const filteredUsers = users?.filter(({ users: user }) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <GithubUserSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={() => {}}
        loading={isLoading}
      />

      <div className="grid grid-cols-1 gap-4 py-4 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <GithubUserCardSkeleton key={index} />
          ))
        ) : isError ? (
          <p className="text-center text-red-500">Failed to load users</p>
        ) : filteredUsers?.length > 0 ? (
          filteredUsers?.map((data: IPotatoeUserData, index: number) => {
            const users = data.users;

            const userData = {
              name: users.name,
              avatar_url: users.avatarUrl,
              login: users.username,
              email: users.email,
            };
            return (
              <GithubUserCard
                key={index}
                user={userData}
                wallet={data.wallets}
              />
            );
          })
        ) : (
          <p className="text-center text-gray-500">No users found</p>
        )}
      </div>
    </div>
  );
};

export default PotatoeUsers;
