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

function DashboardHeader() {
  const { checkAuth, logout } = useAuth();
  const clearUser = useUserStore((state) => state.clearUser);

  return (
    <div className={"w-full mx-auto flex items-center gap-2 justify-between"}>
      <div>
        <a href={"/app"}>
          <h1 className="text-4xl text-red-50">🍟</h1>
        </a>
      </div>

      <div className="flex items-center gap-2">
        <ConnectWalletButton>.</ConnectWalletButton>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant={"outline"} className="text-red-400 bg-red-200/10">
              Logout
            </Button>
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
