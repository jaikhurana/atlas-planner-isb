import { useMemo } from "react";
import {
  startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, format, isToday,
  addHours, differenceInMinutes,
} from "date-fns";

type CalEvent = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  event_type: "mandatory" | "club" | "open_invite" | "private";
};

const colorMap: Record<string, string> = {
  mandatory: "bg-event-admin",
  club: "bg-event-club",
  open_invite: "bg-event-student",
  private: "bg-event-private",
};

export default function WeekStrip({ events = [] }: { events: CalEvent[] }) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    days.forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      map.set(
        key,
        events.filter((e) => isSameDay(new Date(e.start_time), d))
      );
    });
    return map;
  }, [events, days]);

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          This Week
        </h3>
        <span className="text-xs text-muted-foreground">
          {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d")}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(key) ?? [];
          const today_ = isToday(day);
          return (
            <div key={key} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-muted-foreground">
                {format(day, "EEE")}
              </span>
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  today_
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground"
                }`}
              >
                {format(day, "d")}
              </span>
              <div className="flex gap-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <span
                    key={e.id}
                    className={`h-1.5 w-1.5 rounded-full ${colorMap[e.event_type]}`}
                  />
                ))}
                {dayEvents.length === 0 && (
                  <span className="h-1.5 w-1.5 rounded-full opacity-0">·</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's schedule */}
      {(() => {
        const todayKey = format(today, "yyyy-MM-dd");
        const todayEvents = eventsByDay.get(todayKey) ?? [];
        if (todayEvents.length === 0) return null;
        return (
          <div className="mt-3 space-y-1.5 border-t border-border pt-3">
            {todayEvents.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${colorMap[e.event_type]}`} />
                <span className="flex-1 truncate text-xs font-medium text-foreground">
                  {e.title}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(e.start_time), "h:mm a")}
                </span>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
