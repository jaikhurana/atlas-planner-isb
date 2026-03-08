import { useAuth } from "@/contexts/AuthContext";
import { useGlobalEvents, usePersonalEvents, useSavedEventIds, useToggleSave } from "@/hooks/useEvents";
import EventCard from "@/components/EventCard";
import NextEventBanner from "@/components/NextEventBanner";
import WeekStrip from "@/components/WeekStrip";
import { NotificationBell } from "@/components/NotificationPanel";
import { Globe } from "lucide-react";

export default function Index() {
  const { profile } = useAuth();
  const { data: globalEvents, isLoading } = useGlobalEvents();
  const { data: personalEvents } = usePersonalEvents();
  const { data: savedIds } = useSavedEventIds();
  const toggleSave = useToggleSave();

  const now = new Date();
  const nextEvent = personalEvents
    ?.filter((e) => new Date(e.start_time) >= now)
    ?.[0];

  const upcomingGlobal = globalEvents
    ?.filter((e) => new Date(e.start_time) >= now)
    ?.slice(0, 10);

  const handleToggleSave = (id: string) => {
    toggleSave.mutate({ eventId: id, saved: savedIds?.has(id) ?? false });
  };

  return (
    <div className="pb-safe">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Globe className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Atlas</h1>
            <p className="text-xs text-muted-foreground">
              Hey, {profile?.full_name?.split(" ")[0] ?? "there"} 👋
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 px-4 py-5">
        {/* 1. Next Event Banner */}
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-xl bg-secondary" />
        ) : nextEvent ? (
          <NextEventBanner
            title={nextEvent.title}
            start_time={nextEvent.start_time}
            end_time={nextEvent.end_time}
            location={nextEvent.location}
            event_type={nextEvent.event_type}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border py-8 text-center">
            <p className="text-sm text-muted-foreground">No upcoming events on your calendar</p>
            <p className="mt-1 text-xs text-muted-foreground">Browse the global calendar to find events</p>
          </div>
        )}

        {/* 2. Personal Calendar Week View */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your Week
          </h2>
          <WeekStrip events={personalEvents ?? []} />
        </section>

        {/* 3. Upcoming Events Feed */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Upcoming Events
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-lg bg-secondary" />
              ))}
            </div>
          ) : upcomingGlobal?.length ? (
            <div className="space-y-3">
              {upcomingGlobal.map((event) => (
                <EventCard
                  key={event.id}
                  {...event}
                  isSaved={savedIds?.has(event.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border py-12 text-center">
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
