import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import Typography from "../typography";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import TransactionService from "@/services/transaction.service";

export default function ListTippers() {
  const { data: tippers = [], isLoading } = useQuery({
    queryKey: ["tippers"],
    queryFn: () => TransactionService.getTippers(),
  });

  return (
    <section className="space-y-3">
      <div>
        <Typography as="h2" variant="h5" className="text-white">
          List Tippers
        </Typography>
        <Typography as="p" variant="caption" className="text-gray-400">
          People who have tipped you recently.
        </Typography>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-gray-400">
          Loading tippers...
        </div>
      ) : tippers.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-gray-400">
          No tippers yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
          {tippers.map((tipper) => {
            const displayName = tipper.displayName?.trim() || tipper.username;
            const initials = displayName.slice(0, 2).toUpperCase();

            return (
              <Link
                key={tipper.userId}
                to="/app/dev/$username"
                params={{ username: tipper.username }}
                className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4 transition-colors last:border-b-0 hover:bg-white/5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={tipper.avatarUrl ?? undefined}
                      alt={displayName}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <Typography
                      as="p"
                      variant="h6"
                      className="truncate text-sm text-white"
                    >
                      {displayName}
                    </Typography>
                    <Typography
                      as="p"
                      variant="caption"
                      className="truncate text-gray-400"
                    >
                      @{tipper.username}
                    </Typography>
                  </div>
                </div>

                <div className="text-right">
                  <Typography
                    as="p"
                    variant="h6"
                    className="text-sm text-white"
                  >
                    {tipper.totalAmount} SOL
                  </Typography>
                  <Typography
                    as="p"
                    variant="caption"
                    className="text-gray-400"
                  >
                    {tipper.tipCount} tip{tipper.tipCount === 1 ? "" : "s"}
                    {tipper.lastTippedAt
                      ? ` · ${formatDistanceToNow(
                          new Date(tipper.lastTippedAt),
                          {
                            addSuffix: true,
                          },
                        )}`
                      : ""}
                  </Typography>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
