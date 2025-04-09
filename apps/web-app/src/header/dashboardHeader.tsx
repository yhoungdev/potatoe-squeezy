import useAuth from "@/hooks/useAuth.ts";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user.store";
import ModalLayout from "@/components/popups/modals";
import ConnectWalletButton from "@/button/connectWalletButton";
import { CirclePower, Settings } from "lucide-react";
import { AlertDialogDescription } from "@/components/ui/alert-dialog";
import Drawer from "@/components/popups/drawer";
import SettingsDrawerView from "@/components/views/settings-drawer-view";

function DashboardHeader() {
  const { logout } = useAuth();
  const clearUser = useUserStore((state) => state.clearUser);

  return (
    <div
      className={"w-full mx-auto mt-2 flex items-center gap-2 justify-between"}
    >
      <div>
        <a href={"/app"}>
          <img src={"/logo/logo.png"} width={70} />
        </a>
      </div>

      <div className="flex items-center gap-2">
        <Drawer
          title="Settings"
          trigger={
            <div className="p-2 text-white bg-gray-800 rounded-md cursor-pointer">
              <Settings />
            </div>
          }
        >
          <SettingsDrawerView />
        </Drawer>
      </div>
    </div>
  );
}

export default DashboardHeader;
