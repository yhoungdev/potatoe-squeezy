import AddressAndBadge from "../profile/addressAndBadge";
import ProductHuntBadge from "../misc/product-hunt-badge";
import { useUserStore } from "@/store/user.store";
import { toast } from "sonner";

const SettingsDrawerView = () => {

    const { user } = useUserStore() || {};
    

    const { username: profile_name,  } = user?.users || {};
    const { address } = user?.wallets || {};
  
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
    <>
      <AddressAndBadge
        username={profile_name}
        onUpdateAddress={() =>{}}
        onCopyBadge={copyBadgeCode}
        currentAddress={address}
      />
      <div className="mt-[5em] fixed bottom-2">
        <ProductHuntBadge />
      </div>
    </>
  );
};
export default SettingsDrawerView;
