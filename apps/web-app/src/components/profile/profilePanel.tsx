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
import ProductHuntBadge from "../misc/product-hunt-badge";
import { useUserStore } from "@/store/user.store";

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

  const { user } = useUserStore() || {};

  const { username: profile_name } = user?.users || {};

  const copyBadgeCode = () => {
    const badgeCode = `
      <a href="${window.location.origin}/profile?user=${profile_name}" target="_blank" rel="noopener noreferrer">
        <img 
          src="https://coffee-major-wallaby-86.mypinata.cloud/ipfs/bafkreiaskbvndui55ycmqdu6ui6arfkhxmqgjvjcaw26myp4y76mmqtbyi" 
          width="350" 
          height="54" 
          style="width: 250px; height: 54px;" 
          alt="Potatoe Squeezy - Support GitHub contributors with crypto | Product Hunt" 
        />
      </a>
    `.trim();
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
                  <Button className="mb-4 ">Manage Actions</Button>
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
                    currentAddress={walletAddress}
                  />

                  <div className="mt-[5em] fixed bottom-2">
                    <ProductHuntBadge />
                  </div>
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
