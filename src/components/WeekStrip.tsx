import { useMemo, useState } from "react";
import {
  startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, format, isToday,
} from "date-fns";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const [selectedDay, setSelectedDay] = useState<string>(format(today, "yyyy-MM-dd"));

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    days.forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      map.set(key, events.filter((e) => isSameDay(new Date(e.start_time), d)));
    });
    return map;
  }, [events, days]);

  const selectedEvents = eventsByDay.get(selectedDay) ?? [];

  return (
    <div className="animate-fade-in rounded-3xl border border-border/50 bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          This Week
        </h3>
        <span className="text-xs font-medium text-muted-foreground">
          {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d")}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(key) ?? [];
          const isCurrentDay = isToday(day);
          const isSelected = selectedDay === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedDay(key)}
              className="flex flex-col items-center gap-1.5 outline-none"
            >
              <span className="text-[10px] font-bold text-muted-foreground">
                {format(day, "EEE")}
              </span>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : isCurrentDay
                    ? "ring-2 ring-primary/30 text-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {format(day, "d")}
              </span>
              <div className="flex gap-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${colorMap[e.event_type]}`} />
                ))}
                {dayEvents.length === 0 && (
                  <span className="h-1.5 w-1.5 rounded-full opacity-0">·</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 border-t border-border/40 pt-3">
        {selectedEvents.length > 0 ? (
          <div className="space-y-1.5">
            {selectedEvents.map((e) => (
              <button
                key={e.id}
                onClick={() => navigate(`/event/${e.id}`)}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-secondary/60"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${colorMap[e.event_type]}`} />
                <span className="flex-1 truncate text-xs font-semibold text-foreground">
                  {e.title}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {format(new Date(e.start_time), "h:mm a")}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs font-medium text-muted-foreground py-1">
            No events on this day
          </p>
        )}
      </div>
    </div>
  );
}
