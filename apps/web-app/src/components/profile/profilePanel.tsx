import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Typography from "../typography";
import { useSolanaTip } from "@/hooks/useSolanaTip";

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
  onUpdateAddress,
  withAction = false,
  avatar,
  userBio = "",
  walletAddress,
}: ProfilePanelProps) {
  const { sendTip, isSending, isWalletConnected } = useSolanaTip();

  const handleTip = () => {
    if (walletAddress) {
      sendTip(walletAddress);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="px-3 !mb-[3em]">
          <div className="flex items-center justify-between flex-col gap-4">
            <Avatar className="w-[70px] h-[70px]">
              <AvatarImage src={avatar} alt={username} />
              <AvatarFallback>
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Typography variant="h4">{name}</Typography>
            <Typography variant="caption" color="secondary">
              @{username}
            </Typography>

            <Typography className="text-xs">{userBio}</Typography>

            {withAction ? (
              <Button className="mt-2" onClick={onUpdateAddress}>
                Update Address
              </Button>
            ) : (
              walletAddress && (
                <Button 
                  className="mt-2" 
                  onClick={handleTip}
                  disabled={isSending || !isWalletConnected}
                >
                  {isSending ? "Sending..." : "Tip 0.1 SOL 🍟"}
                </Button>
              )
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfilePanel;
