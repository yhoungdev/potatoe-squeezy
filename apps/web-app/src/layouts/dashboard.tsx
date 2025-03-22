import DashboardHeader from "@/header/dashboardHeader.tsx";
import DashboardBottomTab from "@/dashboard/dashboardBottomTab.tsx";
import WalletConnectProvider from "@/providers/walletConnectProvider.tsx";
import useAuth from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

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
    <div className="container mx-auto px-4">
      <DashboardHeader />
      <div className="my-8 w-full lg:w-[700px] mx-auto">{children}</div>
      <DashboardBottomTab />
    </div>
  );
};

export default DefaultDashboard;
