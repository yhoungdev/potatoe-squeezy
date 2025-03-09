import React from "react";
import WalletProfilePanel from "../../wallet/walletProfilePanel..tsx";
import WalletTransactionTable from "@/components/table/walletTransactionTable..tsx";

function IndexDashboardPage() {
  return (
    <div>
      <WalletProfilePanel />
      <WalletTransactionTable />
    </div>
  );
}

export default IndexDashboardPage;
