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
    const isValid = checkAuthStatus();
    if (!isValid) {
      navigate({ to: "/" });
    }
  }, []);

  console.log(wallet);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      {wallet === undefined && (
        <div
          className="py-2 text-center text-white "
          style={{
            background: "linear-gradient(64deg, #a43d3c, #ad4b4a, #e67271)",
          }}
          className={"w-full bg-gray-900 text-center py-2"}
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
            //closeOnOverlayClick={!!address}
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
