import DashboardHeader from "../../components/header/dashboardHeader.tsx";
import DashboardBottomTab from "../../components/dashboard/dashboardBottomTab.tsx";
import WalletConnectProvider from "@/providers/walletConnectProvider.tsx";

interface IDashboardProps {
  children: React.ReactNode;
  title?: string;
}

const DefaultDashboard = ({ children }: IDashboardProps): React.JSX.Element => {
  return (
    <WalletConnectProvider>
      <div className={"container w-[95%]  md:w-[70%] mx-auto mt-4 "}>
        <DashboardHeader />
        <div className={"my-[2em]"}>{children}</div>
        <DashboardBottomTab />
      </div>
    </WalletConnectProvider>
  );
};
export default DefaultDashboard;
