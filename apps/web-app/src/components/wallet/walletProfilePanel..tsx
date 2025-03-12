import ProfilePanel from "../profile/profilePanel";
function WalletProfilePanel() {
  return (
    <div>
      <ProfilePanel
        name="Obiabo Emmanuel"
        username="yhoungdev"
        withAction={true}
        onUpdateAddress={() => {}}
      />
    </div>
  );
}

export default WalletProfilePanel;
