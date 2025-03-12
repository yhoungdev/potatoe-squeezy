import WalletTransactionTable from "@/components/tables/transactionTable.tsx";
import DefaultDashboard from "@/layouts/dashboard.tsx";
import WalletProfilePanel from "@/components/wallet/walletProfilePanel.";
function IndexDashboardPage() {
  return (
    <DefaultDashboard>
      <WalletProfilePanel />
      <WalletTransactionTable />
    </DefaultDashboard>
  );
}

export default IndexDashboardPage;
