import { Button } from "../ui/button";

interface TipBadgeProps {
  username: string;
}

export function TipBadge({ username }: TipBadgeProps) {
  return (
    <a
      className=""
      href={`http://localhost:5134/profile?user=${username}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Button className="gap-2">
        <span>Tip me on Potato</span> 🍟
      </Button>
    </a>
  );
}
