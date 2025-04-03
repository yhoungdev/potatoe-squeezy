interface TipBadgeProps {
  username: string;
}

export function TipBadge({ username }: TipBadgeProps) {
  const currentUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  return (
    <a
      className=""
      href={`${currentUrl}/profile?user=${username}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="https://coffee-major-wallaby-86.mypinata.cloud/ipfs/bafkreiaskbvndui55ycmqdu6ui6arfkhxmqgjvjcaw26myp4y76mmqtbyi"
        width="350"
        height="54"
        style={{ width: "250px", height: "54px" }}
        alt="Potatoe Squeezy - Support GitHub contributors with crypto | Product Hunt"
      />
    </a>
  );
}
