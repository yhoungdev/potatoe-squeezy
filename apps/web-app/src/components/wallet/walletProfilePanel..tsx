import ProfilePanel from "../profile/profilePanel";
import { useUserStore } from "@/store/user.store";
function WalletProfilePanel() {
  const { users } = useUserStore()?.user;
  const { address } = useUserStore()?.user?.wallets;
  const { avatarUrl, username, name } = users || {};

  return (
    <div>
      <ProfilePanel
        name={name}
        username={username}
        avatar={avatarUrl}
        withAction={true}
        walletAddress={address}
        onUpdateAddress={() => {}}
      />
    </div>
  );
}

export default WalletProfilePanel;
