import { usePersonalEvents, useSavedEventIds, useToggleSave } from "@/hooks/useEvents";
import EventCard from "@/components/EventCard";
import EventCardSkeleton from "@/components/EventCardSkeleton";
import EmptyState from "@/components/EmptyState";
import { CalendarDays, Bookmark, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PersonalCalendar() {
  const navigate = useNavigate();
  const { data: events, isLoading } = usePersonalEvents();
  const { data: savedIds } = useSavedEventIds();
  const toggleSave = useToggleSave();

  const handleToggleSave = (id: string) => {
    toggleSave.mutate({ eventId: id, saved: savedIds?.has(id) ?? false });
  };

  const mandatory = events?.filter((e) => e.is_mandatory) ?? [];
  const saved = events?.filter((e) => !e.is_mandatory && e.event_type !== "private") ?? [];
  const privateEvents = events?.filter((e) => e.event_type === "private") ?? [];

  return (
    <div className="pb-safe">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/80 px-4 py-3 backdrop-blur-xl">
        <h1 className="text-lg font-bold font-display">My Calendar</h1>
      </header>

      <main className="mx-auto max-w-lg space-y-6 px-4 py-5">
        {isLoading ? (
          <div className="space-y-3 stagger-children">
            {[1, 2, 3].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {mandatory.length > 0 && (
              <section className="animate-fade-in">
                <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Mandatory
                </h2>
                <div className="space-y-3 stagger-children">
                  {mandatory.map((e) => (
                    <EventCard key={e.id} {...e} isSaved={savedIds?.has(e.id)} onToggleSave={handleToggleSave} />
                  ))}
                </div>
              </section>
            )}

            {saved.length > 0 && (
              <section className="animate-fade-in">
                <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Saved Events
                </h2>
                <div className="space-y-3 stagger-children">
                  {saved.map((e) => (
                    <EventCard key={e.id} {...e} isSaved={savedIds?.has(e.id)} onToggleSave={handleToggleSave} />
                  ))}
                </div>
              </section>
            )}

            {privateEvents.length > 0 && (
              <section className="animate-fade-in">
                <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Private
                </h2>
                <div className="space-y-3 stagger-children">
                  {privateEvents.map((e) => (
                    <EventCard key={e.id} {...e} />
                  ))}
                </div>
              </section>
            )}

            {!events?.length && (
              <EmptyState
                icon={CalendarDays}
                title="Your calendar is empty"
                description="Save events from the global calendar or create private ones to see them here."
                action={{ label: "Browse Events", onClick: () => navigate("/global") }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
