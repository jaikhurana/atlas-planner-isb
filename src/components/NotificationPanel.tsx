import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
} from "@/hooks/useNotifications";
import {
  Bell, BellOff, Check, CheckCheck, Clock, CalendarDays,
  Sparkles, AlertTriangle, X,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const typeIcons: Record<string, typeof Bell> = {
  reminder_15m: Clock,
  reminder_1h: Clock,
  reminder_1d: CalendarDays,
  event_update: AlertTriangle,
  event_cancelled: X,
  new_event_match: Sparkles,
};

const typeColors: Record<string, string> = {
  reminder_15m: "text-event-admin",
  reminder_1h: "text-event-club",
  reminder_1d: "text-event-club",
  event_update: "text-amber-500",
  event_cancelled: "text-destructive",
  new_event_match: "text-event-student",
};

export function NotificationBell() {
  const { data: count } = useUnreadCount();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative rounded-lg p-2 hover:bg-secondary">
          <Bell className="h-5 w-5" />
          {(count ?? 0) > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {count! > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-sm p-0">
        <NotificationList onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

function NotificationList({ onClose }: { onClose: () => void }) {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const navigate = useNavigate();

  const unread = notifications?.filter((n) => !n.is_read) ?? [];

  const handleClick = (n: (typeof notifications)[0]) => {
    if (!n.is_read) markRead.mutate(n.id);
    if (n.event_id) {
      onClose();
      navigate(`/event/${n.event_id}`);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <SheetTitle className="text-lg">Notifications</SheetTitle>
          {unread.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllRead.mutate()}
              className="gap-1 text-xs text-muted-foreground"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : notifications?.length ? (
          <div>
            {notifications.map((n) => {
              const Icon = typeIcons[n.notification_type] ?? Bell;
              const color = typeColors[n.notification_type] ?? "text-muted-foreground";
              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex w-full items-start gap-3 border-b border-border px-4 py-3.5 text-left transition-colors hover:bg-secondary/50 ${
                    !n.is_read ? "bg-primary/[0.03]" : ""
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 rounded-full p-1.5 ${!n.is_read ? "bg-primary/10" : "bg-secondary"}`}>
                    <Icon className={`h-4 w-4 ${!n.is_read ? color : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-tight ${!n.is_read ? "font-semibold text-foreground" : "text-foreground"}`}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">{n.body}</p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatDistanceToNowStrict(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <BellOff className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
