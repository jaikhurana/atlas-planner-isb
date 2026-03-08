import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobalEvents, useSavedEventIds, useToggleSave } from "@/hooks/useEvents";
import EventCard from "@/components/EventCard";
import EventCardSkeleton from "@/components/EventCardSkeleton";
import EmptyState from "@/components/EmptyState";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isToday, isWithinInterval,
} from "date-fns";
import {
  ChevronLeft, ChevronRight, Search, CalendarDays,
  List, SlidersHorizontal, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type ViewMode = "calendar" | "list";

const categories = ["academic", "sports", "cultural", "social", "other"] as const;
const eventTypes = ["mandatory", "club", "open_invite"] as const;

const eventTypeLabels: Record<string, string> = {
  mandatory: "Mandatory",
  club: "Club",
  open_invite: "Open Invite",
};

const dotColor: Record<string, string> = {
  mandatory: "bg-event-admin",
  club: "bg-event-club",
  open_invite: "bg-event-student",
  private: "bg-event-private",
};

export default function GlobalCalendar() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<ViewMode>("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [search, setSearch] = useState(searchParams.get("interest") ?? "");
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [filterEventType, setFilterEventType] = useState<string[]>([]);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterInterests, setFilterInterests] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const myTags = useMemo(() => {
    const tags = [
      ...(profile?.interest_tags ?? []),
      ...(profile?.activity_preferences ?? []),
    ];
    return [...new Set(tags.map((t) => t.toLowerCase()))];
  }, [profile]);

  const { data: events, isLoading } = useGlobalEvents();
  const { data: savedIds } = useSavedEventIds();
  const toggleSave = useToggleSave();

  const handleToggleSave = (id: string) => {
    toggleSave.mutate({ eventId: id, saved: savedIds?.has(id) ?? false });
  };

  const activeFilterCount =
    filterCategory.length + filterEventType.length + (filterDateFrom ? 1 : 0) + (filterDateTo ? 1 : 0) + filterInterests.length;

  const clearFilters = () => {
    setFilterCategory([]);
    setFilterEventType([]);
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterInterests([]);
  };

  // Filtered events
  const filtered = useMemo(() => {
    if (!events) return [];
    return events.filter((e) => {
      // Search
      if (search) {
        const q = search.toLowerCase();
        const match =
          e.title.toLowerCase().includes(q) ||
          (e.description?.toLowerCase().includes(q) ?? false) ||
          (e.club_name?.toLowerCase().includes(q) ?? false) ||
          (e.category?.toLowerCase().includes(q) ?? false) ||
          (e.sub_tags?.some((t: string) => t.toLowerCase().includes(q)) ?? false);
        if (!match) return false;
      }
      // Category
      if (filterCategory.length && !filterCategory.includes(e.category ?? "other")) return false;
      // Event type
      if (filterEventType.length && !filterEventType.includes(e.event_type)) return false;
      // Date range
      if (filterDateFrom) {
        if (new Date(e.start_time) < new Date(filterDateFrom)) return false;
      }
      if (filterDateTo) {
        const to = new Date(filterDateTo);
        to.setHours(23, 59, 59);
        if (new Date(e.start_time) > to) return false;
      }
      // Interest tags
      if (filterInterests.length > 0) {
        const eventTags = (e.sub_tags ?? []).map((t: string) => t.toLowerCase());
        const categoryMatch = filterInterests.includes(e.category?.toLowerCase() ?? "");
        const tagMatch = eventTags.some((t: string) => filterInterests.includes(t));
        if (!categoryMatch && !tagMatch) return false;
      }
      return true;
    });
  }, [events, search, filterCategory, filterEventType, filterDateFrom, filterDateTo, filterInterests]);

  // Calendar view helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDow = monthStart.getDay();

  const eventsOnDate = (date: Date) =>
    filtered.filter((e) => isSameDay(new Date(e.start_time), date));

  const displayEvents = selectedDate
    ? eventsOnDate(selectedDate)
    : view === "list"
    ? filtered
    : filtered;

  const toggleArrayFilter = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  return (
    <div className="pb-safe">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-card/80 backdrop-blur-2xl">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-extrabold font-display">Discover</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setView("calendar"); setSelectedDate(null); }}
              className={`rounded-lg p-2 transition-colors ${view === "calendar" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
            >
              <CalendarDays className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => { setView("list"); setSelectedDate(null); }}
              className={`rounded-lg p-2 transition-colors ${view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
            >
              <List className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button className="relative rounded-lg border border-border bg-card p-2 transition-colors hover:bg-secondary">
                <SlidersHorizontal className="h-4.5 w-4.5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle className="text-left">Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-5 pb-6">
                {/* Category */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setFilterCategory((p) => toggleArrayFilter(p, c))}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                          filterCategory.includes(c)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:bg-secondary"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event Type */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">Event Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {eventTypes.map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilterEventType((p) => toggleArrayFilter(p, t))}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          filterEventType.includes(t)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:bg-secondary"
                        }`}
                      >
                        {eventTypeLabels[t]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <h4 className="mb-2 text-sm font-medium text-muted-foreground">Date Range</h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">From</label>
                      <Input
                        type="date"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">To</label>
                      <Input
                        type="date"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* My Interests */}
                {myTags.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">Your Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {myTags.map((t) => (
                        <button
                          key={t}
                          onClick={() => setFilterInterests((p) => toggleArrayFilter(p, t))}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                            filterInterests.includes(t)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-foreground hover:bg-secondary"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button className="flex-1" onClick={() => setSheetOpen(false)}>
                    Show Results ({filtered.length})
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-4">
        {/* Calendar View */}
        {view === "calendar" && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))}
                className="rounded-lg p-2 hover:bg-secondary"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
              <button
                onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))}
                className="rounded-lg p-2 hover:bg-secondary"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

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
                const dayEvents = eventsOnDate(day);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(selected ? null : day)}
                    className={`relative flex flex-col items-center rounded-xl py-1.5 text-sm font-bold transition-all duration-300 ${
                      selected
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : today
                        ? "bg-primary/10 text-primary font-extrabold"
                        : "hover:bg-secondary"
                    }`}
                  >
                    {day.getDate()}
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-0.5 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((e) => (
                          <span
                            key={e.id}
                            className={`h-1 w-1 rounded-full ${
                              selected ? "bg-primary-foreground" : dotColor[e.event_type]
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Events Header */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {selectedDate
              ? format(selectedDate, "EEEE, MMM d")
              : `${filtered.length} event${filtered.length !== 1 ? "s" : ""}`}
          </h3>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Show all
            </button>
          )}
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="space-y-3 stagger-children">
            {[1, 2, 3].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : displayEvents.length ? (
          <div className="space-y-3 stagger-children">
            {displayEvents.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                isSaved={savedIds?.has(event.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title={search || activeFilterCount ? "No matching events" : "No events yet"}
            description={search || activeFilterCount ? "Try adjusting your filters or search terms." : "Check back later for new events."}
            action={search || activeFilterCount ? { label: "Clear Filters", onClick: () => { clearFilters(); setSearch(""); } } : undefined}
          />
        )}
      </div>
    </div>
  );
}
