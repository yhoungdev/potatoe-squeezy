import React from "react";
import { SearchIcon, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface GithubUserSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export function GithubUserSearch({
  searchQuery,
  onSearchChange,
  onSearch,
  loading,
}: GithubUserSearchProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="">
      <div className="flex gap-3 !my-4">
        <div className=" flex-1    ">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search GitHub username..."
            className="w-full  !p-5 bg-white/5 rounded-xl pl-11 border border-white/10 
              focus:outline-none focus:ring-2 transition-all"
          />
          <SearchIcon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
        <Button
          variant="default"
          onClick={onSearch}
          disabled={loading}
         
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={18} />
              Searching...
            </span>
          ) : (
            "Search"
          )}
        </Button>
      </div>
    </div>
  );
}
