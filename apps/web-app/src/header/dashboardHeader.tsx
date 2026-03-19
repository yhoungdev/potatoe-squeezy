import { Settings } from "lucide-react";
import Drawer from "@/components/popups/drawer";
import SettingsDrawerView from "@/components/views/settings-drawer-view.tsx";
import Notification from "@/header/notification.tsx";
import { useProfile } from "@/hooks/useProfile";

function DashboardHeader() {
  const { profile } = useProfile();

  return (
    <div>
      <div
        className={
          "w-full mx-auto mt-2 flex items-center gap-2 justify-between"
        }
      >
        <div>
          <a href={"/app"}>
            <img src={"/logo/logo.png"} width={70} />
          </a>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-md bg-gray-800 px-3 py-2 text-sm text-white">
            <span className="text-gray-300">Received:</span>{" "}
            {profile?.totalTipsReceived ?? "0"} SOL
            <span className="mx-2 text-gray-500">|</span>
            <span className="text-gray-300">Sent:</span>{" "}
            {profile?.totalTokensSent ?? profile?.totalTipsSent ?? "0"} SOL
          </div>
          <div className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {profile?.rankBadge?.name ?? "No giver rank yet"}
          </div>
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

          <Notification />
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
