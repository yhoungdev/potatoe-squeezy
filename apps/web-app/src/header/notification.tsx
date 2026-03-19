import Drawer from "@/components/popups/drawer";
import { useQuery } from "@tanstack/react-query";
import NotificationService from "@/services/notification.service";
import { Notification as NotificationIcon } from "iconsax-reactjs";
import { formatDistanceToNow } from "date-fns";

function Notification() {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["userNotifications"],
    queryFn: () => NotificationService.getUserNotifications(),
    staleTime: 1000 * 60,
  });

  return (
    <Drawer
      title="Notifications"
      trigger={
        <button
          type="button"
          className="relative rounded-md bg-gray-800 p-2 text-white transition-colors hover:bg-gray-700"
        >
          <NotificationIcon />
          {notifications.length > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-400 px-1 text-[10px] font-semibold text-white">
              {notifications.length}
            </span>
          ) : null}
        </button>
      }
    >
      <div className="space-y-3 pt-4">
        {isLoading ? (
          <div className="rounded-xl border border-white/10 bg-gray-900/50 p-4 text-sm text-gray-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-gray-900/50 p-4 text-sm text-gray-400">
            No notifications yet.
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/10 bg-gray-900/50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-sm text-gray-300">{item.message}</p>
                  <p className="text-xs text-gray-500">
                    {item.sender?.username
                      ? `From @${item.sender.username}`
                      : `${item.senderAddress.slice(0, 4)}...${item.senderAddress.slice(-4)}`}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-gray-500">
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Drawer>
  );
}

export default Notification;
