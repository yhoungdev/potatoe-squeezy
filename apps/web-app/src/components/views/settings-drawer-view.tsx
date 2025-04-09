import AddressAndBadge from "../profile/addressAndBadge";
import ProductHuntBadge from "../misc/product-hunt-badge";
import { useUserStore } from "@/store/user.store";
import { toast } from "sonner";
import { Power } from "lucide-react";
import ModalLayout from "@/components/popups/modals";
import {DialogDescription} from "@/components/ui/dialog.tsx";
import useAuth from "@/hooks/useAuth.ts";
import {Button} from "@/components/ui/button.tsx";


const SettingsDrawerView = () => {
  const { user } = useUserStore() || {};

  const { username: profile_name } = user?.users || {};
  const { address } = user?.wallets || {};

  const { logout } = useAuth()

  const copyBadgeCode = () => {
    const badgeCode = `
        <a href="${window.location.origin}/app/profile?user=${profile_name}" target="_blank" rel="noopener noreferrer">
          <img 
            src="https://coffee-major-wallaby-86.mypinata.cloud/ipfs/bafkreiaskbvndui55ycmqdu6ui6arfkhxmqgjvjcaw26myp4y76mmqtbyi" 
            width="350" 
            height="54" 
            style="width: 250px; height: 54px;" 
            alt="Potatoe Squeezy - Support GitHub contributors with crypto" 
          />
        </a>
      `.trim();
    navigator.clipboard.writeText(badgeCode);
    toast.success("Badge code copied to clipboard!");
  };
  return (
    <div className={"relative"}>
      <AddressAndBadge
        username={profile_name}
        onUpdateAddress={() => {}}
        onCopyBadge={copyBadgeCode}
        currentAddress={address}
      />
      <div className="mt-[4em] ">
        <ProductHuntBadge />

        <ModalLayout trigger={<div
            className="flex items-center justify-between p-4 transition-all duration-200
          border-2 cursor-pointer text-r ed-600  bg-gray-900/50 hover:bg-gray-900/70 rounded-xl border-red-900/40 hover:border-purple-500/30"
        >
          <div className="flex items-center gap-2">
            <Power />
            <h4 className="text-sm "> Log out</h4>
          </div>
        </div>} title={'Log Out'}>

          <DialogDescription>Your account would be logged out</DialogDescription>

          <Button className={'mt-4 bg-red-700 w-full'} onClick={logout}>Continue</Button>

        </ModalLayout>
      </div>
    </div>
  );
};
export default SettingsDrawerView;
