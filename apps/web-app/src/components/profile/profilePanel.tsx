import { Button } from "../ui/button";
import { motion } from "framer-motion";
import Avatar from "boring-avatars";
import Typography from "../typography";

interface ProfilePanelProps {
  name: string;
  username: string;
  withAction?: boolean;
  onUpdateAddress?: () => void;
  avatarSeed?: string;
  userBio?: string;
}

function ProfilePanel({
  name,
  username,
  onUpdateAddress,
  withAction = false,
  avatarSeed = username,
  userBio = "",
}: ProfilePanelProps) {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="px-3 !mb-[3em]">
          <div className="flex items-center justify-between flex-col">
            <Avatar
              size={70}
              name={avatarSeed}
              variant="beam"
              colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
            />
            <Typography variant="h4">{name}</Typography>
            <Typography variant="caption" color="secondary">
              @{username}
            </Typography>

            <Typography className="text-xs">{userBio}</Typography>

            {withAction && (
              <Button
                className="mt-2"
                onClick={onUpdateAddress}
              >
                Update Address
            </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfilePanel;
