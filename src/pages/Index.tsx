import { useAuth } from "@/contexts/AuthContext";
import { useGlobalEvents, usePersonalEvents, useSavedEventIds, useToggleSave } from "@/hooks/useEvents";
import EventCard from "@/components/EventCard";
import EventCardSkeleton from "@/components/EventCardSkeleton";
import NextEventBanner from "@/components/NextEventBanner";
import WeekStrip from "@/components/WeekStrip";
import EmptyState from "@/components/EmptyState";
import { NotificationBell } from "@/components/NotificationPanel";
import FeatureTour from "@/components/FeatureTour";
import { Globe, CalendarPlus, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const { profile } = useAuth();
  const navigate = useNavigate();
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
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/80 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-sm">
              <Globe className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display leading-tight">Atlas</h1>
              <p className="text-xs text-muted-foreground">
                Hey, {profile?.full_name?.split(" ")[0] ?? "there"} 👋
              </p>
            </div>
          </div>
          <NotificationBell />
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 px-4 py-5">
        {/* 1. Next Event Banner */}
        {isLoading ? (
          <div className="h-36 animate-pulse-soft rounded-2xl bg-secondary" />
        ) : nextEvent ? (
          <NextEventBanner
            title={nextEvent.title}
            start_time={nextEvent.start_time}
            end_time={nextEvent.end_time}
            location={nextEvent.location}
            event_type={nextEvent.event_type}
          />
        ) : (
          <EmptyState
            icon={Sparkles}
            title="No upcoming events"
            description="Browse the global calendar to discover and save events that interest you."
            action={{ label: "Explore Events", onClick: () => navigate("/global") }}
          />
        )}

        {/* 2. Personal Calendar Week View */}
        <section>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Your Week
          </h2>
          <WeekStrip events={personalEvents ?? []} />
        </section>

        {/* 3. Upcoming Events Feed */}
        <section>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Upcoming Events
          </h2>
          {isLoading ? (
            <div className="space-y-3 stagger-children">
              {[1, 2, 3].map((i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : upcomingGlobal?.length ? (
            <div className="space-y-3 stagger-children">
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
            <EmptyState
              icon={CalendarPlus}
              title="No upcoming events"
              description="Create your first event or check back later for new happenings."
              action={{ label: "Create Event", onClick: () => navigate("/create") }}
            />
          )}
        </section>
      </main>

      <FeatureTour />
    </div>
  );
}
