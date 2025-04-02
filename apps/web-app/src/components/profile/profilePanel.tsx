import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Typography from "../typography";
import { useSolanaTip } from "@/hooks/useSolanaTip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import AddressAndBadge from "./addressAndBadge";

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

  const copyBadgeCode = () => {
    const badgeCode = `<iframe src="http://localhost:5134/embed/tip-badge?user=${username}" width="200" height="50" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(badgeCode);
    toast.success("Badge code copied to clipboard!");
  };

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

            {withAction ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="mt-2 mb-2 ">Manage Actions</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle className="text-white">
                      Profile Actions
                    </SheetTitle>
                  </SheetHeader>
                  <AddressAndBadge
                    username={username}
                    onUpdateAddress={onUpdateAddress}
                    onCopyBadge={copyBadgeCode}
                  />
                </SheetContent>
              </Sheet>
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
