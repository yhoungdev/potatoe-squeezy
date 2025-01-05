import DashboardHeader from "../components/header/dashboardHeader.tsx";

interface  IDashboardProps {
    children:React.ReactNode;
    title?: string;

}

const DefaultDashboard = ({children}: IDashboardProps): React.JSX.Element=> {
    return (
        <div className={'container w-[90%] mx-auto mt-4 '}>
            <DashboardHeader />
            {children}
        </div>
    )
}
export default DefaultDashboard
