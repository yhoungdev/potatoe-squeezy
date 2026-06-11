import WalletTransactionTable from "@/components/tables/transactionTable.tsx";
import DefaultDashboard from "@/layouts/dashboard.tsx";
import WalletProfilePanel from "@/components/wallet/walletProfilePanel.";
import ListTippers from "@/components/profile/list-tippers";
import { SentAndReceivedTokenPanel } from "@/components/profile/profile-misc";

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
