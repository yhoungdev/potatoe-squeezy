import useAuth from "@/hooks/useAuth.ts";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUserStore } from "@/store/user.store";
import Cookies from "js-cookie";
import ConnectWalletButton from "@/button/connectWalletButton";
import { CirclePower } from "lucide-react";

function DashboardHeader() {
  const { checkAuth, logout } = useAuth();
  const clearUser = useUserStore((state) => state.clearUser);

  return (
    <div
      className={"w-full mx-auto mt-2 flex items-center gap-2 justify-between"}
    >
      <div>
        <a href={"/app"}>
          {/* <h1 className="text-4xl text-red-50">🍟</h1> */}
          <img src={"/logo/logo.png"} width={70} />
        </a>
      </div>

      <div className="flex items-center gap-2">
        <ConnectWalletButton>.</ConnectWalletButton>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className="p-2 text-red-400 bg-gray-800 rounded-md">
              <CirclePower />
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to logout?
              </AlertDialogTitle>
              <AlertDialogDescription>
                You'll need to login again to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>
                <Button className="bg-red-400" onClick={logout}>
                  Logout
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default DashboardHeader;
