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
      <svg
        width="150"
        height="150"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className=""
      >
        <rect
          x="40"
          y="60"
          width="120"
          height="80"
          rx="10"
          fill="url(#walletGradient)"
        />
        <path
          d="M160 90h-20v20h20"
          stroke="url(#detailGradient)"
          strokeWidth="4"
        />
        <circle
          cx="100"
          cy="100"
          r="15"
          fill="url(#coinGradient)"
          opacity="0.6"
        />
        <defs>
          <linearGradient id="walletGradient" x1="40" y1="60" x2="160" y2="140">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <linearGradient
            id="detailGradient"
            x1="140"
            y1="90"
            x2="160"
            y2="110"
          >
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="coinGradient" x1="85" y1="85" x2="115" y2="115">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
      <p className="text-gray-400 text-center">{message}</p>
      <p className="text-gray-500 text-sm text-center mt-1">{submessage}</p>
    </div>
  );
};
