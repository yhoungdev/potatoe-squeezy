import DashboardHeader from "@/header/dashboardHeader.tsx";
import DashboardBottomTab from "@/dashboard/dashboardBottomTab.tsx";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import ModalLayout from "@/components/popups/modals";
import AddOrUpdateAddress from "@/components/pages/settings/add-or-update-address.tsx";

interface IDashboardProps {
  children: React.ReactNode;
  title?: string;
}

const DefaultDashboard = ({ children }: IDashboardProps): React.JSX.Element => {
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const isValid = checkAuthStatus();
    if (!isValid) {
      navigate({ to: "/" });
    }
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <div className={"w-full bg-gray-900 text-center py-2"}>
        <ModalLayout
          title="Add a wallet address to continue"
          trigger={
            <p>
              You havnt added your wallet yet, please add your wallet to
              continue
            </p>
          }
          //closeOnOverlayClick={!!address}
        >
          <AddOrUpdateAddress />
        </ModalLayout>
      </div>
      <div className="container mx-auto px-4">
        <DashboardHeader />
        <div className="my-8 w-full lg:w-[700px] mx-auto">{children}</div>
        <DashboardBottomTab />
      </div>
    </div>
  );
};

export default DefaultDashboard;
