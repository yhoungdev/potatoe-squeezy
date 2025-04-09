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

            {/* {withAction ? (
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
            )} */}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfilePanel;
