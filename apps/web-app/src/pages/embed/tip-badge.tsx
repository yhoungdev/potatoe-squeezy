import { TipBadge } from "@/components/profile/TipBadge";

export default function TipBadgeEmbed() {
  const searchParams = new URLSearchParams(window.location.search);
  const username = searchParams.get("user");

  if (!username) {
    return null;
  }

  return <TipBadge username={username} />;
}
