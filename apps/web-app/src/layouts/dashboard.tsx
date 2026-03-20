import DashboardHeader from "@/header/dashboardHeader.tsx";
import DashboardBottomTab from "@/dashboard/dashboardBottomTab.tsx";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import ModalLayout from "@/components/popups/modals";
import AddOrUpdateAddress from "@/components/pages/settings/add-or-update-address.tsx";
import { useUserStore } from "../../store/user.ts";

interface IDashboardProps {
  children: React.ReactNode;
  title?: string;
}

const DefaultDashboard = ({ children }: IDashboardProps): React.JSX.Element => {
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const { wallet } = useUserStore();

  useEffect(() => {
    let cancelled = false;
    checkAuthStatus().then((isValid) => {
      if (cancelled) return;
      if (!isValid) navigate({ to: "/" });
    });
    return () => {
      cancelled = true;
    };
  }, [checkAuthStatus, navigate]);

  console.log(wallet);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      {!wallet && (
        <div
          style={{
            background: "linear-gradient(64deg, #a43d3c, #ad4b4a, #e67271)",
          }}
          className="w-full text-center py-2 text-white"
        >
          <ModalLayout
            title="Add a wallet address to continue"
            trigger={
              <p>
                Please add your Solana wallet address.{" "}
                <span className={"font-semibold underline cursor-pointer"}>
                  Click here.
                </span>
              </p>
            }
          >
            <AddOrUpdateAddress />
          </ModalLayout>
        </div>
      )}
      <div className="container mx-auto px-4">
        <DashboardHeader />
        <div className="my-8 w-full lg:w-[700px] mx-auto">{children}</div>
        <DashboardBottomTab />
      </div>
    </div>
  );
};

export default DefaultDashboard;
