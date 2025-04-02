import { motion } from "framer-motion";
import { GithubIcon, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { truncateText } from "@/util/content-utils";
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
      className="p-6 border bg-gray-900/20 backdrop-blur-xl rounded-2xl border-white/10"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <Avatar className="w-24 h-22 rounded-2xl">
          <AvatarImage src={user?.avatar_url} alt={user?.login} sizes="md" />
          <AvatarFallback className="rounded-2xl">
            {user?.login?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="w-full space-y-3">
          <div>
            <h2 className="text-lg font-bold text-white">
              {user.name || user.login}
            </h2>
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <GithubIcon size={16} />
              <a
                href={`https://github.com/${user.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 transition-colors hover:text-purple-400"
              >
                @{user.login}
                <ExternalLinkIcon size={12} />
              </a>
            </div>
          </div>
          {user.bio && (
            <p className="text-sm leading-relaxed text-gray-400">
              {truncateText(user.bio, 30)}
            </p>
          )}
          <Button
            className="w-full py-5 border-2 border-gray-700 cursor-pointer"
            onClick={() => {
              const currentUrl = window.location.origin;
              window.location.href = `${currentUrl}/app/profile?user=${user.login}`;
              console.log(currentUrl);
            }}
          >
            Tip User 🍟
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
