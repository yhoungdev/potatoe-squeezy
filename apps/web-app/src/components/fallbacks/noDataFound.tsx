import { WalletSvg } from "@/assets/svg";

interface NoDataFoundProps {
  message?: string;
  submessage?: string;
}

export const NoDataFound = ({
  message = "No transactions yet",
  submessage = "Your transaction history will appear here",
}: NoDataFoundProps) => {
  return (
    <div className="flex flex-col items-center justify-center mb-[2em]">
      <WalletSvg />
      <p className="text-center text-gray-400">{message}</p>
      <p className="mt-1 text-sm text-center text-gray-500">{submessage}</p>
    </div>
  );
};
