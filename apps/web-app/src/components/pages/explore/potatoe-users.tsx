import { GithubUserSearch } from "@/components/search/GithubUserSearch";
import { useState } from "react";
const PotatoeUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<GitHubUser[]>([]);
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <GithubUserSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={() => {}}
        loading={loading}
      />
    </div>
  );
};

export default PotatoeUsers;
