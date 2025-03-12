import DashboardHeader from "@/header/dashboardHeader.tsx";
import DashboardBottomTab from "@/dashboard/dashboardBottomTab.tsx";
import WalletConnectProvider from "@/providers/walletConnectProvider.tsx";

interface IDashboardProps {
  children: React.ReactNode;
  title?: string;
}

const DefaultDashboard = ({ children }: IDashboardProps): React.JSX.Element => {
  return (
    <div className={" !container !mx-auto !px-4"}>
      <DashboardHeader />
      <div className={"my-[2em] w-full lg:w-[700px] !mx-auto"}>{children}</div>
      <DashboardBottomTab />
    </div>
  );
};
export default DefaultDashboard;
