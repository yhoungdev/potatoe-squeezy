import { Settings } from "lucide-react";
import Drawer from "@/components/popups/drawer";
import SettingsDrawerView from "@/components/views/settings-drawer-view.tsx";
import Notification from "@/header/notification.tsx";
import { useProfile } from "@/hooks/useProfile";

function DashboardHeader() {
  const { profile } = useProfile();

  const totalReceived = profile?.totalTipsReceived ?? "0";
  const totalSent = profile?.totalTokensSent ?? profile?.totalTipsSent ?? "0";
  const rankName = profile?.rankBadge?.name ?? "No giver rank yet";

  return (
    <header className="w-full backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <a
          href="/app"
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 transition hover:border-white/30 hover:bg-white/10"
        >
          <img
            src="/logo/logo.png"
            width={40}
            height={40}
            className="rounded-md"
            alt="Logo"
          />
          <span className="hidden text-sm font-semibold text-white sm:inline">
            Dashboard
          </span>
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col rounded-md bg-gray-900/80 px-3 py-2 text-xs text-gray-100 sm:flex-row sm:items-center sm:gap-3 sm:text-sm">
            <div>
              <span className="text-gray-400">Received:</span>{" "}
              <span className="font-medium">{totalReceived} SOL</span>
            </div>
            <span className="hidden text-gray-600 sm:inline">|</span>
            <div>
              <span className="text-gray-400">Sent:</span>{" "}
              <span className="font-medium">{totalSent} SOL</span>
            </div>
          </div>

          <div className="rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-100 sm:text-sm">
            {rankName}
          </div>
          <Drawer
            title="Settings"
            trigger={
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-gray-900/80 p-2 text-gray-100 shadow-sm transition hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            }
          >
            <SettingsDrawerView />
          </Drawer>

          <Notification />
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
