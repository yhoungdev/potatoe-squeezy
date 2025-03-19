import ProfilePanel from "../profile/profilePanel";
import { useUserStore } from "@/store/user.store";
function WalletProfilePanel() {

  const { users } = useUserStore()?.user;
  const { avatarUrl , username , name} = users || {}
  
  return (
    <div>
      <ProfilePanel
        name={name}
        username={username}
        avatar={avatarUrl}
        withAction={true}
        onUpdateAddress={() => {}}
      />
    </div>
  );
}

export default WalletProfilePanel;
