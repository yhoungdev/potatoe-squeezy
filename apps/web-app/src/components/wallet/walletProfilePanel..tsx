import ProfilePanel from "../profile/profilePanel";
import { useUserStore } from "@/store/user.store";

function WalletProfilePanel() {
  const userStore = useUserStore();
  const users = userStore?.user?.users ?? {};
  const address = userStore?.user?.wallets?.address ?? "";

  const { avatarUrl, username, name } = users;

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
