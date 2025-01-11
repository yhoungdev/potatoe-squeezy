import DashboardHeader from "../components/header/dashboardHeader.tsx";
import DashboardBottomTab from "../components/dashboard/dashboardBottomTab.tsx";

interface IDashboardProps {
  children: React.ReactNode;
  title?: string;
}

const DefaultDashboard = ({ children }: IDashboardProps): React.JSX.Element => {
  return (
    <div className={"container w-full  md:w-[80%] mx-auto mt-4 "}>
      <DashboardHeader />
      <div>{children}</div>
      <DashboardBottomTab />
    </div>
  );
};
export default DefaultDashboard;
