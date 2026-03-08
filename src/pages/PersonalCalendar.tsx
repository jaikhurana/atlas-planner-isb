import { usePersonalEvents, useSavedEventIds, useToggleSave } from "@/hooks/useEvents";
import EventCard from "@/components/EventCard";

export default function PersonalCalendar() {
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
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-lg">
        <h1 className="text-lg font-bold">My Calendar</h1>
      </header>

      <main className="mx-auto max-w-lg space-y-6 px-4 py-5">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : (
          <>
            {mandatory.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Mandatory
                </h2>
                <div className="space-y-3">
                  {mandatory.map((e) => (
                    <EventCard key={e.id} {...e} isSaved={savedIds?.has(e.id)} onToggleSave={handleToggleSave} />
                  ))}
                </div>
              </section>
            )}

            {saved.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Saved Events
                </h2>
                <div className="space-y-3">
                  {saved.map((e) => (
                    <EventCard key={e.id} {...e} isSaved={savedIds?.has(e.id)} onToggleSave={handleToggleSave} />
                  ))}
                </div>
              </section>
            )}

            {privateEvents.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Private
                </h2>
                <div className="space-y-3">
                  {privateEvents.map((e) => (
                    <EventCard key={e.id} {...e} />
                  ))}
                </div>
              </section>
            )}

            {!events?.length && (
              <div className="rounded-lg border border-dashed border-border py-12 text-center">
                <p className="text-sm text-muted-foreground">Your calendar is empty</p>
                <p className="mt-1 text-xs text-muted-foreground">Save events or create private ones</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
