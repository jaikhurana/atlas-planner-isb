import { useState } from "react";
import { useGlobalEvents, useSavedEventIds, useToggleSave } from "@/hooks/useEvents";
import EventCard from "@/components/EventCard";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GlobalCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const { data: events } = useGlobalEvents();
  const { data: savedIds } = useSavedEventIds();
  const toggleSave = useToggleSave();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start with empty cells
  const startDow = monthStart.getDay();

  const eventsOnDate = (date: Date) =>
    events?.filter((e) => isSameDay(new Date(e.start_time), date)) ?? [];

  const filteredEvents = selectedDate ? eventsOnDate(selectedDate) : events ?? [];

  const handleToggleSave = (id: string) => {
    toggleSave.mutate({ eventId: id, saved: savedIds?.has(id) ?? false });
  };

  const hasEvent = (date: Date) =>
    events?.some((e) => isSameDay(new Date(e.start_time), date)) ?? false;

  return (
    <div className="pb-safe">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-lg">
        <h1 className="text-lg font-bold">Global Calendar</h1>
      </header>

      <div className="mx-auto max-w-lg px-4 py-4">
        {/* Month nav */}
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))} className="rounded-lg p-2 hover:bg-secondary">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
          <button onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))} className="rounded-lg p-2 hover:bg-secondary">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="mb-4 grid grid-cols-7 gap-1 text-center text-xs">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="py-1 font-medium text-muted-foreground">{d}</div>
          ))}
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const selected = selectedDate && isSameDay(day, selectedDate);
            const today = isToday(day);
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(selected ? null : day)}
                className={`relative flex flex-col items-center rounded-lg py-1.5 text-sm transition-colors ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : today
                    ? "bg-secondary font-semibold"
                    : "hover:bg-secondary"
                }`}
              >
                {day.getDate()}
                {hasEvent(day) && (
                  <span className={`absolute bottom-0.5 h-1 w-1 rounded-full ${selected ? "bg-primary-foreground" : "bg-foreground"}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Events list */}
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
          {selectedDate ? format(selectedDate, "EEEE, MMM d") : "All Events"}
        </h3>
        <div className="space-y-3">
          {filteredEvents.length ? (
            filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                isSaved={savedIds?.has(event.id)}
                onToggleSave={handleToggleSave}
              />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No events</p>
          )}
        </div>
      </div>
    </div>
  );
}
