import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Typography from "../typography";
interface ProfilePanelProps {
  name: string;
  username: string;
  withAction?: boolean;
  onUpdateAddress?: () => void;
  avatar: string;
  userBio?: string;
  walletAddress?: string;
}

function ProfilePanel({
  name,
  username,
  withAction = false,
  avatar,
  userBio = "",
}: ProfilePanelProps) {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="px-3 ">
          <div className="flex flex-col items-center justify-between gap-4">
            <Avatar className="w-[70px] h-[70px]">
              <AvatarImage src={avatar} alt={username} />
              <AvatarFallback>
                {username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Typography variant="h4">{name}</Typography>
            <Typography variant="caption" color="secondary">
              @{username}
            </Typography>

            <Typography className="text-xs">{userBio}</Typography>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfilePanel;
