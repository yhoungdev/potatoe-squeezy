import Drawer from "@/components/popups/drawer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import NotificationService, {
  type UserNotification,
} from "@/services/notification.service";
import { Notification as NotificationIcon } from "iconsax-reactjs";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";
import { BASE_API_URL } from "@/constant";

function Notification() {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["userNotifications"],
    queryFn: () => NotificationService.getUserNotifications(),
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    const token = localStorage.getItem("bearer_token");

    if (!token || !BASE_API_URL) {
      return;
    }

    const wsUrl = (() => {
      try {
        const url = new URL(BASE_API_URL);
        url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
        url.pathname = "/ws/notifications";
        url.searchParams.set("token", token);
        return url.toString();
      } catch {
        return null;
      }
    })();

    if (!wsUrl) {
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closedByApp = false;

    const connect = () => {
      socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (
            payload?.type !== "notification.created" ||
            !payload.notification
          ) {
            return;
          }

          const nextNotification = payload.notification as UserNotification;

          queryClient.setQueryData<UserNotification[]>(
            ["userNotifications"],
            (current = []) => {
              const deduped = current.filter(
                (item) => item.id !== nextNotification.id,
              );
              return [nextNotification, ...deduped].slice(0, 20);
            },
          );
        } catch (error) {
          console.error("Failed to parse realtime notification:", error);
        }
      };

      socket.onclose = (event) => {
        if (closedByApp) {
          return;
        }

        if (event.code === 1008) {
          return;
        }

        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      closedByApp = true;

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      socket?.close();
    };
  }, [queryClient]);

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
