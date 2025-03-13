import { motion } from "framer-motion";
import { GithubIcon, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
}

interface GithubUserCardProps {
  user: GitHubUser;
}

export function GithubUserCard({ user }: GithubUserCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-900/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
    >
      <div className="flex flex-col items-center text-center gap-4">
        <Avatar className="w-24 h-24 rounded-2xl">
          <AvatarImage src={user?.avatar_url} alt={user?.login} sizes="md" />
          <AvatarFallback className="rounded-2xl">
            {user?.login?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-3 w-full">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {user.name || user.login}
            </h2>
            <div className="flex items-center justify-center gap-2 text-gray-400">
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
            <p className="text-gray-300 text-sm leading-relaxed">{user.bio}</p>
          )}
          <Button
            variant="default"
            className="w-full"
            onClick={() => {
              window.location.href = `/app/profile?user=${user.login}`;
            }}
          >
            Tip User 🍟
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
