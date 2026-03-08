import { useMemo, useState, useRef } from "react";
import {
  startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, format, isToday, addWeeks,
} from "date-fns";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string>(format(today, "yyyy-MM-dd"));
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  // Swipe handling
  const touchStartX = useRef<number | null>(null);

  const baseDate = addWeeks(today, weekOffset);
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    days.forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      map.set(key, events.filter((e) => isSameDay(new Date(e.start_time), d)));
    });
    return map;
  }, [events, days]);

  const selectedEvents = eventsByDay.get(selectedDay) ?? [];

  const goToWeek = (offset: number) => {
    setDirection(offset > weekOffset ? "left" : "right");
    setWeekOffset(offset);
    // Auto-select today if navigating back to current week, otherwise select Monday
    const newBase = addWeeks(today, offset);
    const newStart = startOfWeek(newBase, { weekStartsOn: 1 });
    if (offset === 0) {
      setSelectedDay(format(today, "yyyy-MM-dd"));
    } else {
      setSelectedDay(format(newStart, "yyyy-MM-dd"));
    }
    setTimeout(() => setDirection(null), 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff < 0) goToWeek(weekOffset + 1);
      else goToWeek(weekOffset - 1);
    }
    touchStartX.current = null;
  };

  const weekLabel = weekOffset === 0
    ? "This Week"
    : weekOffset === 1
    ? "Next Week"
    : weekOffset === -1
    ? "Last Week"
    : format(weekStart, "MMM d") + " – " + format(weekEnd, "MMM d");

  return (
    <div className="animate-fade-in rounded-3xl border border-border/50 bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => goToWeek(weekOffset - 1)}
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-center">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {weekLabel}
          </h3>
          <span className="text-[10px] font-medium text-muted-foreground/70">
            {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d")}
          </span>
        </div>
        <button
          onClick={() => goToWeek(weekOffset + 1)}
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {weekOffset !== 0 && (
        <button
          onClick={() => goToWeek(0)}
          className="mx-auto mb-2 block text-[10px] font-semibold text-primary hover:underline"
        >
          Back to today
        </button>
      )}

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`grid grid-cols-7 gap-1 transition-all duration-300 ${
          direction === "left" ? "animate-slide-in-right" : direction === "right" ? "animate-slide-in-left" : ""
        }`}
      >
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
