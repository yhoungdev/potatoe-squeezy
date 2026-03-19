import WalletTransactionTable from "@/components/tables/transactionTable.tsx";
import DefaultDashboard from "@/layouts/dashboard.tsx";
import WalletProfilePanel from "@/components/wallet/walletProfilePanel.";
import ListTippers from "@/components/profile/list-tippers";
function IndexDashboardPage() {
  return (
    <DefaultDashboard>
      <WalletProfilePanel />
      <ListTippers />
      <WalletTransactionTable />
    </DefaultDashboard>
  );
}

export default IndexDashboardPage;
