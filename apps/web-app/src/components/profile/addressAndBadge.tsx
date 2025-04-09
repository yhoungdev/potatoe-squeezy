import { Button } from "../ui/button";
import { ChevronRight, CopyIcon } from "lucide-react";
import { TipBadge } from "./TipBadge";
import Typography from "../typography";
import ModalLayout from "../popups/modals";
import AddOrUpdateAddress from "../pages/settings/add-or-update-address";
import UpdateProfile from "../pages/settings/update-profile";

interface AddressAndBadgeProps {
  username: string;
  onCopyBadge: () => void;
}

const AddressAndBadge = ({ username, onCopyBadge }: AddressAndBadgeProps) => {
  return (
    <div className="flex flex-col gap-6 mt-6">
      <ModalLayout
        title="Update Wallet Address"
        trigger={
          <div className="flex items-center justify-between p-4 transition-all duration-200 border cursor-pointer bg-gray-900/50 hover:bg-gray-900/70 rounded-xl border-white/5 hover:border-purple-500/30">
            <h4 className="text-sm text-gray-300">
              💼 Add/Update Wallet Address
            </h4>
            <ChevronRight className="text-gray-400" />
          </div>
        }
      >
        <AddOrUpdateAddress />
      </ModalLayout>

      <ModalLayout
        title="Your Badge"
        trigger={
          <div className="flex items-center justify-between p-4 transition-all duration-200 border cursor-pointer bg-gray-900/50 hover:bg-gray-900/70 rounded-xl border-white/5 hover:border-purple-500/30">
            <h4 className="text-sm text-gray-300">✨ Generate Badge</h4>
            <ChevronRight className="text-gray-400" />
          </div>
        }
      >
        <div className="pt-4 space-y-4">
          <Typography
            variant="h6"
            className="text-sm text-center text-gray-300"
          >
            Your Tip Badge ✨
          </Typography>
          <div className="flex justify-center p-4 border bg-gray-900/50 rounded-xl border-white/5">
            <TipBadge username={username} />
          </div>
          <Button
            onClick={onCopyBadge}
            className="w-full bg-gray-800 animate-pulse"
          >
            Copy Badge Code <CopyIcon />
          </Button>
        </div>
      </ModalLayout>

      <ModalLayout
        title="Update Profile"
        trigger={
          <div className="flex items-center justify-between p-4 transition-all duration-200 border cursor-pointer bg-gray-900/50 hover:bg-gray-900/70 rounded-xl border-white/5 hover:border-purple-500/30">
            <h4 className="text-sm text-gray-300">👤 Update Profile</h4>
            <ChevronRight className="text-gray-400" />
          </div>
        }
      >
        <UpdateProfile />
      </ModalLayout>
    </div>
  );
};

export default AddressAndBadge;
