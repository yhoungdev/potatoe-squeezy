import ProfilePanel from "../profile/profilePanel";
import { useUserStore } from "@/store/user.store";

function WalletProfilePanel() {
  const { user, wallet } = useUserStore();
  const userData = user ?? {};
  const address = wallet?.address ?? "";

  const { avatarUrl, username, name } = userData as any;

  return (
    <div>
      <ProfilePanel
        name={name}
        username={username}
        avatar={avatarUrl}
        withAction={true}
        walletAddress={address}
      />
    </div>
  );
}

export default WalletProfilePanel;
