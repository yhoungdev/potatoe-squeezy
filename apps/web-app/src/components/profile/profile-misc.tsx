import { useProfile } from "@/hooks/useProfile";
import { use } from "react";

const SentAndReceivedTokenPanel = () => {
  const {} = useProfile();

  const { profile } = useProfile();

  const totalReceived = profile?.totalTipsReceived ?? "0";
  const totalSent = profile?.totalTokensSent ?? profile?.totalTipsSent ?? "0";
  return (
    <>
      <div
        className="flex rounded-md  gap-4 bg-gray-900/80 px-3 py-2 text-xs
            text-gray-100 sm:flex-row sm:items-center sm:gap-3 sm:text-sm"
      >
        <div>
          <span className="text-gray-400">Received:</span>{" "}
          <span className="font-medium">{totalReceived} SOL</span>
        </div>
        <span className="hidden text-gray-600 sm:inline">|</span>
        <div>
          <span className="text-gray-400">Sent:</span>{" "}
          <span className="font-medium">{totalSent} SOL</span>
        </div>
      </div>
    </>
  );
};

export { SentAndReceivedTokenPanel };
